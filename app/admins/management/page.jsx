"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import axios from "axios";

export default function AdminManagement() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin management state
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [admins, setAdmins] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminListLoading, setAdminListLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [showAdmins, setShowAdmins] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setAuthenticated(authStatus);

      if (authStatus) {
        const role = getUserRole();
        if (role !== "admin") {
          router.push("/");
          return;
        }

        fetchAdmins();
      } else {
        router.push("/");
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Admin functions
  const fetchAdmins = async () => {
    setAdminListLoading(true);
    try {
      const response = await axios.get("/api/admins");
      setAdmins(response.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setAdminError("Failed to load admins");
    } finally {
      setAdminListLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError("");
    
    try {
      await axios.post("/api/admins", adminForm);
      alert("Admin added successfully!");
      setAdminForm({ name: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);
      
      let errorMessage = "Failed to add admin. Please try again.";
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setAdminError(errorMessage);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    
    try {
      await axios.delete(`/api/admins/${id}`);
      alert("Admin deleted successfully!");
      fetchAdmins();
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to delete admin.";
      alert(errorMessage);
      console.error("Delete Error:", err);
    }
  };



  const handleGoToDashboard = () => {
    router.push("/admins/dashboard");
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h1 className="page-title">Admin Management</h1>
        <button className="action-button secondary" onClick={handleGoToDashboard}>
          Back to Dashboard
        </button>
      </div>
      


      {/* Admin Management Section */}
      <div className="management-section">
        <h2>Admin Management</h2>
        
        {/* Add Admin Form */}
        <div className="form-container">
          <h3>Add New Admin</h3>
          {adminError && <div className="error-message">{adminError}</div>}
          <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Name"
              value={adminForm.name}
              onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={adminForm.email}
              onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={adminForm.password}
              onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
              required
              className="form-input"
            />
            <button 
              type="submit" 
              disabled={adminLoading}
              className="form-button"
            >
              {adminLoading ? 'Adding...' : 'Add Admin'}
            </button>
          </form>
        </div>

        {/* Admins List */}
        <div>
          <h3>Existing Admins</h3>
          <button 
            className="action-button secondary"
            onClick={() => setShowAdmins(!showAdmins)}
            style={{marginBottom: '1rem'}}
          >
            {showAdmins ? 'Hide Admins' : 'Show Admins'}
          </button>
          {showAdmins && (
            <>
              {adminListLoading ? (
                <p className="loading-text">Loading admins...</p>
              ) : admins.length === 0 ? (
                <p className="loading-text">No admins found.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin._id}>
                        <td>{admin.name}</td>
                        <td>{admin.email}</td>
                        <td>
                          <button 
                            onClick={() => handleAdminDelete(admin._id)}
                            className="action-button"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole, logout, getUserName, getUserId, getUserEmailFromToken } from "@/lib/auth";

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    database: "online",
    api: "online",
    storage: "online"
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

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

        const name = getUserName();
        setUserName(name);
        fetchAdminDetails();
        setAvatarUrl(`https://api.dicebear.com/7.x/identicon/svg?seed=${name}`);
        loadDashboardData();
      } else {
        router.push("/");
      }
      setLoading(false);
    };

    checkAuth();

    // Set up polling for real-time updates every 5 seconds
    const interval = setInterval(() => {
      if (isAuthenticated() && getUserRole() === "admin") {
        loadDashboardData();
      }
    }, 5000); // 5 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Load customers
      const customersRes = await fetch('/api/customers', { cache: 'no-cache' });
      const customersData = await customersRes.json();
      const customers = customersData.customers || [];

      // Load products
      const productsRes = await fetch('/api/products', { cache: 'no-cache' });
      const productsData = await productsRes.json();
      const productsList = productsData.products || [];

      // Load orders
      const ordersRes = await fetch('/api/orders', { cache: 'no-cache' });
      const ordersData = await ordersRes.json();
  const orders = ordersData.orders || [];

  // Keep full orders list in state for Order Management table
  setOrders(orders);

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

      setStats({
        totalCustomers: customers.length,
        totalProducts: productsList.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue
      });

      // Set recent customers (last 5)
      setRecentCustomers(customers.slice(-5).reverse());

  // Set recent orders (last 5)
  setRecentOrders(orders.slice(-5).reverse());

      // Set products for management
      setProducts(productsList);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fallback to mock data if APIs fail
      setStats({
        totalCustomers: 12,
        totalProducts: 4,
        totalOrders: 8,
        totalRevenue: 245.99
      });
      setRecentCustomers([
        { _id: 1, name: "John Doe", email: "john@example.com", createdAt: "2024-01-15" },
        { _id: 2, name: "Jane Smith", email: "jane@example.com", createdAt: "2024-01-14" }
      ]);
      setRecentOrders([
        {
          _id: "68f4b63b3ae925135bee75a5",
          name: "John Doe",
          address: "123 Main St",
          total: 89.99,
          status: "paid",
          createdAt: "2024-01-15T10:00:00.000Z",
          items: [
            {
              product: { _id: "68f11a905edeaf26a81723f8", name: "Classic White T-Shirt", price: 19.99 },
              qty: 2,
              size: "M"
            },
            {
              product: { _id: "68f11a905edeaf26a81723fa", name: "Black Skinny Jeans", price: 49.99 },
              qty: 1,
              size: "L"
            }
          ]
        },
        {
          _id: "68f36e4447d4daac48fb3bf9",
          name: "Jane Smith",
          address: "456 Oak Ave",
          total: 156.00,
          status: "pending",
          createdAt: "2024-01-14T15:30:00.000Z",
          items: [
            {
              product: { _id: "68f11a905edeaf26a81723f9", name: "Blue Denim Jacket", price: 69.99 },
              qty: 1,
              size: "L"
            },
            {
              product: { _id: "68f11a905edeaf26a81723fa", name: "Black Skinny Jeans", price: 49.99 },
              qty: 1,
              size: "M"
            }
          ]
        }
      ]);
      setProducts([
        { _id: "1", name: "Classic White T-Shirt", price: 19.99, stock: 50 },
        { _id: "2", name: "Blue Denim Jacket", price: 69.99, stock: 25 }
      ]);
    }
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    router.push("/");
  };

  const fetchAdminDetails = async () => {
    try {
      const email = getUserEmailFromToken();
      if (email) {
        setUserEmail(email);
      } else {
        const userId = getUserId();
        if (userId) {
          const res = await fetch(`/api/admins/${userId}`);
          if (res.ok) {
            const adminData = await res.json();
            setUserEmail(adminData.email);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching admin details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToManagement = () => {
    router.push("/admins/management");
  };

  const addNewProduct = async (productData) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        loadDashboardData(); // Refresh data
        alert('Product added successfully!');
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        loadDashboardData(); // Refresh data
        // Update selectedOrder if the modal is open for this order
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(updatedOrder.order);
        }
        alert('Order status updated successfully!');
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
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
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, <span className="admin-name">{userName}</span>!
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => loadDashboardData()}>
            Refresh Data
          </button>
          <button className="btn btn-secondary" onClick={handleGoToManagement}>
            Management
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
        <button
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalCustomers}</h3>
                <p className="stat-label">Total Customers</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalProducts}</h3>
                <p className="stat-label">Total Products</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.totalOrders}</h3>
                <p className="stat-label">Total Orders</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3 className="stat-number">${stats.totalRevenue.toFixed(2)}</h3>
                <p className="stat-label">Total Revenue</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-grid">
              <div className="activity-card">
                <h3>Recent Customers</h3>
                <div className="activity-list">
                  {recentCustomers.map((customer) => (
                    <div key={customer._id} className="activity-item">
                      <div className="activity-avatar">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">{customer.name}</p>
                        <span className="activity-meta">{customer.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="activity-card">
                <h3>Recent Orders</h3>
                <div className="activity-list">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="activity-item">
                      <div className="activity-avatar">🛒</div>
                      <div className="activity-content">
                        <p className="activity-text">Order by {order.name}</p>
                        <span className="activity-meta">${order.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="management-section">
          <h2 className="section-title">Customer Management</h2>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map((customer) => (
                  <tr key={customer._id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.dateJoined ? new Date(customer.dateJoined).toLocaleString() : 'N/A'}</td>
                    <td>
                      <button className="btn btn-small btn-primary">View</button>
                      <button className="btn btn-small btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="management-section">
          <div className="section-header">
            <h2 className="section-title">Product Management</h2>
            <button className="btn btn-primary" onClick={() => setActiveTab('add-product')}>
              Add New Product
            </button>
          </div>

          <div className="products-grid-admin">
            {products.map((product) => (
              <div key={product._id} className="product-card-admin">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">${product.price.toFixed(2)}</p>
                  <p className="product-stock">Stock: {product.stock || 'N/A'}</p>
                  <div className="product-actions">
                    <button className="btn btn-small btn-secondary">Edit</button>
                    <button className="btn btn-small btn-danger">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="management-section">
          <h2 className="section-title">Order Management</h2>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id?.slice(-6)}</td>
                    <td>{order.name}</td>
                    <td>${order.total?.toFixed(2)}</td>
                  <td><span className={`status-badge ${order.status || 'pending'}`}>{order.status || 'Pending'}</span></td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-small btn-primary"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleUpdateOrderStatus(order._id, order.status === 'paid' ? 'pending' : 'paid')}
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal/Form */}
      {activeTab === 'add-product' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Product</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                image: formData.get('image'),
                sizes: formData.get('sizes').split(',').map(s => s.trim())
              };
              addNewProduct(productData);
              setActiveTab('products');
            }}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" required></textarea>
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="number" name="price" step="0.01" required />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="url" name="image" required />
              </div>
              <div className="form-group">
                <label>Sizes (comma-separated)</label>
                <input type="text" name="sizes" placeholder="S,M,L,XL" required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('products')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-btn" onClick={() => setShowOrderModal(false)}>×</button>
            </div>
            <div className="order-details">
              <div className="order-info">
                <div className="info-row">
                  <span className="info-label">Order ID:</span>
                  <span className="info-value">#{selectedOrder._id?.slice(-6)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Customer:</span>
                  <span className="info-value">{selectedOrder.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Address:</span>
                  <span className="info-value">{selectedOrder.address}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge ${selectedOrder.status || 'pending'}`}>{selectedOrder.status || 'Pending'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Date:</span>
                  <span className="info-value">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total:</span>
                  <span className="info-value">${selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>
              <div className="order-items">
                <h3>Items Ordered</h3>
                <div className="items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="item-row">
                      <div className="item-info">
                        <span className="item-name">{item.product?.name || 'Unknown Product'}</span>
                        <span className="item-details">Qty: {item.qty} {item.size ? `| Size: ${item.size}` : ''}</span>
                      </div>
                      <span className="item-price">${item.product?.price ? (item.product.price * item.qty).toFixed(2) : 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

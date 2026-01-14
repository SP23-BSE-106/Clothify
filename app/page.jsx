"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole, logout, getUserName } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setAuthenticated(authStatus);

      if (authStatus) {
        const role = getUserRole();
        setUserRole(role);
        const name = getUserName();
        setUserName(name);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      setAuthenticated(true);
      setUserRole(data.user.role);
      setUserName(data.user.name);

      setTimeout(() => {
        if (data.user.role === "customer") {
          router.push("/shop");
        } else if (data.user.role === "admin") {
          router.push("/admins");
        }
      }, 100);
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const registrationData = { name, email, password, role };

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess("Account created successfully! You can now login.");
      setIsLogin(true);
      setName("");
      setEmail("");
      setPassword("");
      setRollNo("");
      setTeacherId("");
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong");
    }
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUserRole(null);
    setUserName("");
  };

  if (authenticated) {
    return (
      <div className="page-container modern-home">
        <div className="welcome-card">
          <div className="welcome-content">
            <img
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${userName}`}
              alt="Avatar"
              className="welcome-avatar"
            />
            <div className="welcome-text">
              <h1>Welcome back, {userName}!</h1>
              <p>
                You are logged in as a{" "}
                <span className="role-highlight">{userRole}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="dashboard-title">Your Dashboard</h2>
          <div className="dashboard-actions">
            {userRole === "student" && (
              <button
                onClick={() => router.push("/students/dashboard")}
                className="dashboard-button primary"
              >
                Go to Student Portal
              </button>
            )}

            {userRole === "teacher" && (
              <button
                onClick={() => router.push("/teachers")}
                className="dashboard-button primary"
              >
                Go to Teacher Portal
              </button>
            )}

            {userRole === "admin" && (
              <button
                onClick={() => router.push("/admins")}
                className="dashboard-button primary"
              >
                Go to Admin Portal
              </button>
            )}

            <button onClick={handleLogout} className="dashboard-button secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container modern-home">
      <div className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to{" "}
              <span className="hero-title-gradient">Clothify</span>
            </h1>
            <p className="hero-subtitle">
              Discover curated clothing and accessories. Browse, add to cart, and checkout in seconds.
            </p>
          </div>
        </section>

        {/* Auth Section */}
        <div className="auth-section">
          <div className="auth-container">
            <div className="auth-card">
              <div className="auth-header">
                <h2 className="auth-title">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="auth-description">
                  {isLogin
                    ? "Sign in to your account to continue"
                    : "Join us and start your shopping journey"}
                </p>
              </div>

              <div className="auth-tabs">
                <button
                  className={`auth-tab ${isLogin ? "active" : ""}`}
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab ${!isLogin ? "active" : ""}`}
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
              </div>

              <form
                onSubmit={isLogin ? handleLogin : handleRegister}
                className="auth-form"
              >
                {!isLogin && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className="form-input modern"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="form-input modern"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      placeholder="Enter your password"
                      className="form-input modern"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <div className="input-wrapper">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="form-select modern"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={false}
                >
                  <span className="button-text">
                    {isLogin ? "Sign In" : "Create Account"}
                  </span>
                  <div className="button-glow"></div>
                </button>
              </form>

              {error && (
                <div className="auth-message error">
                  <div className="message-icon">⚠️</div>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="auth-message success">
                  <div className="message-icon">✅</div>
                  <span>{success}</span>
                </div>
              )}

              <div className="auth-footer">
                <p>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    className="auth-link"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>

            <div className="auth-decoration">
              <div className="decoration-circle circle-1"></div>
              <div className="decoration-circle circle-2"></div>
              <div className="decoration-circle circle-3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

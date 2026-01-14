"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAuthenticated, getUserRole, logout } from "@/lib/auth";
import { useState, useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check authentication status on component mount and when pathname changes
    setAuthenticated(isAuthenticated());
    setUserRole(getUserRole());
  }, [pathname]);

  const isActive = (path) => {
    return pathname === path;
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUserRole(null);
  };

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <div className="nav-left">
          <Link href="/" className="nav-logo">
            Clothify
          </Link>

          <Link
            href="/shop"
            className={`nav-link ${isActive('/shop') ? 'active' : ''}`}
          >
            Shop
          </Link>

          <Link
            href="/cart"
            className={`nav-link ${isActive('/cart') ? 'active' : ''}`}
          >
            Cart
          </Link>
        </div>

        <div className="nav-right">
          {authenticated && userRole === "admin" && (
            <Link
              href="/admins"
              className={`nav-link ${isActive('/admins') ? 'active' : ''}`}
            >
              Admins
            </Link>
          )}



          {authenticated && (
            <button
              onClick={handleLogout}
              className="nav-link logout-button"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

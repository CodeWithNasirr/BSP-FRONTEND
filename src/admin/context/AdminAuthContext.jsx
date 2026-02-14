// src/context/AdminAuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { adminApi } from "../utils/api";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("adminUser");
    const token = localStorage.getItem("adminToken");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await adminApi.post("/login/", { username, password });
    const data = res.data;
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem(
      "adminUser",
      JSON.stringify({
        username: data.username,
        email: data.email,
        account_type: data.account_type,
        dashboard_type: data.dashboard_type,
        account_id: data.account_id,
      })
    );
    setUser({
      username: data.username,
      email: data.email,
      account_type: data.account_type,
      dashboard_type: data.dashboard_type,
      account_id: data.account_id,
    });
    return data;
  };

  const logout = async () => {
    try {
      await adminApi.post("/logout/");
    } catch {
      // ignore
    }
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setUser(null);
  };

  const isSuperAdmin = user?.account_type === "SUPER_ADMIN";
  const isSubAdmin = user?.account_type === "SUB_ADMIN";
  const isAuthenticated = !!user && !!localStorage.getItem("adminToken");

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isSuperAdmin,
        isSubAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
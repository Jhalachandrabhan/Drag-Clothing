import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/auth/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false); 
      });
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);

    const me = await api.get("/auth/me");
    setUser(me.data);

    return me.data; // 3. Return the user data so Login.jsx can use it
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
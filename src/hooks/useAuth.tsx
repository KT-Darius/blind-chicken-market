"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User, AuthContextType } from "@/types";
import axios from "axios"; // axios import

const AuthContext = createContext<AuthContextType | undefined>(undefined);

if (typeof window !== "undefined") {
  const token = localStorage.getItem("accessToken");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  });
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  });

  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    delete axios.defaults.headers.common["Authorization"];

    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

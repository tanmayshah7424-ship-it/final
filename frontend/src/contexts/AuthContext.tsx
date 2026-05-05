import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import api from "@/api/axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  loginWithGoogle: () => Promise<{ error: string | null }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await checkRedirectResult();
      await loadUser();
    };
    init();
  }, []);

  const checkRedirectResult = async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        setLoading(true);
        const firebaseUser = result.user;
        const res = await api.post("/auth/google", {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          googleId: firebaseUser.uid
        });
        const data = res.data;
        localStorage.setItem("token", data.token);
      }
    } catch (error) {
      console.error("Redirect Result Error:", error);
    }
  };

  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (error) {
      console.error("Failed to load user", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data;

      localStorage.setItem("token", data.token);
      // Fetch fresh user data to ensure role is correct
      await loadUser();
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data?.message || err.message || "Login failed" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      const data = res.data;

      localStorage.setItem("token", data.token);
      await loadUser();
      return { error: null };
    } catch (err: any) {
      return { error: err.response?.data?.message || err.message || "Registration failed" };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const res = await api.post("/auth/google", {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        googleId: firebaseUser.uid
      });
      const data = res.data;

      localStorage.setItem("token", data.token);
      await loadUser();
      return { error: null };
    } catch (err: any) {
      console.error("Google Login Error:", err);
      
      if (err.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return { error: null };
        } catch (redirectErr: any) {
          return { error: "Popup blocked and redirect failed. Please allow popups for this site." };
        }
      }

      if (err.code === 'auth/popup-closed-by-user') {
        return { error: null }; // User closed it intentionally, no need to show an error
      }
      
      return { error: err.response?.data?.message || err.message || "Google login failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isSuperAdmin = user?.role === "superadmin";

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isSuperAdmin, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return { ...ctx, isAdmin: ctx.user?.role === "admin" || ctx.user?.role === "superadmin", isSuperAdmin: ctx.user?.role === "superadmin" };
}


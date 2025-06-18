import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type User = {
  id: number;
  username: string;
  userType: "tenant" | "landlord";
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  loginMutation: any;
  registerMutation: any;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const fetchUser = async () => {
    const res = await fetch("/api/user", {
      credentials: "include",
    });
    if (!res.ok) return null;
    return await res.json();
  };

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await fetch("/api/login", {
        method: "POST",
        body: new URLSearchParams({ username, password }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: async () => {
      const data = await fetchUser();
      setUser(data);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (registerData: any) => {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(registerData),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: async () => {
      const data = await fetchUser();
      setUser(data);
    },
  });

  const logout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  useEffect(() => {
    fetchUser().then(setUser).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginMutation, registerMutation, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

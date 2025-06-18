import { useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation(user.userType === "landlord" ? "/" : "/tenant-portal");
    }
  }, [user, setLocation]);

  return (
    <div className="flex justify-center items-center h-screen">
      <h1 className="text-2xl font-bold">Auth Page Placeholder</h1>
      {/* Add your login/register form here */}
    </div>
  );
}

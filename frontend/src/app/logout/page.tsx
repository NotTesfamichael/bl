"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";
import Link from "next/link";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    // Auto-logout after 3 seconds
    const timer = setTimeout(() => {
      logout();
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [logout, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <LogOut className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-black mb-4">Logging Out</h1>

          <p className="text-gray-600 mb-6">
            You will be automatically logged out in a few seconds...
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout Now
            </Button>

            <Button variant="outline" onClick={handleCancel} className="w-full">
              Cancel
            </Button>

            <Button variant="ghost" asChild className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        toast.error("Authentication failed. Please try again.");
        router.push("/login");
        return;
      }

      if (!token) {
        toast.error("No authentication token received.");
        router.push("/login");
        return;
      }

      try {
        await handleGoogleCallback(token);
        toast.success("Successfully signed in with Google!");
        router.push("/writer");
      } catch (error) {
        console.error("Google callback error:", error);
        toast.error("Failed to complete authentication.");
        router.push("/login");
      }
    };

    handleCallback();
  }, [searchParams, handleGoogleCallback, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

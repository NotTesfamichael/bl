"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Component to clear invalid authentication tokens
 * This helps resolve issues when JWT_SECRET changes
 */
export function TokenClearer() {
  const { logout } = useAuth();

  useEffect(() => {
    // Clear any invalid tokens on component mount
    const clearInvalidTokens = () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          // Try to decode the token to see if it's valid
          const parts = token.split(".");
          if (parts.length !== 3) {
            // Invalid token format, clear it
            localStorage.removeItem("auth_token");
            logout();
          }
        }
      } catch (error) {
        // If there's any error, clear the token
        localStorage.removeItem("auth_token");
        logout();
      }
    };

    clearInvalidTokens();
  }, [logout]);

  return null; // This component doesn't render anything
}

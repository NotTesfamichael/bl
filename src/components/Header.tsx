"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-[#F5F0E1] border-b border-[#D4C4A8]">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              <Link href="/" className="hover:text-[#556B2F] transition-colors">
                Notes & Code Blog
              </Link>
            </h1>
            <p className="text-black text-sm sm:text-base">
              Share your thoughts and code with the world
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {session ? (
              <>
                <Link href="/writer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Write</span>
                    <span className="sm:hidden">Write</span>
                  </Button>
                </Link>
                <Link href="/logout">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden">Logout</span>
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

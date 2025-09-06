"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Plus, LogOut } from "lucide-react";
import Link from "next/link";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-[#F5F0E1] border-b border-[#D4C4A8]">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">
              <Link href="/" className="hover:text-[#556B2F] transition-colors">
                Notes & Code Blog
              </Link>
            </h1>
            <p className="text-black">
              Share your thoughts and code with the world
            </p>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/writer">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Write
                  </Button>
                </Link>
                <Link href="/logout">
                  <Button variant="outline">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

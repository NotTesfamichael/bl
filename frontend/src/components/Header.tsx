"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { UserDropdown } from "@/components/UserDropdown";
import { useLoginModal } from "@/contexts/LoginModalContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  blogPostActions?: React.ReactNode;
}

export function Header({ blogPostActions }: HeaderProps = {}) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { openLoginModal } = useLoginModal();

  // Check if we're on a blog post page
  const isBlogPost = pathname.startsWith("/p/");

  useEffect(() => {
    if (!isBlogPost) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      }
      // Hide header when scrolling down (but not at the very top)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isBlogPost]);

  return (
    <header
      className={`bg-[#F5F0E1] border-b border-[#D4C4A8] transition-transform duration-300 ease-in-out ${
        isBlogPost
          ? `fixed top-0 left-0 right-0 z-50 ${
              isVisible ? "translate-y-0" : "-translate-y-full"
            }`
          : "sticky top-0 z-50"
      }`}
    >
      <div className="container mx-auto px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-black">
              <Link href="/" className="hover:text-[#556B2F] transition-colors">
                kiyadur
              </Link>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isBlogPost && blogPostActions && (
              <div className="mr-2">{blogPostActions}</div>
            )}
            {isAuthenticated ? (
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
                <UserDropdown />
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={openLoginModal}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

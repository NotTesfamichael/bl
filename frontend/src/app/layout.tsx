import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoginModalProvider } from "@/contexts/LoginModalContext";
import { Toaster } from "@/components/ui/sonner";
import { TokenClearer } from "@/components/TokenClearer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap"
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "kiyadur",
  description: "Share your thoughts and code with the world"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <LoginModalProvider>
            <TokenClearer />
            {children}
            <Toaster />
          </LoginModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

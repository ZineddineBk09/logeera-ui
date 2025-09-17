import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SocketProvider } from "@/components/socket/SocketProvider";

export const metadata: Metadata = {
  title: "RideShare - Your Journey Starts Here",
  description: "Modern ride-sharing platform connecting travelers and drivers",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <SocketProvider>
                <AppShell>{children}</AppShell>
              </SocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </Suspense>
        <Analytics />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

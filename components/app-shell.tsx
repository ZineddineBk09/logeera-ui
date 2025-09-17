"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "./navbar";
import { useAuth } from "@/lib/hooks/use-auth";
import { Search, MapPin, Car, FileText, MessageCircle, Settings } from "lucide-react";
import { ROUTES } from "@/constants";

const navigation = [
  { name: "Home", href: "/", icon: Search },
  { name: "Trips", href: "/trips", icon: MapPin },
  { name: "Publish", href: "/publish", icon: Car },
  { name: "Requests", href: "/requests", icon: FileText },
  { name: "Chats", href: "/chats", icon: MessageCircle },
  { name: "Admin", href: "/admin", icon: Settings },
];

const publicNavigation = [
  { name: "Home", href: "/", icon: Search },
  { name: "Trips", href: "/trips", icon: MapPin },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const currentNavigation = isAuthenticated ? navigation : publicNavigation;

  // Hide navbar on auth pages
  const isAuthPage = pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Top Navigation - Hidden on auth pages */}
      {!isAuthPage && <Navbar />}

      {/* Main Content */}
      <main className="flex-1 w-full">{children}</main>

      {/* Footer - Hidden on auth pages */}
      {!isAuthPage && (
        <footer className="w-full border-t bg-background/95">
          <div className="container mx-auto px-4 py-8 grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <Logo className="h-7 w-24" />
              <p className="text-sm text-muted-foreground">
                RideShare helps you find trusted rides and share journeys
                sustainably.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Company</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  <Link href="/help">Support</Link>
                </li>
                <li>
                  <Link href="#">About</Link>
                </li>
                <li>
                  <Link href="#">Terms</Link>
                </li>
                <li>
                  <Link href="#">Privacy</Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Product</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  <Link href="/trips">Browse Trips</Link>
                </li>
                <li>
                  <Link href="/publish">Publish a Trip</Link>
                </li>
                <li>
                  <Link href="/requests">Requests</Link>
                </li>
                <li>
                  <Link href="/chats">Chats</Link>
                </li>
              </ul>
            </div>
          </div>
          <Separator />
          <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground flex justify-between">
            <span>© {new Date().getFullYear()} RideShare. All rights reserved.</span>
            <span>
              Built with <span aria-hidden>❤️</span> using Next.js & shadcn/ui
            </span>
          </div>
        </footer>
      )}

      {/* Mobile Bottom Navigation - Hidden on auth pages */}
      {!isAuthPage && (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex items-center justify-around py-2">
            {currentNavigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      )}

      {/* Mobile Bottom Padding - Only when mobile nav is shown */}
      {!isAuthPage && <div className="md:hidden h-16" />}
    </div>
  );
}

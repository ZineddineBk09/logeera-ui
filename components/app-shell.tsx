'use client';

import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { Separator } from '@/components/ui/separator';
import { Navbar } from './navbar';
import { PWAInstallPrompt } from './pwa-install-prompt';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRequestsCount } from '@/lib/hooks/use-requests-count';
import {
  Search,
  MapPin,
  Car,
  FileText,
  MessageCircle,
  Settings,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants';

const baseNavigation = [
  { name: 'Home', href: '/', icon: Search },
  { name: 'Trips', href: '/trips', icon: MapPin },
  { name: 'Add Trip', href: '/publish', icon: Car },
  { name: 'Requests', href: '/requests', icon: FileText },
  { name: 'Chats', href: '/chats', icon: MessageCircle },
];

const adminNavigation = [{ name: 'Admin', href: '/admin', icon: Settings }];

const publicNavigation = [
  { name: 'Home', href: '/', icon: Search },
  { name: 'Trips', href: '/trips', icon: MapPin },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { totalRequests } = useRequestsCount();
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  // Build navigation based on user role
  let currentNavigation = publicNavigation;
  if (isAuthenticated) {
    currentNavigation = [...baseNavigation];
    if (isAdmin) {
      currentNavigation = [...currentNavigation, ...adminNavigation];
    }
  }

  // Hide navbar on auth pages and admin pages
  const isAuthPage = pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER;
  const isAdminPage = pathname?.startsWith('/admin') || false;
  const isHomePage = pathname === ROUTES.HOME;

  return (
    <div className="bg-background flex min-h-screen flex-col items-center">
      {/* Top Navigation - Hidden on auth pages and admin pages */}
      {!isAuthPage && !isAdminPage && <Navbar />}

      {/* Main Content */}
      <main className="w-full flex-1">{children}</main>

      {/* Footer - Hidden on auth pages and admin pages */}
      {isHomePage && (
        <footer className="bg-background/95 w-full border-t">
          <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-4">
            <div className="space-y-3">
              <Logo className="h-7 w-24" />
              <p className="text-muted-foreground text-sm">
                Logeera connects travelers, making journeys safer, more
                affordable, and sustainable through trusted ridesharing.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Platform</h4>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link
                    href="/trips"
                    className="hover:text-foreground transition-colors"
                  >
                    Browse Trips
                  </Link>
                </li>
                <li>
                  <Link
                    href="/publish"
                    className="hover:text-foreground transition-colors"
                  >
                    Add a Trip
                  </Link>
                </li>
                <li>
                  <Link
                    href="/drivers"
                    className="hover:text-foreground transition-colors"
                  >
                    Trusted Drivers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/requests"
                    className="hover:text-foreground transition-colors"
                  >
                    My Requests
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Support</h4>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/safety"
                    className="hover:text-foreground transition-colors"
                  >
                    Safety Guidelines
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-foreground transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="hover:text-foreground transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community"
                    className="hover:text-foreground transition-colors"
                  >
                    Community Guidelines
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <Separator />
          <div className="text-muted-foreground container mx-auto flex justify-between px-4 py-4 text-xs">
            <span>
              © {new Date().getFullYear()} Logeera. All rights reserved.
            </span>
            {/* <span>
              Built with <span aria-hidden>❤️</span> using Next.js & shadcn/ui
            </span> */}
          </div>
        </footer>
      )}

      {/* Mobile Bottom Navigation - Hidden on auth pages and admin pages */}
      {!isAuthPage && !isAdminPage && (
        <nav className="bg-background fixed right-0 bottom-0 left-0 z-50 border-t md:hidden">
          <div className="flex items-center justify-around py-2">
            {currentNavigation.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const showBadge = item.name === 'Requests' && totalRequests > 0;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex flex-col items-center space-y-1 p-2 transition-colors ${
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {showBadge && (
                      <Badge
                        variant="secondary"
                        className="absolute -right-2 -top-2 h-4 min-w-4 px-1 text-[10px]"
                      >
                        {totalRequests > 99 ? '99+' : totalRequests}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Mobile Bottom Padding - Only when mobile nav is shown */}
      {!isAuthPage && !isAdminPage && <div className="h-16 md:hidden" />}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

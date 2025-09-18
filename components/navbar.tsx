'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Menu,
  Search,
  User,
  MapPin,
  Car,
  MessageCircle,
  FileText,
  Settings,
  LogOut,
  Star,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from './logo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/hooks/use-auth';
import { ROUTES } from '@/constants';

const baseNavigation = [
  { name: 'Home', href: '/', icon: Search },
  { name: 'Trips', href: '/trips', icon: MapPin },
  { name: 'Publish', href: '/publish', icon: Car },
  { name: 'Requests', href: '/requests', icon: FileText },
  { name: 'Chats', href: '/chats', icon: MessageCircle },
];

const adminNavigation = [{ name: 'Admin', href: '/admin', icon: Settings }];

const publicNavigation = [
  { name: 'Home', href: '/', icon: Search },
  { name: 'Trips', href: '/trips', icon: MapPin },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openQuickSearch, setOpenQuickSearch] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.LOGIN);
  };

  const handleQuickSearch = () => {
    // TODO: Implement quick search functionality
    setOpenQuickSearch(false);
  };

  return (
    <>
      {/* Top Navigation */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="flex h-16 w-full items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-12 w-28" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 md:flex">
            {currentNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`hover:text-primary flex items-center space-x-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Search - Only for authenticated users */}
          {isAuthenticated && (
            <div className="mx-8 hidden min-w-sm items-center space-x-2 lg:flex">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Quick search..."
                  className="bg-muted/50 pl-10"
                  onFocus={() => setOpenQuickSearch(true)}
                />
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="/diverse-user-avatars.png"
                          alt="User"
                        />
                        <AvatarFallback>
                          {user?.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-muted-foreground w-[200px] truncate text-sm">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={ROUTES.PROFILE} className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Login/Register buttons for unauthenticated users */
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href={ROUTES.LOGIN}>Login</Link>
                </Button>
                <Button asChild>
                  <Link href={ROUTES.REGISTER}>Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="mt-8 flex flex-col space-y-4">
                  {currentNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`hover:text-primary flex items-center space-x-3 rounded-lg p-2 text-sm font-medium transition-colors ${
                          pathname === item.href
                            ? 'text-primary bg-primary/10'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}

                  {!isAuthenticated && (
                    <div className="border-t pt-4">
                      <Button variant="outline" asChild className="mb-2 w-full">
                        <Link href={ROUTES.LOGIN}>Login</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href={ROUTES.REGISTER}>Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Quick Search Dialog - Only for authenticated users */}
      {isAuthenticated && (
        <Dialog open={openQuickSearch} onOpenChange={setOpenQuickSearch}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Search trips</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="text-muted-foreground mb-1 text-xs">From</div>
                <Input placeholder="Origin city" />
              </div>
              <div className="md:col-span-2">
                <div className="text-muted-foreground mb-1 text-xs">To</div>
                <Input placeholder="Destination city" />
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-xs">Date</div>
                <Input type="date" />
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-xs">
                  Vehicle
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="bike">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-xs">
                  Capacity
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-2 flex justify-end gap-2 md:col-span-4">
                <Button
                  variant="outline"
                  onClick={() => setOpenQuickSearch(false)}
                  className="bg-transparent"
                >
                  Cancel
                </Button>
                <Button onClick={handleQuickSearch}>Search</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

import Link from 'next/link';
import { MapPin, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="from-primary/5 via-background to-accent/5 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <Card className="bg-card/90 w-full max-w-2xl border-0 shadow-xl backdrop-blur">
        <CardContent className="space-y-8 p-12 text-center">
          {/* 404 Illustration */}
          <div className="relative">
            <div className="text-primary/20 text-8xl font-bold select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/10 rounded-full p-6">
                <MapPin className="text-primary h-16 w-16" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-foreground text-3xl font-bold">
              Route Not Found
            </h1>
            <p className="text-muted-foreground mx-auto max-w-md text-lg text-balance">
              Looks like you've taken a wrong turn. The page you're looking for
              doesn't exist on our platform.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="text-base font-semibold">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent text-base"
            >
              <Link href="/trips">
                <Search className="mr-2 h-4 w-4" />
                Find Rides
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="border-t pt-6">
            <p className="text-muted-foreground text-sm">
              Need help? Contact our support team or try searching for rides in
              your area.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

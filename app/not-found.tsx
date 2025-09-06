import Link from "next/link";
import { MapPin, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl border-0 bg-card/90 backdrop-blur">
        <CardContent className="p-12 text-center space-y-8">
          {/* 404 Illustration */}
          <div className="relative">
            <div className="text-8xl font-bold text-primary/20 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/10 rounded-full p-6">
                <MapPin className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              Route Not Found
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto text-balance">
              Looks like you've taken a wrong turn. The page you're looking for
              doesn't exist on our platform.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              className="text-base bg-transparent"
            >
              <Link href="/trips">
                <Search className="mr-2 h-4 w-4" />
                Find Rides
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Need help? Contact our support team or try searching for rides in
              your area.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

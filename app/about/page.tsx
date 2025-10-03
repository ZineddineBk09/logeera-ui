import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Globe, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Logeera - Logistics Era. Our mission to connect travelers, reduce costs, and promote sustainable transportation across Africa.',
  keywords: [
    'about logeera',
    'logistics era',
    'rideshare platform',
    'mission',
    'sustainable transportation',
    'Africa rideshare',
  ],
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">About Logeera</h1>
        <p className="text-muted-foreground text-xl">
          Revolutionizing transportation across Africa
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Logeera (Logistics Era) is dedicated to connecting travelers and transforming
              transportation across Africa. We believe in the power of shared journeys to
              reduce costs, minimize environmental impact, and build stronger communities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Safety First
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your safety is our top priority. We verify all drivers, maintain a trusted
              community through our rating system, and provide 24/7 support to ensure every
              journey is secure and reliable.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Sustainable Travel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By sharing rides and optimizing routes, we help reduce carbon emissions and
              contribute to a greener future. Every shared trip makes a difference for our
              planet.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Community Driven
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We're more than just a platform - we're a community. Connect with fellow
              travelers, share experiences, and be part of a movement that's making
              transportation more accessible and affordable for everyone.
            </p>
          </CardContent>
        </Card>

        <div className="mt-12 rounded-lg bg-primary/10 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Join Our Journey</h2>
          <p className="text-muted-foreground mb-6">
            Whether you're looking to share a ride or offer one, Logeera is here to make
            your journey better. Together, we're building the future of transportation.
          </p>
        </div>
      </div>
    </div>
  );
}


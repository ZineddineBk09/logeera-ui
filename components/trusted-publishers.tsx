import { Star, Shield, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const publishers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    rating: 4.9,
    trips: 127,
    image: '/woman-driver.png',
    route: 'NYC → Boston',
    vehicle: 'Honda Accord',
    trusted: true,
  },
  {
    id: '2',
    name: 'Mike Chen',
    rating: 4.8,
    trips: 89,
    image: '/man-driver.jpg',
    route: 'LA → San Diego',
    vehicle: 'Toyota Camry',
    trusted: true,
  },
  {
    id: '3',
    name: 'Emma Davis',
    rating: 5.0,
    trips: 203,
    image: '/woman-driver-professional.jpg',
    route: 'Chicago → Milwaukee',
    vehicle: 'Tesla Model 3',
    trusted: true,
  },
];

export function TrustedPublishers() {
  return (
    <section className="space-y-12">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-bold text-balance md:text-4xl">
          Trusted by Thousands
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-balance">
          Join our community of verified drivers and passengers who prioritize
          safety and reliability.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {publishers.map((publisher, index) => (
          <Card
            key={index}
            className="group bg-card/50 rounded-3xl border-1 border-gray-200 transition-all duration-300 hover:shadow-lg dark:border-gray-700"
          >
            <CardContent className="flex flex-col items-center space-y-4 p-6">
              <div className="flex w-full justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={publisher.image || '/placeholder.svg'}
                      alt={publisher.name}
                    />
                    <AvatarFallback>
                      {publisher.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{publisher.name}</h3>
                      {publisher.trusted && (
                        <Badge
                          variant="secondary"
                          className="bg-opacity-50 rounded-full text-xs"
                        >
                          <Shield className="mr-1 h-3 w-3" />
                          Trusted
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground flex items-center space-x-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{publisher.rating}</span>
                      <span>•</span>
                      <span>{publisher.trips} trips</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Popular Route</span>
                  <span className="font-medium">{publisher.route}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vehicle</span>
                  <div className="flex items-center space-x-1">
                    <Car className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">{publisher.vehicle}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/drivers/${publisher.id}`}
                className="bg-primary text-primary-foreground mx-auto w-32 rounded-full px-4 py-2"
              >
                View Profile
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button size="lg" variant="outline">
          View All Trusted Drivers
        </Button>
      </div>
    </section>
  );
}

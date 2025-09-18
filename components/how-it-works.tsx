import { Search, Users, MapPin, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    icon: Search,
    title: 'Search & Discover',
    description:
      'Find rides that match your route, schedule, and preferences from trusted drivers.',
  },
  {
    icon: Users,
    title: 'Connect & Request',
    description:
      'Send requests to join rides and chat with drivers to coordinate pickup details.',
  },
  {
    icon: MapPin,
    title: 'Travel Together',
    description:
      'Meet at the agreed location and enjoy a safe, comfortable journey to your destination.',
  },
  {
    icon: Star,
    title: 'Rate & Review',
    description:
      'Share your experience and help build a trusted community of travelers.',
  },
];

export function HowItWorks() {
  return (
    <section className="space-y-12">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl font-bold text-balance md:text-4xl">
          How It Works
        </h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-balance">
          Getting started is simple. Follow these easy steps to find your
          perfect ride.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card
              key={index}
              className="group bg-card/50 relative rounded-3xl border-1 border-gray-200 transition-all duration-300 hover:shadow-lg dark:border-gray-700"
            >
              <CardContent className="space-y-4 p-6 text-center">
                <div className="relative">
                  <div className="bg-primary/10 group-hover:bg-primary/20 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition-colors">
                    <Icon className="text-primary h-8 w-8" />
                  </div>
                  <div className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-balance">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

import { Search, Users, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description:
      "Find rides that match your route, schedule, and preferences from trusted drivers.",
  },
  {
    icon: Users,
    title: "Connect & Request",
    description:
      "Send requests to join rides and chat with drivers to coordinate pickup details.",
  },
  {
    icon: MapPin,
    title: "Travel Together",
    description:
      "Meet at the agreed location and enjoy a safe, comfortable journey to your destination.",
  },
  {
    icon: Star,
    title: "Rate & Review",
    description:
      "Share your experience and help build a trusted community of travelers.",
  },
];

export function HowItWorks() {
  return (
    <section className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-balance">
          How It Works
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          Getting started is simple. Follow these easy steps to find your
          perfect ride.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card
              key={index}
              className="relative group hover:shadow-lg transition-all duration-300 border-0 bg-card/50"
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
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

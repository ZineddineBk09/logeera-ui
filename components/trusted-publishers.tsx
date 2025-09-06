import { Star, Shield, Car } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const publishers = [
  {
    name: "Sarah Johnson",
    rating: 4.9,
    trips: 127,
    image: "/woman-driver.png",
    route: "NYC → Boston",
    vehicle: "Honda Accord",
    trusted: true,
  },
  {
    name: "Mike Chen",
    rating: 4.8,
    trips: 89,
    image: "/man-driver.jpg",
    route: "LA → San Diego",
    vehicle: "Toyota Camry",
    trusted: true,
  },
  {
    name: "Emma Davis",
    rating: 5.0,
    trips: 203,
    image: "/woman-driver-professional.jpg",
    route: "Chicago → Milwaukee",
    vehicle: "Tesla Model 3",
    trusted: true,
  },
]

export function TrustedPublishers() {
  return (
    <section className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-balance">Trusted by Thousands</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          Join our community of verified drivers and passengers who prioritize safety and reliability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {publishers.map((publisher, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={publisher.image || "/placeholder.svg"} alt={publisher.name} />
                    <AvatarFallback>
                      {publisher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{publisher.name}</h3>
                      {publisher.trusted && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Trusted
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{publisher.rating}</span>
                      <span>•</span>
                      <span>{publisher.trips} trips</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Popular Route</span>
                  <span className="font-medium">{publisher.route}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Vehicle</span>
                  <div className="flex items-center space-x-1">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{publisher.vehicle}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
              >
                View Profile
              </Button>
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
  )
}

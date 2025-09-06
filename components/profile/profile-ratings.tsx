"use client";

import { Star, ThumbsUp, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const mockRatings = [
  {
    id: "1",
    rating: 5,
    text: "John was an excellent driver! Very punctual, friendly, and the car was spotless. Great conversation during the trip. Highly recommend!",
    author: "Sarah M.",
    date: "2024-01-10",
    tripRoute: "New York → Boston",
    role: "as Driver",
    helpful: 12,
  },
  {
    id: "2",
    rating: 5,
    text: "Safe driver, comfortable ride, and exactly on time. John made the long journey enjoyable with good music and interesting conversation.",
    author: "Mike R.",
    date: "2024-01-08",
    tripRoute: "Boston → New York",
    role: "as Driver",
    helpful: 8,
  },
  {
    id: "3",
    rating: 4,
    text: "Good trip overall. John was professional and the car was clean. Only minor issue was we left 15 minutes late due to traffic.",
    author: "Emma L.",
    date: "2024-01-05",
    tripRoute: "New York → Philadelphia",
    role: "as Driver",
    helpful: 5,
  },
  {
    id: "4",
    rating: 5,
    text: "Great passenger! John was on time, respectful, and easy to talk to. Would definitely give him a ride again.",
    author: "David K.",
    date: "2024-01-03",
    tripRoute: "Philadelphia → New York",
    role: "as Passenger",
    helpful: 3,
  },
];

const ratingDistribution = [
  { stars: 5, count: 67, percentage: 75 },
  { stars: 4, count: 18, percentage: 20 },
  { stars: 3, count: 3, percentage: 3 },
  { stars: 2, count: 1, percentage: 1 },
  { stars: 1, count: 0, percentage: 0 },
];

interface ProfileRatingsProps {
  userId: string;
}

export function ProfileRatings({ userId }: ProfileRatingsProps) {
  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center space-y-4">
              <div className="text-5xl font-bold">4.8</div>
              <div className="flex items-center justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-6 h-6 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <div className="text-muted-foreground">89 total reviews</div>
            </div>

            <div className="space-y-3">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center space-x-3">
                  <span className="w-12 text-sm">{item.stars} star</span>
                  <Progress value={item.percentage} className="flex-1 h-2" />
                  <span className="w-12 text-sm text-muted-foreground">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reviews Received</CardTitle>
            <div className="flex items-center space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All reviews</SelectItem>
                  <SelectItem value="driver">As driver</SelectItem>
                  <SelectItem value="passenger">As passenger</SelectItem>
                  <SelectItem value="recent">Most recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockRatings.map((review) => (
              <div
                key={review.id}
                className="space-y-4 pb-6 border-b last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm">
                        {review.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{review.author}</span>
                        <Badge variant="outline" className="text-xs">
                          {review.role}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span>•</span>
                        <span>
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{review.tripRoute}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed pl-13">{review.text}</p>

                <div className="flex items-center space-x-2 pl-13">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Helpful ({review.helpful})
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="outline">Load More Reviews</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

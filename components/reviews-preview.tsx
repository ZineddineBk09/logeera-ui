"use client"

import { Star, ThumbsUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const mockReviews = [
  {
    id: "1",
    rating: 5,
    text: "Sarah was an excellent driver! Very punctual, friendly, and the car was spotless. Great conversation during the trip. Highly recommend!",
    author: "Mike R.",
    date: "2024-01-10",
    helpful: 12,
  },
  {
    id: "2",
    rating: 5,
    text: "Safe driver, comfortable ride, and exactly on time. Sarah made the long journey enjoyable with good music and interesting conversation.",
    author: "Emma L.",
    date: "2024-01-08",
    helpful: 8,
  },
  {
    id: "3",
    rating: 4,
    text: "Good trip overall. Car was clean and Sarah was professional. Only minor issue was we left 15 minutes late due to traffic.",
    author: "David K.",
    date: "2024-01-05",
    helpful: 5,
  },
]

const ratingDistribution = [
  { stars: 5, count: 98, percentage: 77 },
  { stars: 4, count: 23, percentage: 18 },
  { stars: 3, count: 4, percentage: 3 },
  { stars: 2, count: 2, percentage: 2 },
  { stars: 1, count: 0, percentage: 0 },
]

interface ReviewsPreviewProps {
  publisherId: string
}

export function ReviewsPreview({ publisherId }: ReviewsPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Reviews & Ratings</CardTitle>
          <Button variant="outline" size="sm">
            View All Reviews
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold">4.9</div>
            <div className="flex items-center justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">127 reviews</div>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center space-x-3 text-sm">
                <span className="w-8">{item.stars}★</span>
                <Progress value={item.percentage} className="flex-1 h-2" />
                <span className="w-8 text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="space-y-4">
          <h4 className="font-semibold">Recent Reviews</h4>
          {mockReviews.map((review) => (
            <div key={review.id} className="space-y-3 pb-4 border-b last:border-b-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {review.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{review.author}</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{review.text}</p>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Helpful ({review.helpful})
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

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


interface ProfileRatingsProps {
  userId: string;
  ratings: any[];
}

export function ProfileRatings({ userId, ratings }: ProfileRatingsProps) {
  // Calculate average rating and distribution
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum: number, rating: any) => sum + rating.value, 0) / ratings.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = ratings.filter((rating: any) => rating.value === stars).length;
    const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
    return { stars, count, percentage };
  });
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
              <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <div className="text-muted-foreground">{ratings.length} total reviews</div>
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
          {ratings.length > 0 ? (
            <div className="space-y-6">
              {ratings.map((review: any) => (
                <div
                  key={review.id}
                  className="space-y-4 pb-6 border-b last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm">
                          {review.reviewerUser?.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{review.reviewerUser?.name || "Anonymous"}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.value
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-sm leading-relaxed pl-13">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No reviews received yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

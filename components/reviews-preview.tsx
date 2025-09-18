'use client';

import { Star, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RatingsService } from '@/lib/services';
import { swrKeys } from '@/lib/swr-config';
import useSWR from 'swr';

interface ReviewsPreviewProps {
  publisherId: string;
}

export function ReviewsPreview({ publisherId }: ReviewsPreviewProps) {
  // Fetch ratings for the publisher
  const { data: ratings = [], isLoading } = useSWR(
    swrKeys.ratings.list(publisherId),
    () =>
      RatingsService.list(publisherId).then(async (r) => {
        if (r.ok) {
          return await r.json();
        }
        throw new Error('Failed to load ratings');
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    },
  );

  // Calculate average rating and distribution
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum: number, rating: any) => sum + rating.value, 0) /
        ratings.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = ratings.filter(
      (rating: any) => rating.value === stars,
    ).length;
    const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
    return { stars, count, percentage };
  });

  // Get recent reviews (limit to 3)
  const recentReviews = ratings.slice(0, 3);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-8 text-center">
            Loading reviews...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ratings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-8 text-center">
            No reviews yet. Be the first to rate this driver!
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2 text-center">
            <div className="text-4xl font-bold">
              {Number(averageRating).toFixed(1)}
            </div>
            <div className="flex items-center justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <div className="text-muted-foreground text-sm">
              {ratings.length} reviews
            </div>
          </div>

          <div className="space-y-2">
            {ratingDistribution.map((item) => (
              <div
                key={item.stars}
                className="flex items-center space-x-3 text-sm"
              >
                <span className="w-8">{item.stars}★</span>
                <Progress value={item.percentage} className="h-2 flex-1" />
                <span className="text-muted-foreground w-8">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        {recentReviews.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Recent Reviews</h4>
            {recentReviews.map((review: any) => (
              <div
                key={review.id}
                className="space-y-3 border-b pb-4 last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {review.reviewer?.name
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {review.reviewerUser?.name || 'Anonymous'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.value
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-muted-foreground text-sm">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

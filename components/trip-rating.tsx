'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface TripRatingProps {
  trip: {
    id: string;
    originName: string;
    destinationName: string;
    departureAt: string;
    vehicleType: string;
    pricePerSeat: number;
    publisher: {
      id: string;
      name: string;
      averageRating?: number;
      ratingCount?: number;
    };
  };
  onRatingSubmitted?: () => void;
}

export function TripRating({ trip, onRatingSubmitted }: TripRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api(`/api/ratings/trip/${trip.id}`, {
        method: 'POST',
        body: JSON.stringify({
          value: rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Rating submitted successfully');
        onRatingSubmitted?.();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (value: number) => {
    switch (value) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Select a rating';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Rate Your Trip</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trip Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">
              {trip.originName} → {trip.destinationName}
            </h3>
            <Badge variant="outline">{trip.vehicleType}</Badge>
          </div>
          <div className="text-muted-foreground text-sm">
            {formatDate(trip.departureAt)} • ${trip.pricePerSeat} per seat
          </div>
        </div>

        {/* Driver Information */}
        <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg" alt={trip.publisher.name} />
            <AvatarFallback>
              {trip.publisher.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{trip.publisher.name}</p>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              {trip.publisher.averageRating && trip.publisher.ratingCount ? (
                <>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{trip.publisher.averageRating.toFixed(1)}</span>
                  </div>
                  <span>({trip.publisher.ratingCount} reviews)</span>
                </>
              ) : (
                <span>New driver</span>
              )}
            </div>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="space-y-3">
          <Label>How was your experience?</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleStarClick(value)}
                onMouseEnter={() => handleStarHover(value)}
                onMouseLeave={handleStarLeave}
                className="p-1 transition-transform hover:scale-110"
                disabled={isSubmitting}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    value <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            {getRatingText(hoveredRating || rating)}
          </p>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label htmlFor="comment">Comment (optional)</Label>
          <Textarea
            id="comment"
            placeholder="Share your experience with this driver..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-20 resize-none"
            maxLength={500}
            disabled={isSubmitting}
          />
          <div className="text-muted-foreground text-right text-xs">
            {comment.length}/500
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitRating}
          disabled={rating === 0 || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting Rating...
            </>
          ) : (
            'Submit Rating'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

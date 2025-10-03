'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  onRatingSubmitted?: () => void;
}

export function RatingDialog({
  open,
  onOpenChange,
  tripId,
  onRatingSubmitted,
}: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tripData, setTripData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch trip details when dialog opens
  useEffect(() => {
    if (open && tripId) {
      setIsLoading(true);
      api(`/api/trips/${tripId}`)
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json();
            setTripData(data);
          }
        })
        .catch((error) => {
          console.error('Error fetching trip data:', error);
          toast.error('Failed to load trip details');
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, tripId]);

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
      const response = await api(`/api/ratings/trip/${tripId}`, {
        method: 'POST',
        body: JSON.stringify({
          value: rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Thank you for your feedback!');
        onRatingSubmitted?.();
        onOpenChange(false);
        // Reset form
        setRating(0);
        setComment('');
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            How was your{' '}
            {tripData?.payloadType === 'PARCEL' ? 'delivery' : 'trip'}{' '}
            experience?
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : tripData ? (
          <div className="space-y-6">
            {/* Trip Information */}
            <div className="bg-muted/50 space-y-2 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {tripData.originName} → {tripData.destinationName}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {tripData.vehicleType}
                </Badge>
              </div>
              <div className="text-muted-foreground text-sm">
                {formatDate(tripData.departureAt)}
              </div>
            </div>

            {/* Driver Information */}
            {tripData.publisher && (
              <div className="bg-muted/30 flex items-center gap-3 rounded-lg p-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src="/placeholder.svg"
                    alt={tripData.publisher.name}
                  />
                  <AvatarFallback>
                    {tripData.publisher.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{tripData.publisher.name}</p>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    {tripData.publisher.averageRating &&
                    tripData.publisher.ratingCount ? (
                      <>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>
                            {tripData.publisher.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <span>({tripData.publisher.ratingCount} reviews)</span>
                      </>
                    ) : (
                      <span>New driver</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rating Stars */}
            <div className="space-y-3">
              <Label>How was your experience?</Label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleStarClick(value)}
                    onMouseEnter={() => handleStarHover(value)}
                    onMouseLeave={handleStarLeave}
                    className="p-1 transition-transform hover:scale-125"
                    disabled={isSubmitting}
                  >
                    <Star
                      className={`h-10 w-10 transition-colors ${
                        value <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground text-center text-sm font-medium">
                {getRatingText(hoveredRating || rating)}
              </p>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">Additional Comments (optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience with this driver..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-24 resize-none"
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="text-muted-foreground text-right text-xs">
                {comment.length}/500
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button
                onClick={handleSubmitRating}
                disabled={rating === 0 || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Rating'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-center">
            Failed to load trip details
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

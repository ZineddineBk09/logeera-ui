'use client';

import { useState } from 'react';
import { MessageCircle, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RequestsService } from '@/lib/services';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface RequestJoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: {
    id: string;
    originName: string;
    destinationName: string;
    price: number;
    availableSeats: number;
    departureAt?: string;
    payloadType?: 'PARCEL' | 'PASSENGER';
    parcelWeight?: number;
    passengerCount?: number;
    publisher: {
      name: string;
    };
  };
  mutate: () => void;
}

export function RequestJoinDialog({
  open,
  onOpenChange,
  trip,
  mutate,
}: RequestJoinDialogProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Determine if this is a parcel or passenger trip
  const isParcelTrip = trip.payloadType === 'PARCEL';

  const handleSubmit = async () => {
    // Double-check authentication before submitting
    if (!isAuthenticated) {
      const currentUrl = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      onOpenChange(false);
      return;
    }

    // Check if trip date has passed
    if (trip.departureAt && new Date(trip.departureAt) < new Date()) {
      toast.error(
        isParcelTrip
          ? 'This delivery service has already departed'
          : 'This trip has already departed',
      );
      onOpenChange(false);
      return;
    }

    // Check if trip is full
    if (trip.availableSeats === 0) {
      toast.error(
        isParcelTrip
          ? 'This delivery service is at capacity'
          : 'This trip is full',
      );
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await RequestsService.create(trip.id);
      if (response.ok) {
        toast.success(
          isParcelTrip
            ? 'Delivery request sent successfully!'
            : 'Request sent successfully!',
        );
        onOpenChange(false);
        // Reset form
        setMessage('');
        mutate();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Request submission error:', error);
      toast.error('Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isParcelTrip ? 'Request Delivery Service' : 'Request to Join Trip'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Summary */}
          <div className="bg-muted/50 space-y-2 rounded-lg p-4">
            <div className="font-semibold">
              {trip.originName} → {trip.destinationName}
            </div>
            <div className="text-muted-foreground text-sm">
              {isParcelTrip ? 'Delivery service by' : 'with'}{' '}
              {trip.publisher.name}
            </div>
            {isParcelTrip && trip.parcelWeight && (
              <div className="text-muted-foreground text-xs">
                Capacity: {trip.parcelWeight}kg
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>
              Message to {isParcelTrip ? 'delivery service provider' : 'driver'}{' '}
              (optional)
            </Label>
            <Textarea
              placeholder={
                isParcelTrip
                  ? 'Describe your parcel and any special delivery instructions...'
                  : 'Introduce yourself and let the driver know any important details...'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-20"
            />
            <div className="text-muted-foreground flex items-center space-x-1 text-xs">
              <MessageCircle className="h-3 w-3" />
              <span>
                {isParcelTrip
                  ? 'This helps the provider understand your delivery needs'
                  : 'This helps drivers get to know you better'}
              </span>
            </div>
          </div>

          {/* Pricing Note */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              {isParcelTrip ? (
                <Package className="h-5 w-5 text-blue-600" />
              ) : (
                <MessageCircle className="h-5 w-5 text-blue-600" />
              )}
              <p className="text-sm text-blue-800">
                {isParcelTrip
                  ? 'You can discuss pricing and delivery details directly with the service provider once your request is accepted.'
                  : 'You can discuss pricing and trip details directly with the driver once your request is accepted.'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting
                ? 'Sending...'
                : isParcelTrip
                  ? 'Request Delivery'
                  : 'Send Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

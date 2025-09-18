'use client';

import { useState } from 'react';
import { Users, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
    publisher: {
      name: string;
    };
  };
}

export function RequestJoinDialog({
  open,
  onOpenChange,
  trip,
}: RequestJoinDialogProps) {
  const [seats, setSeats] = useState('1');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    // Double-check authentication before submitting
    if (!isAuthenticated) {
      const currentUrl = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await RequestsService.create(trip.id);
      if (response.ok) {
        toast.success('Request sent successfully!');
        onOpenChange(false);
        // Reset form
        setSeats('1');
        setMessage('');
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

  const totalPrice = Number.parseInt(seats) * trip.price + 2; // Including service fee

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request to Join Trip</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Summary */}
          <div className="bg-muted/50 space-y-2 rounded-lg p-4">
            <div className="font-semibold">
              {trip.originName} → {trip.destinationName}
            </div>
            <div className="text-muted-foreground text-sm">
              with {trip.publisher.name}
            </div>
          </div>

          {/* Number of Seats */}
          <div className="space-y-2">
            <Label>Number of seats</Label>
            <Select value={seats} onValueChange={setSeats}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Users className="text-muted-foreground mr-2 h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: Math.min(trip.availableSeats, 4) },
                  (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1} seat{i > 0 ? 's' : ''}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>Message to driver (optional)</Label>
            <Textarea
              placeholder="Introduce yourself and let the driver know any important details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-20"
            />
            <div className="text-muted-foreground flex items-center space-x-1 text-xs">
              <MessageCircle className="h-3 w-3" />
              <span>This helps drivers get to know you better</span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {seats} seat{Number.parseInt(seats) > 1 ? 's' : ''} × $
                  {trip.price}
                </span>
                <span>${Number.parseInt(seats) * trip.price}</span>
              </div>
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>Service fee</span>
                <span>$2</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              You won't be charged until your request is accepted
            </p>
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
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

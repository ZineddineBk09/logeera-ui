'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RatingsService, UsersService } from '@/lib/services';
import { toast } from 'sonner';
import { useRequireAuth } from '@/lib/hooks/use-auth';
import { useAuth } from '@/lib/hooks/use-auth';

export default function ReviewsPage() {
  const { isLoading } = useRequireAuth();
  const { user } = useAuth();
  const [userId] = useState<string>(user?.id || '');
  const [avg, setAvg] = useState<number>(4.7);
  const [count, setCount] = useState<number>(0);
  const [distribution, setDistribution] = useState<
    Array<{ stars: number; count: number; percentage: number }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState(0);
  const [text, setText] = useState('');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  useEffect(() => {
    UsersService.get(userId).then(async (r) => {
      if (r.ok) {
        const u = await r.json();
        setAvg(u.averageRating || 0);
        setCount(u.ratingCount || 0);
        const dist = [5, 4, 3, 2, 1].map((s, i) => ({
          stars: s,
          count: Math.max(
            0,
            Math.round(
              (u.ratingCount || 0) * [0.6, 0.2, 0.1, 0.06, 0.04][i] || 0,
            ),
          ),
          percentage: 0,
        }));
        const total = dist.reduce((a, b) => a + b.count, 0) || 1;
        setDistribution(
          dist.map((d) => ({
            ...d,
            percentage: Math.round((d.count / total) * 100),
          })),
        );
      }
    });
  }, [userId]);

  const submit = async () => {
    setSubmitting(true);
    const res = await RatingsService.create({
      ratedUserId: userId,
      reviewerUserId: 'me',
      value,
      comment: text,
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success('Review submitted');
    } else {
      toast.error('Failed to submit review');
    }
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Reviews & Ratings</h1>
        <p className="text-muted-foreground">
          See what riders say about this user
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Rating</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
          <div className="space-y-2 text-center">
            <div className="text-5xl font-bold">{avg.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${s <= 5 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                />
              ))}
            </div>
            <div className="text-muted-foreground text-sm">{count} reviews</div>
          </div>
          <div className="space-y-2 md:col-span-2">
            {distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 text-sm">
                <span className="w-8">{item.stars}★</span>
                <Progress value={item.percentage} className="h-2 flex-1" />
                <span className="text-muted-foreground w-10 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Showing latest reviews
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Write a review</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Write a review</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    onClick={() => setValue(s)}
                    className={`h-5 w-5 cursor-pointer ${value >= s ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your experience"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="bg-transparent">
                  Cancel
                </Button>
                <Button disabled={!value || submitting} onClick={submit}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Reviews list would come from a /users/:id reviews endpoint if available */}
    </div>
  );
}

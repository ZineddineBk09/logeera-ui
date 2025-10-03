'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Mail,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/use-auth';
import { swrKeys } from '@/lib/swr-config';
import useSWR from 'swr';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    type?: string;
    status?: string;
    role?: string;
    averageRating?: number;
    ratingCount?: number;
    createdAt?: string;
  };
}

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const { theme, setTheme } = useTheme();
  const { mutate: mutateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState<string | null>(null);

  // Fetch blocked users
  const {
    data: blockedUsers = [],
    error: blockedUsersError,
    isLoading: blockedUsersLoading,
    mutate: mutateBlockedUsers,
  } = useSWR(
    '/api/users/blocked',
    () =>
      api('/api/users/blocked').then(async (r) => {
        if (r.ok) {
          return await r.json();
        }
        throw new Error('Failed to load blocked users');
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    console.log('Form data:', data);
    setIsSaving(true);
    try {
      console.log('Updating user with ID:', user.id);
      const response = await api(`/api/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        toast.success('Profile updated successfully');
        // Update the user context
        mutateUser();
        reset(data); // Reset form to mark as not dirty
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnblockUser = async (userId: string, userName: string) => {
    setIsUnblocking(userId);
    try {
      const response = await api(`/api/users/${userId}/unblock`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`${userName} has been unblocked`);
        mutateBlockedUsers(); // Refresh the blocked users list
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsUnblocking(null);
    }
  };

  console.log('user', user);

  useEffect(() => {
    if (user) {
      reset(user);
    }
  }, [user, reset]);

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  value={watch('name')}
                  onChange={(e) => setValue('name', e.target.value)}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-destructive text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  value={watch('email')}
                  onChange={(e) => setValue('email', e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input
                  id="phoneNumber"
                  {...register('phoneNumber')}
                  value={watch('phoneNumber')}
                  onChange={(e) => setValue('phoneNumber', e.target.value)}
                  aria-invalid={!!errors.phoneNumber}
                />
                {errors.phoneNumber && (
                  <p className="text-destructive text-sm">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Theme</Label>
              <p className="text-muted-foreground text-sm">
                Choose your preferred theme
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="flex items-center space-x-2"
              >
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="flex items-center space-x-2"
              >
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
        </CardHeader>
        <CardContent>
          {blockedUsersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : blockedUsersError ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                Failed to load blocked users
              </p>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">No blocked users</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blockedUsers.map((blockedUser: any) => (
                <div
                  key={blockedUser.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="/placeholder.svg"
                        alt={blockedUser.user.name}
                      />
                      <AvatarFallback>
                        {blockedUser.user.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{blockedUser.user.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {blockedUser.user.email}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary">
                          Blocked{' '}
                          {new Date(blockedUser.blockedAt).toLocaleDateString()}
                        </Badge>
                        {blockedUser.user.averageRating > 0 && (
                          <Badge variant="outline">
                            ★ {blockedUser.user.averageRating.toFixed(1)} (
                            {blockedUser.user.ratingCount})
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUnblockUser(
                        blockedUser.user.id,
                        blockedUser.user.name,
                      )
                    }
                    disabled={isUnblocking === blockedUser.user.id}
                  >
                    {isUnblocking === blockedUser.user.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Unblocking...
                      </>
                    ) : (
                      'Unblock'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show phone number</Label>
              <p className="text-muted-foreground text-sm">
                Allow other users to see your phone number
              </p>
            </div>
            <Switch
              checked={settings.privacy.showPhone}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, showPhone: checked },
                }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show email address</Label>
              <p className="text-muted-foreground text-sm">
                Allow other users to see your email
              </p>
            </div>
            <Switch
              checked={settings.privacy.showEmail}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, showEmail: checked },
                }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show last seen</Label>
              <p className="text-muted-foreground text-sm">
                Let others know when you were last active
              </p>
            </div>
            <Switch
              checked={settings.privacy.showLastSeen}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  privacy: { ...prev.privacy, showLastSeen: checked },
                }))
              }
            />
          </div>
        </CardContent>
      </Card> */}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit(onSubmit)}
          size="lg"
          disabled={isDirty || isSaving || isSubmitting}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}

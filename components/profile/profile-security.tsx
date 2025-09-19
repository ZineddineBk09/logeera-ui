'use client';

import { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/hooks/use-auth';

interface ProfileSecurityProps {
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

export function ProfileSecurity({ user }: ProfileSecurityProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout } = useAuth();
  const schema = z
    .object({
      currentPassword: z.string().min(8, 'At least 8 characters'),
      newPassword: z.string().min(8, 'At least 8 characters').max(128),
      confirmPassword: z.string().min(8),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const passwordData = watch();

  const passwordStrength = calculatePasswordStrength(
    passwordData.newPassword || '',
  );

  const onSubmit = async (values: FormValues) => {
    console.log('Form values:', values); // Debug log

    // Validate that all fields are present
    if (
      !values.currentPassword ||
      !values.newPassword ||
      !values.confirmPassword
    ) {
      toast.error('Please fill in all password fields');
      return;
    }

    try {
      const res = await api('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          confirmPassword: values.confirmPassword,
          newPassword: values.newPassword,
        }),
      });
      if (res.ok) {
        toast.success('Password changed successfully');
        reset();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Network error');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await api(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Account deleted successfully');
        // Log out the user
        await logout();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  aria-invalid={!!errors.currentPassword}
                  {...register('currentPassword')}
                  className="pr-10"
                  placeholder="Enter current password"
                  value={watch('currentPassword')}
                  onChange={(e) => setValue('currentPassword', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-destructive text-sm">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  aria-invalid={!!errors.newPassword}
                  {...register('newPassword')}
                  className="pr-10"
                  placeholder="Enter new password"
                  value={watch('newPassword')}
                  onChange={(e) => setValue('newPassword', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-destructive text-sm">
                  {errors.newPassword.message}
                </p>
              )}
              {passwordData.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Password strength</span>
                    <span
                      className={`font-medium ${getStrengthColor(passwordStrength.score)}`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <Progress
                    value={passwordStrength.score * 25}
                    className="h-2"
                  />
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li
                      className={
                        passwordData.newPassword.length >= 8
                          ? 'text-green-600'
                          : ''
                      }
                    >
                      • At least 8 characters
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(passwordData.newPassword)
                          ? 'text-green-600'
                          : ''
                      }
                    >
                      • One uppercase letter
                    </li>
                    <li
                      className={
                        /[0-9]/.test(passwordData.newPassword)
                          ? 'text-green-600'
                          : ''
                      }
                    >
                      • One number
                    </li>
                    <li
                      className={
                        /[^A-Za-z0-9]/.test(passwordData.newPassword)
                          ? 'text-green-600'
                          : ''
                      }
                    >
                      • One special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  aria-invalid={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                  className="pr-10"
                  placeholder="Enter confirm password"
                  value={watch('confirmPassword')}
                  onChange={(e) => setValue('confirmPassword', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-destructive font-medium">
                Delete account
              </span>
              <p className="text-muted-foreground text-sm">
                Permanently delete your account and data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive bg-transparent"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete your account? This action
                    cannot be undone. All your trips, requests, messages, and
                    reviews will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculatePasswordStrength(password: string) {
  if (!password) return { score: 0, label: 'Very Weak' };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] || 'Very Weak' };
}

function getStrengthColor(score: number) {
  if (score <= 1) return 'text-red-600';
  if (score <= 2) return 'text-yellow-600';
  if (score <= 3) return 'text-blue-600';
  return 'text-green-600';
}

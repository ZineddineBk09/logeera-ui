'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/use-auth';
import { ROUTES } from '@/constants';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const schema = z.object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Enter a valid phone'),
    password: z.string().min(8, 'At least 8 characters').max(128),
    userType: z.enum(['individual', 'company'], {
      message: 'Select an account type',
    }),
    idNumber: z.string().min(1, 'Required').optional().or(z.literal('')),
    agreeToTerms: z.literal(true, {
      message: 'You must accept the terms',
    }),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      userType: undefined as unknown as any,
      idNumber: '',
      agreeToTerms: true,
    },
  });

  const { register: registerUser } = useAuth();

  const onSubmit = async (formData: FormValues) => {
    const ok = await registerUser({
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phone,
      password: formData.password,
      type: formData.userType.toUpperCase() as 'INDIVIDUAL' | 'COMPANY',
      officialIdNumber: formData.idNumber || 'ID-UNKNOWN',
    });

    if (ok) {
      router.push(ROUTES.DASHBOARD);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className="pl-10"
              aria-invalid={!!errors.name}
              {...register('name')}
              value={watch('name')}
              onChange={(e) => setValue('name', e.target.value)}
              required
            />
            {errors.name && (
              <p className="text-destructive mt-1 text-xs">
                {errors.name.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                aria-invalid={!!errors.email}
                {...register('email')}
                value={watch('email')}
                onChange={(e) => setValue('email', e.target.value)}
                required
              />
              {errors.email && (
                <p className="text-destructive mt-1 text-xs">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <div className="relative">
              <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone"
                className="pl-10"
                aria-invalid={!!errors.phone}
                {...register('phone')}
                value={watch('phone')}
                onChange={(e) => setValue('phone', e.target.value)}
                required
              />
              {errors.phone && (
                <p className="text-destructive mt-1 text-xs">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className="pr-10 pl-10"
              aria-invalid={!!errors.password}
              {...register('password')}
              value={watch('password')}
              onChange={(e) => setValue('password', e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Account type</Label>
            <Select
              value={watch('userType') || ''}
              onValueChange={(v) => setValue('userType', v as any)}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Building className="text-muted-foreground mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
            {errors.userType && (
              <p className="text-destructive mt-1 text-xs">
                {errors.userType.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">ID number (optional)</Label>
            <Input
              id="idNumber"
              type="text"
              placeholder="Driver's license or ID"
              {...register('idNumber')}
              value={watch('idNumber')}
              onChange={(e) => setValue('idNumber', e.target.value)}
            />
            {errors.idNumber && (
              <p className="text-destructive mt-1 text-xs">
                {errors.idNumber.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            {...register('agreeToTerms')}
            onCheckedChange={(c) => setValue('agreeToTerms', c as true)}
            required
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed">
            I agree to the{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
          {errors.agreeToTerms && (
            <p className="text-destructive mt-1 text-xs">
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Simple captcha verification (UI placeholder)</span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
      </div>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

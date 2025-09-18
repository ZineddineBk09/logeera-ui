import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { z } from 'zod';

// For now, we'll use in-memory storage for settings
// In production, you'd want to store this in a database
let systemSettings = {
  general: {
    siteName: 'Logeera',
    siteDescription: 'Connect, Share, Travel - Your trusted rideshare platform',
    contactEmail: 'contact@logeera.com',
    supportEmail: 'support@logeera.com',
    maintenanceMode: false,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationFrequency: 'immediate',
  },
  security: {
    requireEmailVerification: true,
    requirePhoneVerification: false,
    maxLoginAttempts: 5,
    sessionTimeout: 24,
    twoFactorEnabled: false,
  },
  payments: {
    commissionRate: 10,
    minimumPayout: 50,
    currency: 'USD',
    paymentMethods: ['stripe', 'paypal'],
  },
  features: {
    chatEnabled: true,
    ratingsEnabled: true,
    geolocationEnabled: true,
    autoAcceptRequests: false,
    maxTripCapacity: 8,
  },
};

const updateSettingsSchema = z.object({
  general: z
    .object({
      siteName: z.string().optional(),
      siteDescription: z.string().optional(),
      contactEmail: z.string().email().optional(),
      supportEmail: z.string().email().optional(),
      maintenanceMode: z.boolean().optional(),
    })
    .optional(),
  notifications: z
    .object({
      emailNotifications: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      notificationFrequency: z
        .enum(['immediate', 'hourly', 'daily', 'weekly'])
        .optional(),
    })
    .optional(),
  security: z
    .object({
      requireEmailVerification: z.boolean().optional(),
      requirePhoneVerification: z.boolean().optional(),
      maxLoginAttempts: z.number().min(1).max(10).optional(),
      sessionTimeout: z.number().min(1).max(168).optional(), // max 1 week
      twoFactorEnabled: z.boolean().optional(),
    })
    .optional(),
  payments: z
    .object({
      commissionRate: z.number().min(0).max(50).optional(),
      minimumPayout: z.number().min(1).optional(),
      currency: z.enum(['USD', 'EUR', 'GBP', 'NGN']).optional(),
      paymentMethods: z.array(z.string()).optional(),
    })
    .optional(),
  features: z
    .object({
      chatEnabled: z.boolean().optional(),
      ratingsEnabled: z.boolean().optional(),
      geolocationEnabled: z.boolean().optional(),
      autoAcceptRequests: z.boolean().optional(),
      maxTripCapacity: z.number().min(1).max(20).optional(),
    })
    .optional(),
});

async function getSettings(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(systemSettings);
  } catch (error) {
    console.error('Admin settings fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function updateSettings(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const validatedSettings = updateSettingsSchema.parse(body);

    // Deep merge the settings
    if (validatedSettings.general) {
      systemSettings.general = {
        ...systemSettings.general,
        ...validatedSettings.general,
      };
    }
    if (validatedSettings.notifications) {
      systemSettings.notifications = {
        ...systemSettings.notifications,
        ...validatedSettings.notifications,
      };
    }
    if (validatedSettings.security) {
      systemSettings.security = {
        ...systemSettings.security,
        ...validatedSettings.security,
      };
    }
    if (validatedSettings.payments) {
      systemSettings.payments = {
        ...systemSettings.payments,
        ...validatedSettings.payments,
      };
    }
    if (validatedSettings.features) {
      systemSettings.features = {
        ...systemSettings.features,
        ...validatedSettings.features,
      };
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: systemSettings,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: error.issues },
        { status: 400 },
      );
    }

    console.error('Admin settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getSettings);
export const PUT = withAuth(updateSettings);

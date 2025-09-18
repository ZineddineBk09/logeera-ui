'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Bell,
  Shield,
  Mail,
  Globe,
  CreditCard,
  Database,
  Save,
  RefreshCw,
} from 'lucide-react';
import useSWR from 'swr';
import { swrKeys } from '@/lib/swr-config';
import { AdminService } from '@/lib/services/admin';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportEmail: string;
    maintenanceMode: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    notificationFrequency: string;
  };
  security: {
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    maxLoginAttempts: number;
    sessionTimeout: number;
    twoFactorEnabled: boolean;
  };
  payments: {
    commissionRate: number;
    minimumPayout: number;
    currency: string;
    paymentMethods: string[];
  };
  features: {
    chatEnabled: boolean;
    ratingsEnabled: boolean;
    geolocationEnabled: boolean;
    autoAcceptRequests: boolean;
    maxTripCapacity: number;
  };
}

export function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch settings data
  const {
    data: settingsData,
    error,
    mutate,
  } = useSWR(
    swrKeys.admin.settings(),
    async () => {
      const response = await AdminService.getSettings();
      return response.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      onError: (error) => {
        console.error('Settings fetch error:', error);
        toast.error('Failed to load settings');
      },
    },
  );

  const [settings, setSettings] = useState<SystemSettings | null>(
    settingsData || null,
  );

  // Update settings when data is loaded
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  const handleSettingChange = (
    section: keyof SystemSettings,
    key: string,
    value: any,
  ) => {
    if (!settings) return;

    setSettings((prev) =>
      prev
        ? {
            ...prev,
            [section]: {
              ...prev[section],
              [key]: value,
            },
          }
        : null,
    );
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      await AdminService.updateSettings(settings);
      toast.success('Settings saved successfully');
      setHasChanges(false);
      mutate();
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (settingsData) {
      setSettings(settingsData);
      setHasChanges(false);
      toast.info('Settings reset to last saved values');
    }
  };

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="py-8 text-center">
        <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <p className="text-muted-foreground mt-4">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleResetSettings}
            disabled={!hasChanges || isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>General Settings</span>
          </CardTitle>
          <CardDescription>
            Basic configuration for your platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.general.siteName}
                onChange={(e) =>
                  handleSettingChange('general', 'siteName', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.general.contactEmail}
                onChange={(e) =>
                  handleSettingChange('general', 'contactEmail', e.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.general.siteDescription}
              onChange={(e) =>
                handleSettingChange(
                  'general',
                  'siteDescription',
                  e.target.value,
                )
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="maintenanceMode"
              checked={settings.general.maintenanceMode}
              onCheckedChange={(checked) =>
                handleSettingChange('general', 'maintenanceMode', checked)
              }
            />
            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
          <CardDescription>
            Configure how users receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="emailNotifications"
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange(
                    'notifications',
                    'emailNotifications',
                    checked,
                  )
                }
              />
              <Label htmlFor="emailNotifications">Email Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="smsNotifications"
                checked={settings.notifications.smsNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange(
                    'notifications',
                    'smsNotifications',
                    checked,
                  )
                }
              />
              <Label htmlFor="smsNotifications">SMS Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="pushNotifications"
                checked={settings.notifications.pushNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange(
                    'notifications',
                    'pushNotifications',
                    checked,
                  )
                }
              />
              <Label htmlFor="pushNotifications">Push Notifications</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notificationFrequency">
              Notification Frequency
            </Label>
            <Select
              value={settings.notifications.notificationFrequency}
              onValueChange={(value) =>
                handleSettingChange(
                  'notifications',
                  'notificationFrequency',
                  value,
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Settings</span>
          </CardTitle>
          <CardDescription>
            Configure security and authentication options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="requireEmailVerification"
                checked={settings.security.requireEmailVerification}
                onCheckedChange={(checked) =>
                  handleSettingChange(
                    'security',
                    'requireEmailVerification',
                    checked,
                  )
                }
              />
              <Label htmlFor="requireEmailVerification">
                Require Email Verification
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="requirePhoneVerification"
                checked={settings.security.requirePhoneVerification}
                onCheckedChange={(checked) =>
                  handleSettingChange(
                    'security',
                    'requirePhoneVerification',
                    checked,
                  )
                }
              />
              <Label htmlFor="requirePhoneVerification">
                Require Phone Verification
              </Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) =>
                  handleSettingChange(
                    'security',
                    'maxLoginAttempts',
                    parseInt(e.target.value),
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  handleSettingChange(
                    'security',
                    'sessionTimeout',
                    parseInt(e.target.value),
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Feature Settings</span>
          </CardTitle>
          <CardDescription>Enable or disable platform features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="chatEnabled"
                checked={settings.features.chatEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange('features', 'chatEnabled', checked)
                }
              />
              <Label htmlFor="chatEnabled">Chat System</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ratingsEnabled"
                checked={settings.features.ratingsEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange('features', 'ratingsEnabled', checked)
                }
              />
              <Label htmlFor="ratingsEnabled">Rating System</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="geolocationEnabled"
                checked={settings.features.geolocationEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange('features', 'geolocationEnabled', checked)
                }
              />
              <Label htmlFor="geolocationEnabled">Geolocation Services</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoAcceptRequests"
                checked={settings.features.autoAcceptRequests}
                onCheckedChange={(checked) =>
                  handleSettingChange('features', 'autoAcceptRequests', checked)
                }
              />
              <Label htmlFor="autoAcceptRequests">Auto-Accept Requests</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxTripCapacity">Maximum Trip Capacity</Label>
            <Input
              id="maxTripCapacity"
              type="number"
              value={settings.features.maxTripCapacity}
              onChange={(e) =>
                handleSettingChange(
                  'features',
                  'maxTripCapacity',
                  parseInt(e.target.value),
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Settings</span>
          </CardTitle>
          <CardDescription>
            Configure payment processing and fees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                step="0.1"
                value={settings.payments.commissionRate}
                onChange={(e) =>
                  handleSettingChange(
                    'payments',
                    'commissionRate',
                    parseFloat(e.target.value),
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumPayout">Minimum Payout ($)</Label>
              <Input
                id="minimumPayout"
                type="number"
                value={settings.payments.minimumPayout}
                onChange={(e) =>
                  handleSettingChange(
                    'payments',
                    'minimumPayout',
                    parseInt(e.target.value),
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={settings.payments.currency}
                onValueChange={(value) =>
                  handleSettingChange('payments', 'currency', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

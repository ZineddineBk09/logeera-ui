"use client";

import { useState } from "react";
import { Bell, Moon, Sun, Globe, Mail, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";

interface ProfileSettingsProps {
  user: {
    name: string;
    email: string;
    phone: string;
    bio: string;
    languages: string[];
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    bio: user.bio,
    language: "en",
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
    },
    privacy: {
      showPhone: true,
      showEmail: false,
      showLastSeen: true,
    },
  });

  const handleSave = () => {
    // Handle save settings
    console.log("Saving settings:", settings);
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Preferred language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell other users about yourself..."
              className="min-h-20"
              value={settings.bio}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, bio: e.target.value }))
              }
            />
          </div>
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
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex items-center space-x-2"
              >
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex items-center space-x-2"
              >
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email notifications</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive trip updates via email
              </p>
            </div>
            <Switch
              checked={settings.notifications.email}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: checked },
                }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Push notifications</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified about trip requests
              </p>
            </div>
            <Switch
              checked={settings.notifications.push}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, push: checked },
                }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>SMS notifications</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Important updates via text message
              </p>
            </div>
            <Switch
              checked={settings.notifications.sms}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, sms: checked },
                }))
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Marketing emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive tips and promotional content
              </p>
            </div>
            <Switch
              checked={settings.notifications.marketing}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  notifications: { ...prev.notifications, marketing: checked },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show phone number</Label>
              <p className="text-sm text-muted-foreground">
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
              <p className="text-sm text-muted-foreground">
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
              <p className="text-sm text-muted-foreground">
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
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
}

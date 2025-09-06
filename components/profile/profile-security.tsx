"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface ProfileSecurityProps {
  user: {
    email: string;
  };
}

const activeSessions = [
  {
    id: "1",
    device: "MacBook Pro",
    location: "New York, NY",
    lastActive: "Current session",
    current: true,
  },
  {
    id: "2",
    device: "iPhone 14",
    location: "New York, NY",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "3",
    device: "Chrome on Windows",
    location: "Boston, MA",
    lastActive: "3 days ago",
    current: false,
  },
];

export function ProfileSecurity({ user }: ProfileSecurityProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordStrength = calculatePasswordStrength(passwordData.newPassword);

  const handleChangePassword = () => {
    // Handle password change
    console.log("Changing password");
  };

  const handleTerminateSession = (sessionId: string) => {
    // Handle session termination
    console.log("Terminating session:", sessionId);
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
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
                <Progress value={passwordStrength.score * 25} className="h-2" />
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li
                    className={
                      passwordData.newPassword.length >= 8
                        ? "text-green-600"
                        : ""
                    }
                  >
                    • At least 8 characters
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(passwordData.newPassword)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    • One uppercase letter
                  </li>
                  <li
                    className={
                      /[0-9]/.test(passwordData.newPassword)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    • One number
                  </li>
                  <li
                    className={
                      /[^A-Za-z0-9]/.test(passwordData.newPassword)
                        ? "text-green-600"
                        : ""
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
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {passwordData.confirmPassword &&
              passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-sm text-destructive">
                  Passwords do not match
                </p>
              )}
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={
              !passwordData.currentPassword ||
              !passwordData.newPassword ||
              !passwordData.confirmPassword ||
              passwordData.newPassword !== passwordData.confirmPassword ||
              passwordStrength.score < 2
            }
          >
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Authenticator App</span>
                <Badge variant="secondary">Recommended</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Use an authenticator app to generate secure codes
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">SMS Authentication</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive codes via text message
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Monitor className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{session.device}</span>
                    {session.current && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session.location} • {session.lastActive}
                  </div>
                </div>
              </div>
              {!session.current && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTerminateSession(session.id)}
                  className="text-destructive hover:text-destructive"
                >
                  Terminate
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="space-y-2">
              <div className="font-medium">Security Recommendations</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enable two-factor authentication for better security</li>
                <li>• Use a strong, unique password</li>
                <li>• Review active sessions regularly</li>
                <li>• Keep your contact information up to date</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-medium">Download your data</span>
              <p className="text-sm text-muted-foreground">
                Get a copy of your account data
              </p>
            </div>
            <Button variant="outline" size="sm">
              Download
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-medium text-destructive">
                Delete account
              </span>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and data
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive bg-transparent"
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculatePasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] || "Very Weak" };
}

function getStrengthColor(score: number) {
  if (score <= 1) return "text-red-600";
  if (score <= 2) return "text-yellow-600";
  if (score <= 3) return "text-blue-600";
  return "text-green-600";
}

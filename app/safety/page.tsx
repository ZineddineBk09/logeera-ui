import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  Phone,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Safety Guidelines',
  description:
    'Stay safe while using Logeera. Learn about our safety guidelines, tips for drivers and passengers, and emergency procedures.',
  openGraph: {
    title: 'Safety Guidelines - Logeera',
    description:
      'Stay safe while using Logeera. Learn about our safety guidelines and emergency procedures.',
    url: '/safety',
  },
  twitter: {
    title: 'Safety Guidelines - Logeera',
    description:
      'Stay safe while using Logeera. Learn about our safety guidelines and emergency procedures.',
  },
};

const safetyTips = [
  {
    category: 'Before the Trip',
    icon: CheckCircle,
    tips: [
      'Verify driver and vehicle details match the app',
      'Share trip details with a trusted contact',
      'Check driver ratings and reviews',
      'Confirm pickup location and time',
      'Ensure your phone is fully charged',
    ],
  },
  {
    category: 'During the Trip',
    icon: Shield,
    tips: [
      'Wear your seatbelt at all times',
      'Stay alert and trust your instincts',
      'Keep emergency contacts easily accessible',
      'Share your live location with trusted contacts',
      'Avoid sharing personal information',
    ],
  },
  {
    category: 'For Drivers',
    icon: Users,
    tips: [
      'Verify passenger identity before starting',
      'Keep your vehicle in good condition',
      'Follow traffic rules and drive safely',
      'Maintain professional behavior',
      'Report suspicious activities immediately',
    ],
  },
  {
    category: 'Emergency Situations',
    icon: AlertTriangle,
    tips: [
      'Contact local emergency services (911)',
      'Use the in-app emergency button',
      'Share your location with authorities',
      'Stay calm and follow official instructions',
      'Report incidents to Logeera support',
    ],
  },
];

const emergencyContacts = [
  {
    service: 'Emergency Services',
    number: '911',
    description: 'Police, Fire, Medical',
  },
  {
    service: 'Logeera Safety',
    number: '+1-800-LOGEERA',
    description: '24/7 Safety Hotline',
  },
  {
    service: 'Roadside Assistance',
    number: '+1-800-ROADHELP',
    description: 'Vehicle Breakdown',
  },
];

export default function SafetyPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
            <Shield className="text-primary h-8 w-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Safety Guidelines</h1>
        <p className="text-muted-foreground text-lg">
          Your safety is our top priority. Follow these guidelines for a secure
          rideshare experience.
        </p>
      </div>

      {/* Safety Tips */}
      <div className="grid gap-6 md:grid-cols-2">
        {safetyTips.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="text-primary h-5 w-5" />
                  {section.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="text-primary h-5 w-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-4">
                <div className="font-semibold">{contact.service}</div>
                <div className="text-primary text-2xl font-bold">
                  {contact.number}
                </div>
                <div className="text-muted-foreground text-sm">
                  {contact.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Safety Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="text-primary h-5 w-5" />
            Logeera Safety Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Badge variant="secondary">Driver Verification</Badge>
              <p className="text-muted-foreground text-sm">
                All drivers undergo background checks and vehicle inspections.
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary">Real-time Tracking</Badge>
              <p className="text-muted-foreground text-sm">
                Share your trip progress with trusted contacts in real-time.
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary">Rating System</Badge>
              <p className="text-muted-foreground text-sm">
                Rate and review drivers to help maintain quality standards.
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary">24/7 Support</Badge>
              <p className="text-muted-foreground text-sm">
                Our safety team is available around the clock for assistance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Commitment */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold">Our Safety Commitment</h2>
            <p className="text-muted-foreground">
              Logeera is committed to providing a safe, reliable, and secure
              rideshare experience. We continuously improve our safety measures
              and work with local authorities to ensure the wellbeing of our
              community.
            </p>
            <div className="text-muted-foreground flex justify-center gap-4 text-sm">
              <span>• Trusted by thousands</span>
              <span>• Verified drivers</span>
              <span>• 24/7 monitoring</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

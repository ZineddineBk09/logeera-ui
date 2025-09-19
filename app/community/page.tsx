import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, MessageCircle, Star, Shield, AlertTriangle, X } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'Learn about Logeera\'s community guidelines and standards. Help us maintain a respectful, safe, and welcoming environment for all users.',
  openGraph: {
    title: 'Community Guidelines - Logeera',
    description: 'Learn about Logeera\'s community guidelines and standards for all users.',
    url: '/community',
  },
  twitter: {
    title: 'Community Guidelines - Logeera',
    description: 'Learn about Logeera\'s community guidelines and standards for all users.',
  },
};

const guidelines = [
  {
    title: 'Be Respectful',
    icon: Heart,
    badge: 'Core Value',
    description: 'Treat all community members with respect, kindness, and courtesy.',
    rules: [
      'Use polite and professional language',
      'Respect cultural and personal differences',
      'Be patient with other users',
      'Avoid discriminatory behavior',
    ],
  },
  {
    title: 'Communicate Clearly',
    icon: MessageCircle,
    badge: 'Essential',
    description: 'Clear communication helps ensure smooth and safe trips for everyone.',
    rules: [
      'Respond to messages promptly',
      'Provide accurate trip information',
      'Confirm pickup details clearly',
      'Update others about any changes',
    ],
  },
  {
    title: 'Maintain Safety',
    icon: Shield,
    badge: 'Priority',
    description: 'Safety is our top priority. Help us maintain a secure environment.',
    rules: [
      'Verify identity before trips',
      'Follow traffic laws and regulations',
      'Report suspicious activities',
      'Keep emergency contacts updated',
    ],
  },
  {
    title: 'Provide Quality Service',
    icon: Star,
    badge: 'Excellence',
    description: 'Strive to provide the best possible experience for fellow community members.',
    rules: [
      'Be punctual for pickups and trips',
      'Keep vehicles clean and comfortable',
      'Honor your commitments',
      'Leave honest and constructive reviews',
    ],
  },
];

const prohibitedBehaviors = [
  'Harassment, bullying, or intimidation',
  'Discrimination based on race, gender, religion, or other factors',
  'Inappropriate or offensive language',
  'Sharing false or misleading information',
  'Attempting to conduct business outside the platform',
  'Requesting or sharing personal contact information inappropriately',
  'Using the platform for illegal activities',
  'Creating fake accounts or impersonating others',
];

const consequences = [
  {
    level: 'Warning',
    description: 'First-time minor violations receive a warning and guidance',
    badge: 'Level 1',
  },
  {
    level: 'Temporary Suspension',
    description: 'Repeated violations may result in temporary account suspension',
    badge: 'Level 2',
  },
  {
    level: 'Permanent Ban',
    description: 'Serious violations or repeated offenses result in permanent removal',
    badge: 'Level 3',
  },
];

export default function CommunityPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Community Guidelines</h1>
        <p className="text-muted-foreground text-lg">
          Building a safe, respectful, and welcoming community for all travelers.
        </p>
      </div>

      {/* Community Standards */}
      <div className="grid gap-6 md:grid-cols-2">
        {guidelines.map((guideline, index) => {
          const Icon = guideline.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {guideline.title}
                </CardTitle>
                <Badge variant="secondary">{guideline.badge}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">{guideline.description}</p>
                <ul className="space-y-2">
                  {guideline.rules.map((rule, ruleIndex) => (
                    <li key={ruleIndex} className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-sm">{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Prohibited Behaviors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Prohibited Behaviors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The following behaviors are not tolerated on our platform:
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {prohibitedBehaviors.map((behavior, index) => (
              <div key={index} className="flex items-start gap-2">
                <X className="mt-0.5 h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-sm">{behavior}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enforcement */}
      <Card>
        <CardHeader>
          <CardTitle>Enforcement and Consequences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            We take community guidelines seriously and enforce them fairly and consistently.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {consequences.map((consequence, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{consequence.level}</h3>
                  <Badge variant="outline">{consequence.badge}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">{consequence.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reporting */}
      <Card>
        <CardHeader>
          <CardTitle>Reporting Violations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Help us maintain a safe community by reporting violations of these guidelines.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold">How to Report</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Use the "Report" button in the app</li>
                <li>• Email safety@logeera.com</li>
                <li>• Contact support through our help center</li>
                <li>• Call our safety hotline for urgent issues</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">What to Include</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Description of the incident</li>
                <li>• Date and time of occurrence</li>
                <li>• User ID or trip information</li>
                <li>• Any relevant screenshots or evidence</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Commitment */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Our Community Commitment</h2>
            <p className="text-muted-foreground">
              Together, we can build a thriving community where everyone feels safe, 
              respected, and welcome. Thank you for being part of the Logeera family.
            </p>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <span>• Inclusive</span>
              <span>• Respectful</span>
              <span>• Safe</span>
              <span>• Supportive</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

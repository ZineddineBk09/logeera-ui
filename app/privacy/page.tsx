import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Database, Users, Lock, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Logeera protects your privacy and handles your personal data. Understand our data collection, usage, and sharing practices.',
  openGraph: {
    title: 'Privacy Policy - Logeera',
    description: 'Learn how Logeera protects your privacy and handles your personal data.',
    url: '/privacy',
  },
  twitter: {
    title: 'Privacy Policy - Logeera',
    description: 'Learn how Logeera protects your privacy and handles your personal data.',
  },
};

const privacySections = [
  {
    title: 'Information We Collect',
    icon: Database,
    content: 'We collect information you provide directly (name, email, phone), usage data (trips, locations), and device information to provide our services safely and effectively.',
  },
  {
    title: 'How We Use Your Information',
    icon: Eye,
    content: 'Your information helps us connect you with other users, process payments, ensure safety, improve our services, and communicate important updates.',
  },
  {
    title: 'Information Sharing',
    icon: Users,
    content: 'We share limited information with trip participants for coordination, with service providers for platform operations, and with authorities when required by law.',
  },
  {
    title: 'Data Security',
    icon: Lock,
    content: 'We use industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information.',
  },
  {
    title: 'Location Data',
    icon: Globe,
    content: 'Location data is used to facilitate rides, provide safety features, and improve our services. You can control location sharing through your device settings.',
  },
  {
    title: 'Your Rights',
    icon: Shield,
    content: 'You can access, update, or delete your personal information anytime. You also have the right to data portability and can request information about our data practices.',
  },
];

const dataTypes = [
  {
    type: 'Account Information',
    description: 'Name, email, phone number, profile photo',
    retention: 'Until account deletion',
  },
  {
    type: 'Trip Data',
    description: 'Pickup/dropoff locations, trip history, preferences',
    retention: '3 years after trip completion',
  },
  {
    type: 'Communication',
    description: 'Messages, ratings, reviews, support tickets',
    retention: '2 years for quality assurance',
  },
  {
    type: 'Payment Information',
    description: 'Transaction history, payment methods (encrypted)',
    retention: '7 years for legal compliance',
  },
];

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg">
          How we collect, use, and protect your personal information.
        </p>
        <p className="text-muted-foreground text-sm">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Privacy Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {privacySections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle>Data Retention Periods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataTypes.map((data, index) => (
              <div key={index} className="flex justify-between items-start p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-semibold">{data.type}</h3>
                  <p className="text-muted-foreground text-sm">{data.description}</p>
                </div>
                <Badge variant="outline">{data.retention}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card>
        <CardHeader>
          <CardTitle>Your Privacy Rights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold">Access & Update</h3>
              <p className="text-muted-foreground text-sm">
                View and update your personal information in your profile settings.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Data Deletion</h3>
              <p className="text-muted-foreground text-sm">
                Request account deletion and data removal through your settings.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Data Export</h3>
              <p className="text-muted-foreground text-sm">
                Request a copy of your data by contacting our support team.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Opt-out</h3>
              <p className="text-muted-foreground text-sm">
                Control marketing communications and data sharing preferences.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Privacy Questions?</h2>
            <p className="text-muted-foreground">
              Contact our Data Protection Officer for privacy-related inquiries.
            </p>
            <a 
              href="mailto:privacy@logeera.com" 
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              privacy@logeera.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

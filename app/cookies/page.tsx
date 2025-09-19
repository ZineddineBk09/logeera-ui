import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cookie, Settings, BarChart, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn about how Logeera uses cookies and similar technologies to improve your experience and provide our services.',
  openGraph: {
    title: 'Cookie Policy - Logeera',
    description: 'Learn about how Logeera uses cookies and similar technologies.',
    url: '/cookies',
  },
  twitter: {
    title: 'Cookie Policy - Logeera',
    description: 'Learn about how Logeera uses cookies and similar technologies.',
  },
};

const cookieTypes = [
  {
    title: 'Essential Cookies',
    icon: Shield,
    badge: 'Required',
    description: 'These cookies are necessary for the website to function properly. They enable basic features like page navigation, authentication, and security.',
    examples: ['User authentication', 'Session management', 'Security features', 'Form submissions'],
    canDisable: false,
  },
  {
    title: 'Functional Cookies',
    icon: Settings,
    badge: 'Optional',
    description: 'These cookies enhance your experience by remembering your preferences and settings.',
    examples: ['Language preferences', 'Theme settings', 'Location preferences', 'Search filters'],
    canDisable: true,
  },
  {
    title: 'Analytics Cookies',
    icon: BarChart,
    badge: 'Optional',
    description: 'These cookies help us understand how users interact with our platform to improve our services.',
    examples: ['Page views', 'User behavior', 'Performance metrics', 'Error tracking'],
    canDisable: true,
  },
];

export default function CookiesPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Cookie className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Cookie Policy</h1>
        <p className="text-muted-foreground text-lg">
          How we use cookies and similar technologies on Logeera.
        </p>
        <p className="text-muted-foreground text-sm">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* What are Cookies */}
      <Card>
        <CardHeader>
          <CardTitle>What are Cookies?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            Cookies are small text files that are stored on your device when you visit our website. 
            They help us provide you with a better experience by remembering your preferences, 
            keeping you logged in, and helping us understand how you use our platform.
          </p>
        </CardContent>
      </Card>

      {/* Cookie Types */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Types of Cookies We Use</h2>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {cookieTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {type.title}
                  </CardTitle>
                  <Badge 
                    variant={type.canDisable ? "secondary" : "default"}
                    className="w-fit"
                  >
                    {type.badge}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {type.description}
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Examples:</h4>
                    <ul className="space-y-1">
                      {type.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="text-muted-foreground text-sm flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-primary" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2">
                    <Badge variant={type.canDisable ? "outline" : "secondary"}>
                      {type.canDisable ? 'Can be disabled' : 'Always active'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Managing Cookies */}
      <Card>
        <CardHeader>
          <CardTitle>Managing Your Cookie Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold">Browser Settings</h3>
              <p className="text-muted-foreground text-sm">
                You can control cookies through your browser settings. Note that disabling essential cookies may affect website functionality.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Cookie Preferences</h3>
              <p className="text-muted-foreground text-sm">
                Manage your cookie preferences in your account settings. You can opt-out of non-essential cookies anytime.
              </p>
            </div>
          </div>
          
          <div className="rounded-lg bg-primary/5 p-4">
            <h4 className="font-semibold mb-2">Third-Party Cookies</h4>
            <p className="text-muted-foreground text-sm">
              We use Google Maps for location services and may use analytics services. 
              These services have their own privacy policies and cookie practices.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Cookie Questions?</h2>
            <p className="text-muted-foreground">
              Contact us if you have questions about our cookie practices.
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

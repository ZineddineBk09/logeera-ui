import type { Metadata } from 'next';

// Disable static generation for this page since it uses client-side form components
export const dynamic = 'force-dynamic';

import { ContactForm } from '@/components/contact-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MessageCircle, Clock, MapPin, Headphones } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Logeera support team. We\'re here to help with any questions or issues you may have.',
  openGraph: {
    title: 'Contact Us - Logeera',
    description: 'Get in touch with Logeera support team. We\'re here to help with any questions or issues.',
    url: '/contact',
  },
  twitter: {
    title: 'Contact Us - Logeera',
    description: 'Get in touch with Logeera support team. We\'re here to help with any questions or issues.',
  },
};

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us an email and we\'ll respond within 24 hours',
    contact: 'support@logeera.com',
    badge: 'Most Popular',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Call us for immediate assistance',
    contact: '+1-800-LOGEERA',
    badge: 'Urgent Issues',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    contact: 'Available in app',
    badge: 'Coming Soon',
  },
];

const supportHours = [
  { day: 'Monday - Friday', hours: '8:00 AM - 8:00 PM EST' },
  { day: 'Saturday', hours: '9:00 AM - 6:00 PM EST' },
  { day: 'Sunday', hours: '10:00 AM - 4:00 PM EST' },
];

const officeLocations = [
  {
    city: 'New York',
    address: '123 Business Ave, Suite 100, New York, NY 10001',
    phone: '+1 (555) 123-4567',
  },
  {
    city: 'San Francisco',
    address: '456 Tech Street, Floor 5, San Francisco, CA 94105',
    phone: '+1 (555) 987-6543',
  },
  {
    city: 'Austin',
    address: '789 Innovation Blvd, Austin, TX 78701',
    phone: '+1 (555) 456-7890',
  },
];

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Headphones className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-muted-foreground text-lg">
          We\'re here to help! Get in touch with our support team.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Contact Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{method.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {method.badge}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{method.description}</p>
                      <p className="font-medium text-primary">{method.contact}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Support Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Support Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supportHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-medium">{schedule.day}</span>
                    <span className="text-muted-foreground">{schedule.hours}</span>
                  </div>
                ))}
                <div className="mt-4 rounded-lg bg-primary/5 p-3">
                  <p className="text-sm text-primary">
                    <strong>Emergency Support:</strong> Available 24/7 for safety-related issues
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Office Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Our Offices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {officeLocations.map((office, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-4">
                <h3 className="font-semibold">{office.city}</h3>
                <p className="text-muted-foreground text-sm">{office.address}</p>
                <p className="font-medium text-primary">{office.phone}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Link */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Looking for Quick Answers?</h2>
            <p className="text-muted-foreground">
              Check out our FAQ section for immediate answers to common questions.
            </p>
            <a 
              href="/faq" 
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Visit FAQ
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

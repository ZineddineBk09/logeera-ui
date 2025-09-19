import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read Logeera\'s terms of service and user agreement. Understand your rights and responsibilities when using our rideshare platform.',
  openGraph: {
    title: 'Terms of Service - Logeera',
    description: 'Read Logeera\'s terms of service and user agreement.',
    url: '/terms',
  },
  twitter: {
    title: 'Terms of Service - Logeera',
    description: 'Read Logeera\'s terms of service and user agreement.',
  },
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using Logeera, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
  },
  {
    title: '2. Service Description',
    content: 'Logeera is a rideshare platform that connects drivers with passengers for shared transportation. We facilitate connections but do not provide transportation services directly.',
  },
  {
    title: '3. User Responsibilities',
    content: 'Users must provide accurate information, follow safety guidelines, treat other users with respect, and comply with local laws and regulations.',
  },
  {
    title: '4. Driver Requirements',
    content: 'Drivers must possess valid licenses, maintain proper insurance, keep vehicles in safe condition, and undergo our verification process.',
  },
  {
    title: '5. Payment Terms',
    content: 'Payments are processed securely through our platform. Service fees apply to each transaction. Refund policies vary based on cancellation timing.',
  },
  {
    title: '6. Safety and Conduct',
    content: 'Users must follow our community guidelines, report safety concerns immediately, and maintain appropriate behavior during all interactions.',
  },
  {
    title: '7. Privacy and Data',
    content: 'We protect user data according to our Privacy Policy. Location data is used to facilitate rides and improve safety features.',
  },
  {
    title: '8. Limitation of Liability',
    content: 'Logeera provides a platform service and is not liable for actions of drivers or passengers. Users participate at their own risk.',
  },
  {
    title: '9. Termination',
    content: 'We reserve the right to terminate accounts for violations of these terms, safety concerns, or misuse of the platform.',
  },
  {
    title: '10. Changes to Terms',
    content: 'These terms may be updated periodically. Continued use of the service constitutes acceptance of any changes.',
  },
];

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground text-lg">
          Please read these terms carefully before using Logeera.
        </p>
        <p className="text-muted-foreground text-sm">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Terms Content */}
      <Card>
        <CardHeader>
          <CardTitle>User Agreement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="space-y-3">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              {index < sections.length - 1 && <hr className="border-border" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Questions About These Terms?</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us.
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="/contact" 
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                Contact Legal Team
              </a>
              <a 
                href="mailto:legal@logeera.com" 
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-muted"
              >
                legal@logeera.com
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ContactForm } from '@/components/contact-form';

export const metadata: Metadata = {
  title: 'Help & Support',
  description:
    'Get help with Logeera. Find answers to frequently asked questions, contact support, and learn how to use our rideshare platform.',
  openGraph: {
    title: 'Help & Support - Logeera',
    description:
      'Get help with Logeera. Find answers to frequently asked questions and contact support.',
    url: '/help',
  },
  twitter: {
    title: 'Help & Support - Logeera',
    description:
      'Get help with Logeera. Find answers to frequently asked questions and contact support.',
  },
};

const faqs = [
  {
    q: 'How do I publish a trip?',
    a: "Go to Publish, fill in the steps, and submit. You'll see a success screen when done.",
  },
  {
    q: 'How do requests work?',
    a: 'Incoming requests appear in Requests → Incoming. You can accept or reject them.',
  },
  {
    q: 'Is payment handled here?',
    a: 'UI only for now. Pricing is shown as a placeholder without processing.',
  },
];

export default function HelpPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-10 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Find answers or contact us</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="space-y-2">
                <div className="font-medium">{f.q}</div>
                <p className="text-muted-foreground text-sm">{f.a}</p>
                {i < faqs.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

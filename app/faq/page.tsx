import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, Users, Car, CreditCard, Shield, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about Logeera rideshare platform, booking trips, safety, and more.',
  openGraph: {
    title: 'FAQ - Logeera',
    description: 'Find answers to common questions about Logeera rideshare platform.',
    url: '/faq',
  },
  twitter: {
    title: 'FAQ - Logeera',
    description: 'Find answers to common questions about Logeera rideshare platform.',
  },
};

const faqCategories = [
  {
    title: 'Getting Started',
    icon: Users,
    badge: 'Popular',
    faqs: [
      {
        question: 'How do I create an account on Logeera?',
        answer: 'Simply click "Sign Up" on our homepage, provide your email, phone number, and create a password. You\'ll need to verify your email and phone number to complete registration.',
      },
      {
        question: 'Is Logeera free to use?',
        answer: 'Creating an account and browsing trips is completely free. You only pay when you book a seat on a trip, and drivers keep most of the fare with a small service fee.',
      },
      {
        question: 'How do I find and book a trip?',
        answer: 'Use our search feature to enter your origin, destination, and travel date. Browse available trips, read driver reviews, and click "Request to Join" on your preferred trip.',
      },
    ],
  },
  {
    title: 'For Passengers',
    icon: Users,
    badge: 'Essential',
    faqs: [
      {
        question: 'How do I know if my trip request is accepted?',
        answer: 'You\'ll receive a notification when the driver accepts or declines your request. You can also check the status in your "Requests" section.',
      },
      {
        question: 'Can I cancel my trip request?',
        answer: 'Yes, you can cancel your request anytime before it\'s accepted. Once accepted, cancellation policies may apply depending on timing.',
      },
      {
        question: 'What if the driver doesn\'t show up?',
        answer: 'Contact the driver through our messaging system first. If they don\'t respond, use our emergency contact feature or call our support line immediately.',
      },
    ],
  },
  {
    title: 'For Drivers',
    icon: Car,
    badge: 'Drivers',
    faqs: [
      {
        question: 'How do I publish a trip?',
        answer: 'Click "Publish Trip" and fill in your departure/arrival locations, date, time, available seats, and price per seat. Add any additional details and publish.',
      },
      {
        question: 'How do I get paid?',
        answer: 'Payments are processed automatically after trip completion. Funds are typically available in your account within 2-3 business days.',
      },
      {
        question: 'Can I modify my trip after publishing?',
        answer: 'You can update trip details like time and price before passengers book. Major changes like route or date may require republishing.',
      },
    ],
  },
  {
    title: 'Safety & Security',
    icon: Shield,
    badge: 'Important',
    faqs: [
      {
        question: 'How does Logeera verify drivers?',
        answer: 'All drivers undergo background checks, license verification, and vehicle inspections. We also maintain a rating system for ongoing quality assurance.',
      },
      {
        question: 'What safety features are available?',
        answer: 'We offer real-time trip tracking, emergency contacts, driver ratings and reviews, and 24/7 safety support for peace of mind.',
      },
      {
        question: 'How do I report a safety concern?',
        answer: 'Use the "Report" feature in the app, contact our safety hotline, or email safety@logeera.com. Safety reports are treated with highest priority.',
      },
    ],
  },
  {
    title: 'Payments & Pricing',
    icon: CreditCard,
    badge: 'Money',
    faqs: [
      {
        question: 'How is pricing determined?',
        answer: 'Drivers set their own prices per seat. Prices typically reflect fuel costs, distance, and demand. Our platform adds a small service fee.',
      },
      {
        question: 'When am I charged?',
        answer: 'Payment is processed only after your trip request is accepted by the driver. You won\'t be charged for declined or pending requests.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, debit cards, PayPal, and digital wallets. Payment information is securely encrypted.',
      },
    ],
  },
  {
    title: 'Communication',
    icon: MessageCircle,
    badge: 'Connect',
    faqs: [
      {
        question: 'How do I contact my driver or passenger?',
        answer: 'Use our in-app messaging system to communicate safely. Phone numbers are only shared after trip confirmation for privacy.',
      },
      {
        question: 'Can I call the driver directly?',
        answer: 'Phone contact is available after your request is accepted. We provide a secure way to call without sharing personal numbers.',
      },
      {
        question: 'What if someone is not responding to messages?',
        answer: 'Try calling if available. If still no response, contact our support team who can help facilitate communication or assist with alternatives.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg">
          Find quick answers to common questions about using Logeera.
        </p>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-6">
        {faqCategories.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {category.title}
                  <Badge variant="secondary">{category.badge}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Still Need Help */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Still Need Help?</h2>
            <p className="text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="/contact" 
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                Contact Support
              </a>
              <a 
                href="/help" 
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-muted"
              >
                Help Center
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

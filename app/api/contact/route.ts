import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  category: z.enum(['general', 'technical', 'safety', 'billing', 'feedback']),
  message: z.string().min(5, 'Message must be at least 5 characters').max(1000, 'Message too long'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, category, message } = contactSchema.parse(body);

    // Map frontend categories to database enums
    const categoryMap: Record<string, string> = {
      'general': 'GENERAL',
      'technical': 'TECHNICAL',
      'safety': 'SAFETY',
      'billing': 'BILLING',
      'feedback': 'FEEDBACK',
    };

    // Create contact submission
    const contactSubmission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        category: categoryMap[category] as any,
        message,
        status: 'OPEN',
        priority: category === 'safety' ? 'HIGH' : 'MEDIUM',
      },
    });

    // TODO: Send email notification to support team
    // TODO: Send auto-reply email to user

    return NextResponse.json({
      message: 'Contact form submitted successfully',
      id: contactSubmission.id,
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

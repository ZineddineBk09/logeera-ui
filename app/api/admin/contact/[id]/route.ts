import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const updateSubmissionSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  response: z.string().optional(),
});

async function getContactSubmission(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const submissionId = req.url?.split('/')[6]; // Extract submission ID from URL

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 },
      );
    }

    const submission = await prisma.contactSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function updateContactSubmission(req: AuthenticatedRequest) {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const submissionId = req.url?.split('/')[6]; // Extract submission ID from URL

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 },
      );
    }

    const body = await req.json();
    const validatedData = updateSubmissionSchema.parse(body);

    const updateData: any = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;
    }

    if (validatedData.priority) {
      updateData.priority = validatedData.priority;
    }

    if (validatedData.response) {
      updateData.response = validatedData.response;
      updateData.respondedBy = req.user.userId;
      updateData.respondedAt = new Date();

      // If providing a response, automatically mark as resolved if not already closed
      if (!validatedData.status) {
        updateData.status = 'RESOLVED';
      }
    }

    const submission = await prisma.contactSubmission.update({
      where: { id: submissionId },
      data: updateData,
    });

    // TODO: Send email notification to user if response is provided

    return NextResponse.json({
      message: 'Submission updated successfully',
      submission,
    });
  } catch (error) {
    console.error('Error updating contact submission:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getContactSubmission);
export const PATCH = withAuth(updateContactSubmission);

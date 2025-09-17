import { NextResponse } from 'next/server';
import { register, collectDefaultMetrics } from 'prom-client';

// Initialize metrics collection
try {
  collectDefaultMetrics();
} catch (error) {
  console.log('Metrics collection already initialized');
}

export async function GET() {
  try {
    const metrics = await register.metrics();
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    return new NextResponse('Metrics not available', { status: 503 });
  }
}

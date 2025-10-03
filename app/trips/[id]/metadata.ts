import type { Metadata } from 'next';
import { prisma } from '@/lib/database';
import { notFound } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://logeera.com';

export async function generateTripMetadata(id: string): Promise<Metadata> {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        publisher: {
          select: {
            name: true,
            averageRating: true,
            ratingCount: true,
          },
        },
      },
    });

    if (!trip) {
      return notFound();
    }

    const date = new Date(trip.departureAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const tripType = trip.payloadType === 'PARCEL' ? 'Parcel Delivery' : 'Rideshare Trip';
    const capacity = trip.payloadType === 'PARCEL' 
      ? `${trip.parcelWeight || trip.capacity}kg` 
      : `${trip.capacity} seats`;

    const title = `${trip.originName} to ${trip.destinationName} - ${tripType}`;
    const description = `${tripType} from ${trip.originName} to ${trip.destinationName} on ${date}. ${capacity} available. Trusted driver ${trip.publisher.name} with ${trip.publisher.averageRating.toFixed(1)} ⭐ rating.`;

    return {
      title,
      description,
      keywords: [
        `${trip.originName} to ${trip.destinationName}`,
        `rideshare ${trip.originName}`,
        `rideshare ${trip.destinationName}`,
        tripType.toLowerCase(),
        'trusted driver',
        trip.vehicleType.toLowerCase(),
        date,
      ],
      alternates: {
        canonical: `/trips/${id}`,
      },
      openGraph: {
        type: 'website',
        url: `/trips/${id}`,
        title,
        description,
        images: [
          {
            url: `/trips/${id}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`/trips/${id}/opengraph-image`],
      },
    };
  } catch (error) {
    console.error('Error generating trip metadata:', error);
    return {
      title: 'Trip Details',
      description: 'View trip details on Logeera',
    };
  }
}


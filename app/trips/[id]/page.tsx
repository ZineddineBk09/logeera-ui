import type { Metadata } from 'next';
import { TripDetails } from '@/components/trip-details';
import { prisma } from '@/lib/database';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        publisher: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!trip) {
      return {
        title: 'Trip Not Found',
        description: 'The requested trip could not be found.',
      };
    }

    const title = `${trip.originName} to ${trip.destinationName}`;
    const description = `Join ${trip.publisher.name} on a trip from ${trip.originName} to ${trip.destinationName}. Departure: ${new Date(trip.departureAt).toLocaleDateString()}. ${trip.capacity} seats available for $${trip.pricePerSeat} per seat.`;

    return {
      title,
      description,
      openGraph: {
        title: `${title} - Logeera`,
        description,
        url: `/trips/${params.id}`,
      },
      twitter: {
        title: `${title} - Logeera`,
        description,
      },
    };
  } catch (error) {
    console.error('Error generating trip metadata:', error);
    return {
      title: 'Trip Details',
      description:
        'View trip details and book your seat with trusted drivers on Logeera.',
    };
  }
}

export default function TripDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <TripDetails tripId={params.id} />;
}

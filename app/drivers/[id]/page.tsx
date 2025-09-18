import type { Metadata } from 'next';
import { DriverProfile } from '@/components/driver-profile';
import { prisma } from '@/lib/database';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        averageRating: true,
        ratingCount: true,
        status: true,
        _count: {
          select: {
            publishedTrips: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
    });

    if (!user) {
      return {
        title: 'Driver Not Found',
        description: 'The requested driver profile could not be found.',
      };
    }

    const title = `${user.name} - Driver Profile`;
    const description = `View ${user.name}'s profile on Logeera. ${user.averageRating ? `${user.averageRating.toFixed(1)} star rating` : 'New driver'} with ${user._count.publishedTrips} completed trips. ${user.status === 'TRUSTED' ? 'Verified trusted driver' : 'Driver'} on Africa's leading rideshare platform.`;

    return {
      title,
      description,
      openGraph: {
        title: `${title} - Logeera`,
        description,
        url: `/drivers/${params.id}`,
      },
      twitter: {
        title: `${title} - Logeera`,
        description,
      },
    };
  } catch (error) {
    console.error('Error generating driver metadata:', error);
    return {
      title: 'Driver Profile',
      description:
        'View driver profile, ratings, and available trips on Logeera.',
    };
  }
}

export default function DriverProfilePage({ params }: Props) {
  return <DriverProfile driverId={params.id} />;
}

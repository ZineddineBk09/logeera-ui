import { TripDetails } from "@/components/trip-details";

export default function TripDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <TripDetails tripId={params.id} />;
}

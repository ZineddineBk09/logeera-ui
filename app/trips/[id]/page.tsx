import { AppShell } from "@/components/app-shell"
import { TripDetails } from "@/components/trip-details"

export default function TripDetailsPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <TripDetails tripId={params.id} />
    </AppShell>
  )
}

import { DriverProfile } from "@/components/driver-profile";

interface DriverProfilePageProps {
  params: {
    id: string;
  };
}

export default function DriverProfilePage({ params }: DriverProfilePageProps) {
  return <DriverProfile driverId={params.id} />;
}

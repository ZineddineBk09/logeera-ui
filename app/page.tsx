import { AppShell } from "@/components/app-shell";
import { SearchHero } from "@/components/search-hero";
import { HowItWorks } from "@/components/how-it-works";
import { TrustedPublishers } from "@/components/trusted-publishers";

export default function HomePage() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 space-y-16">
        <SearchHero />
        <HowItWorks />
        <TrustedPublishers />
      </div>
    </AppShell>
  );
}

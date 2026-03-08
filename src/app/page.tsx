import Hero from "@/components/Hero";
import UsageStatsBar from "@/components/UsageStatsBar";
import ToolsGrid from "@/components/ToolsGrid";
import PrivacyTrust from "@/components/PrivacyTrust";
import HomeSeoContent from "@/components/HomeSeoContent";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <UsageStatsBar />
      <ToolsGrid />
      <PrivacyTrust />
      <HomeSeoContent />
    </main>
  );
}

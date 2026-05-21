import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import PlansSection from "@/components/home/PlansSection";
import LiveTicker from "@/components/home/LiveTicker";
import ProfitSimulator from "@/components/home/ProfitSimulator";
import ReferralSection from "@/components/home/ReferralSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <LiveTicker />
      <PlansSection />
      <ProfitSimulator />
      <ReferralSection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </main>
  );
}

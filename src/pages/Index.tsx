import LandingHeader from "@/components/LandingHeader";
import Hero from "@/components/Hero";
import LogoCloud from "@/components/LogoCloud";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
import PricingPreview from "@/components/PricingPreview";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <LandingHeader />
      <Hero />
      <LogoCloud />
      <Features />
      <HowItWorks />
      <UseCases />
      <PricingPreview />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;

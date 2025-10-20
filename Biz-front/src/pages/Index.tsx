import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import LoyaltyExplained from "@/components/landing/LoyaltyExplained";
import Categories from "@/components/landing/Categories";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <LoyaltyExplained />
      <Categories />
      <Footer />
    </div>
  );
};

export default Index;

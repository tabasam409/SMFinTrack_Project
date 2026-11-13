import "./LandingPage.css";

import Navbar from "../Navbar/Navbar";
import HeroSection from "../HeroSection/HeroSection";
import FutureSection from "../FutureSection/FutureSection";
import FeaturesSection from "../FeaturesSection/FeaturesSection";
import HowItWorks from "../HowItWorks/HowItWorks";
import TestimonialStats from "../TestimonialStats/TestimonialStats";
import Footer from "../Footer/Footer";
function LandingPage() {
  return (
    <div className="landing-page">

      <Navbar />

      <HeroSection />

      <FutureSection />

      <FeaturesSection />

      <HowItWorks />

      <TestimonialStats />

      

      <Footer /> 

    </div>
  );
}

export default LandingPage;
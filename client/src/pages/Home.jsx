import AOS from "aos";
import "aos/dist/aos.css";
import React, { useEffect } from "react";
import Faq from "../components/Home/Faq";
import Footer from "../components/Home/Footer";
import HeroSection from "../components/Home/HeroSection";
import HowItWorks from "../components/Home/HowItWorks";
import OurServices from "../components/Home/OurService";
import Review from "../components/Home/Review";
import WhySolvit from "../components/Home/WhySolvit";

const Home = () => {
  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-out",
      once: true,
      anchorPlacement: "top-bottom",
    });
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="fixed inset-0 -z-50 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/20 via-white to-purple-50/30"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/20 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100/20 rounded-full filter blur-[120px]"></div>
      </div>

      {/* Animated floating circles */}
      <div className="fixed inset-0 -z-40 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-blue-200/30 rounded-full animate-float1"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-purple-200/30 rounded-full animate-float2"></div>
        <div className="absolute bottom-1/4 right-1/3 w-6 h-6 bg-cyan-200/30 rounded-full animate-float3"></div>
      </div>

      <div className="relative z-10">
        <HeroSection />
        <div className="bg-gradient-to-b from-white to-blue-50/30 py-16">
          <OurServices />
        </div>
        <div className="bg-gradient-to-b from-blue-50/30 to-purple-50/20 py-16">
          <HowItWorks />
        </div>
        <div className="bg-gradient-to-b from-purple-50/20 to-white py-16">
          <WhySolvit />
        </div>
        {/* <div className="bg-gradient-to-b from-white to-blue-50/30 py-16">
          <Review />
        </div> */}
        <div className="bg-gradient-to-b from-blue-50/30 to-white py-16">
          <Faq />
        </div>
        <Footer />
      </div>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes float1 {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-40px) translateX(20px);
          }
        }
        @keyframes float2 {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(30px) translateX(-30px);
          }
        }
        @keyframes float3 {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(40px);
          }
        }
        .animate-float1 {
          animation: float1 8s ease-in-out infinite;
        }
        .animate-float2 {
          animation: float2 10s ease-in-out infinite;
        }
        .animate-float3 {
          animation: float3 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;

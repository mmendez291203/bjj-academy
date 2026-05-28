import Hero from "@/components/landing/Hero";
import Mission from "@/components/landing/Mission";
import Features from "@/components/landing/Features";
import Instructors from "@/components/landing/Instructors";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Mission />
      <Features />
      <Instructors />
      <Testimonials />
      <CTA />
    </>
  );
}

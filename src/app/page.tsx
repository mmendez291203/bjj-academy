import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Instructors from "@/components/landing/Instructors";
import Testimonials from "@/components/landing/Testimonials";
import CTA from "@/components/landing/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Instructors />
      <Testimonials />
      <CTA />
    </>
  );
}

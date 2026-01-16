import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-coral-50 to-mint-50">
      <Header />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}

import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="bg-purple-600 rounded-3xl p-12 lg:p-16 text-center shadow-lg">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
          Ready to Create Your First AI-Powered Ad?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join business owners who are already creating high-performing Meta ads with AI.
        </p>
        <a
          href="https://app.jupho.io/sign-up"
          className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5" />
        </a>
        <p className="mt-4 text-white/80 text-sm">
          No credit card required · Start creating in 60 seconds
        </p>
      </div>
    </section>
  );
}

import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Deep slate gradient background - infrastructure authority */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-98" />
      
      {/* Animated accent blobs - purple & cyan */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-tiltFloat" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-bounceSpring" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
            Create High-Performing
            <span className="block mt-2 text-purple-400"> Meta Ads </span>
            with AI
          </h1>
          <p className="text-xl lg:text-2xl text-white/95 mb-10 leading-relaxed drop-shadow-md font-medium">
            Let AI build your Meta ads automatically. No creative skills needed. 
            Just tell us about your business and get professional ads in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://app.jupho.io/sign-up"
              className="group inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:-translate-y-1 transition-all duration-300"
              style={{ boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.3)' }}
            >
              Start Creating Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 hover:border-white/60 transition-all duration-300"
            >
              See How It Works
            </a>
          </div>
          <div className="mt-8 space-y-3">
            <p className="text-base text-white/90 font-medium">
              <CheckCircle2 className="w-5 h-5 inline text-emerald-400 mr-1" /> No credit card required
              <span className="mx-3">·</span>
              <CheckCircle2 className="w-5 h-5 inline text-emerald-400 mr-1" /> Free plan available
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto-backup to Google Sheets
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Connect to 5,000+ apps
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 50+ proven templates
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

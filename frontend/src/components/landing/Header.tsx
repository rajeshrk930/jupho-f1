import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <span className="text-2xl font-bold text-charcoal-900">Jupho</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://app.jupho.io/sign-in"
            className="text-charcoal-700 hover:text-purple-600 font-medium transition-colors"
          >
            Sign In
          </a>
          <a
            href="https://app.jupho.io/sign-up"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}

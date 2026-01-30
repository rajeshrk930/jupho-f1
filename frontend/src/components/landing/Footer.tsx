import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-lg font-bold text-charcoal-900">Jupho</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-charcoal-600 hover:text-purple-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-charcoal-600 hover:text-purple-600 transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="text-sm text-charcoal-600">
            © 2026 Jupho · AI-powered Meta ads for business owners
          </p>
        </div>
      </div>
    </footer>
  );
}

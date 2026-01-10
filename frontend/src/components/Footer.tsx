import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-8 text-center">
      <p className="text-xs text-charcoal-500">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-charcoal-700 transition-colors">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-charcoal-700 transition-colors">
          Privacy Policy
        </Link>
      </p>
      <p className="text-xs text-charcoal-400 mt-2">
        © 2026 Jupho · AI-powered Meta ads for business owners
      </p>
    </footer>
  );
}

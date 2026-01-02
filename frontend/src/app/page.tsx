import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900">Jupho</h1>
          <div className="flex gap-3">
            <Link href="/login" className="btn-secondary">
              Login
            </Link>
            <Link href="/signup" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Know why your Meta ads fail
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Upload your creative. Get one clear reason, supporting logic, and exactly one fix.
        </p>
        <Link href="/analyze" className="btn-primary text-lg px-8 py-3 inline-block">
          Start Analyzing
        </Link>
      </main>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">
          How it works
        </h3>
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Upload your creative</p>
              <p className="text-gray-600 text-sm">Image or video from your ad.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Enter ad details and metrics</p>
              <p className="text-gray-600 text-sm">Primary text, headline, CTR, CPM, CPC/CPA.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Get your analysis</p>
              <p className="text-gray-600 text-sm">One reason. Supporting logic. One fix.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <p className="text-center text-sm text-gray-500">
          © 2026 Jupho. Built for ad professionals.
        </p>
      </footer>
    </div>
  );
}

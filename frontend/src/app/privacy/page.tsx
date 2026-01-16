import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-coral-50 to-mint-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5 text-charcoal-600" />
            <Sparkles className="w-6 h-6 text-coral-600" />
            <span className="text-2xl font-bold text-charcoal-900">Jupho</span>
          </Link>
          <Link
            href="/sign-up"
            className="bg-coral-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-coral-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-charcoal-900 mb-4">Privacy Policy</h1>
        <p className="text-charcoal-600 mb-8">Last updated: January 16, 2026</p>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <p className="text-charcoal-700 leading-relaxed">
              Welcome to Jupho ("we", "our", "us").
              We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect information when you use our AI-powered Meta ads creation platform.
            </p>
            <p className="text-charcoal-700 leading-relaxed">
              By using Jupho, you agree to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">1. Introduction</h2>
            <p className="text-charcoal-700 leading-relaxed">
              Jupho is an AI-powered platform that helps businesses create and launch Meta (Facebook) advertising campaigns using automation and artificial intelligence. To provide these services, we collect and process certain information as described below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">2.1 Information You Provide Directly</h3>
            <p className="text-charcoal-700 leading-relaxed mb-2">We may collect the following information when you use Jupho:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Account information (name, email address, password)</li>
              <li>Business information (business name, industry, website or social profile)</li>
              <li>Advertising preferences (budget, goals, location, audience details)</li>
              <li>Payment information (processed securely via Razorpay; we do not store card details)</li>
              <li>Communications with our support team</li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">2.2 Facebook / Meta Data</h3>
            <p className="text-charcoal-700 leading-relaxed mb-2">
              When you connect your Facebook (Meta) account to Jupho, we may access:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Facebook user ID</li>
              <li>Ad account IDs</li>
              <li>Facebook Pages you manage</li>
              <li>Campaign, ad set, and ad data</li>
              <li>Lead data generated through Meta Lead Forms (such as name, phone number, and email)</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              We only access data required to create, manage, and display advertising campaigns.
              We do not access personal Facebook profiles, private messages, or data unrelated to advertising operations.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">2.3 Automatically Collected Information</h3>
            <p className="text-charcoal-700 leading-relaxed mb-2">We may automatically collect:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Device and browser information (IP address, browser type, operating system)</li>
              <li>Usage data (pages viewed, features used, time spent)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-charcoal-700 leading-relaxed mb-2">We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Provide and operate the Jupho platform</li>
              <li>Create and manage Meta advertising campaigns on your behalf</li>
              <li>Generate AI-based ad copy and campaign strategies</li>
              <li>Create and manage Meta Lead Generation Forms</li>
              <li>Process payments and manage subscriptions</li>
              <li>Communicate with you regarding updates, support, or service notices</li>
              <li>Improve platform performance and user experience</li>
              <li>Detect fraud, abuse, or unauthorized access</li>
              <li>Comply with legal and regulatory requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">4. Facebook / Meta Integration</h2>
            <p className="text-charcoal-700 leading-relaxed">
              Jupho integrates with Meta's Marketing API and requires the <code className="bg-charcoal-50 px-2 py-1 rounded text-sm">ads_management</code> permission to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Create and manage ad campaigns, ad sets, and ads</li>
              <li>Access connected ad accounts and Pages</li>
              <li>Retrieve and display campaign-related data</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              You may revoke Jupho's access at any time through your Facebook account settings.
              Jupho uses Meta data strictly in accordance with Meta Platform Terms and Policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">5. AI and Data Processing</h2>
            <p className="text-charcoal-700 leading-relaxed mb-2">
              Jupho uses OpenAI's language models to generate ad copy and assist with campaign creation.
            </p>
            <p className="text-charcoal-700 leading-relaxed mb-2">When you interact with our AI features:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Business inputs and prompts may be processed by OpenAI</li>
              <li>Your data is not used to train OpenAI models</li>
              <li>Generated content may be stored in our system for your reference</li>
              <li>Data is protected using encryption and access controls</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">6. Information Sharing and Disclosure</h2>
            <p className="text-charcoal-700 leading-relaxed mb-2">
              We do not sell or rent your personal data.
            </p>
            <p className="text-charcoal-700 leading-relaxed mb-2">
              We may share information only with trusted service providers, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li><strong>OpenAI</strong> – AI text generation</li>
              <li><strong>Razorpay</strong> – payment processing</li>
              <li><strong>Meta (Facebook)</strong> – ad creation and management</li>
              <li><strong>Hosting and infrastructure providers</strong> – platform operations</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              We may also disclose information if required by law, legal process, or to protect our rights and safety.
            </p>
            <p className="text-charcoal-700 leading-relaxed">
              In the event of a merger, acquisition, or asset sale, user information may be transferred as part of that transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">7. Data Security</h2>
            <p className="text-charcoal-700 leading-relaxed mb-2">
              We implement industry-standard security practices, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>HTTPS / TLS encryption</li>
              <li>Encrypted storage of sensitive data</li>
              <li>Secure password hashing</li>
              <li>Token-based authentication</li>
              <li>Access controls and monitoring</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              Despite our efforts, no system is completely secure. We cannot guarantee absolute security of data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">8. Data Retention</h2>
            <p className="text-charcoal-700 leading-relaxed mb-2">
              We retain information only as long as necessary to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Provide our services</li>
              <li>Meet legal and regulatory obligations</li>
              <li>Resolve disputes and enforce agreements</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              If you delete your account, your data will be deleted or anonymized within 90 days, unless legally required to retain it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">9. Your Rights and Choices</h2>
            <p className="text-charcoal-700 leading-relaxed mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Access your personal data</li>
              <li>Update or correct your information</li>
              <li>Request deletion of your data</li>
              <li>Export your data where applicable</li>
              <li>Opt out of marketing communications</li>
              <li>Revoke Meta account access</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              Requests can be made by contacting us at the email address below.
            </p>
          </section>

          <section className="bg-coral-50 border border-coral-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">9A. Facebook Data Deletion Instructions</h2>
            <p className="text-charcoal-700 leading-relaxed mb-3">
              Jupho complies with Facebook's data deletion requirements.
            </p>
            <p className="text-charcoal-700 leading-relaxed mb-2">
              To request deletion of data accessed via Facebook / Meta APIs, please email us at:
            </p>
            <div className="bg-white p-4 rounded-lg border border-coral-300 my-4">
              <p className="text-charcoal-900 font-semibold">Email: privacy@jupho.io</p>
              <p className="text-charcoal-700 mt-2"><strong>Subject:</strong> Facebook Data Deletion Request</p>
            </div>
            <p className="text-charcoal-700 leading-relaxed mb-2">Please include:</p>
            <ul className="list-disc pl-6 space-y-1 text-charcoal-700">
              <li>Your registered email address</li>
              <li>Your Facebook User ID</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              We will process the request in accordance with applicable laws and Meta Platform Policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">10. Cookies and Tracking Technologies</h2>
            <p className="text-charcoal-700 leading-relaxed mb-2">We use cookies to:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Maintain login sessions</li>
              <li>Store user preferences</li>
              <li>Analyze platform usage</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              You can manage cookies via your browser settings. Disabling cookies may affect functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">11. Children's Privacy</h2>
            <p className="text-charcoal-700 leading-relaxed">
              Jupho is not intended for individuals under the age of 18.
              We do not knowingly collect data from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">12. International Data Transfers</h2>
            <p className="text-charcoal-700 leading-relaxed">
              Your information may be processed in countries outside your residence.
              We ensure appropriate safeguards are in place to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">13. Changes to This Privacy Policy</h2>
            <p className="text-charcoal-700 leading-relaxed">
              We may update this Privacy Policy from time to time. Updates will be reflected on this page with a revised "Last updated" date. Continued use of Jupho indicates acceptance of changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">14. Contact Us</h2>
            <p className="text-charcoal-700 leading-relaxed mb-3">
              If you have any questions about this Privacy Policy or your data:
            </p>
            <div className="mt-4 bg-charcoal-50 p-4 rounded-lg">
              <p className="text-charcoal-700"><strong>Email:</strong> hi@jupho.io</p>
              <p className="text-charcoal-700 mt-2"><strong>Company:</strong> Jupho</p>
              <p className="text-charcoal-700 mt-2"><strong>Website:</strong> https://jupho.io</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-charcoal-200 text-center">
          <Link 
            href="/login"
            className="text-sm text-coral-600 hover:text-coral-700 font-medium"
          >
            Back to Login
          </Link>
          <span className="mx-3 text-charcoal-300">|</span>
          <Link 
            href="/terms"
            className="text-sm text-coral-600 hover:text-coral-700 font-medium"
          >
            Terms of Service
          </Link>
        </div>
        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-charcoal-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="h-5 w-5 text-primary-500" />
              <span className="font-semibold text-charcoal-900">Jupho</span>
            </div>
            <div className="flex gap-6 text-sm text-charcoal-600">
              <Link href="/privacy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary-500 transition-colors">Terms of Service</Link>
              <Link href="mailto:support@jupho.io" className="hover:text-primary-500 transition-colors">Contact</Link>
            </div>
          </div>
          <p className="text-center text-sm text-charcoal-500 mt-6">© 2026 Jupho. All rights reserved.</p>
        </footer>      </div>
    </div>
  );
}

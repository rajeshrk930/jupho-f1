import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-coral-50 to-mint-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-charcoal-100 p-8 md:p-12">
        <div className="mb-8">
          <Link 
            href="/"
            className="text-sm text-charcoal-600 hover:text-charcoal-800 mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-charcoal-900 mb-2">Privacy Policy</h1>
          <p className="text-charcoal-600">Last updated: January 10, 2026</p>
        </div>

        <div className="prose prose-charcoal max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">1. Introduction</h2>
            <p className="text-charcoal-700 leading-relaxed">
              Welcome to Jupho ("we," "our," or "us"). We are committed to protecting your personal information 
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our AI-powered Meta ads creation tool.
            </p>
            <p className="text-charcoal-700 leading-relaxed">
              By using Jupho, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">2.1 Personal Information</h3>
            <p className="text-charcoal-700 leading-relaxed mb-2">We collect information that you provide directly to us:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Account information (name, email address, password)</li>
              <li>Business information (company name, business type)</li>
              <li>Payment information (processed securely through Razorpay)</li>
              <li>Communications with our support team</li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">2.2 Facebook/Meta Data</h3>
            <p className="text-charcoal-700 leading-relaxed mb-2">
              When you connect your Facebook account to Jupho, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Facebook account ID and access tokens</li>
              <li>Ad accounts associated with your Facebook account</li>
              <li>Facebook Pages you manage</li>
              <li>Ad campaign data (for display and management purposes)</li>
              <li>Business information from your Facebook Business Manager</li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">2.3 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, features used, time spent on platform)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-charcoal-700 leading-relaxed mb-2">We use the collected information for:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Providing and maintaining our AI-powered ad creation service</li>
              <li>Creating and managing Meta/Facebook ad campaigns on your behalf</li>
              <li>Processing your payments and managing subscriptions</li>
              <li>Generating AI-powered ad copy and creative suggestions</li>
              <li>Improving our services and developing new features</li>
              <li>Communicating with you about updates, offers, and support</li>
              <li>Analyzing usage patterns to enhance user experience</li>
              <li>Detecting and preventing fraud or unauthorized access</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">4. Facebook/Meta Integration</h2>
            <p className="text-charcoal-700 leading-relaxed">
              Jupho integrates with Facebook's Marketing API to create and manage your Meta ads. We require 
              <code className="bg-charcoal-50 px-2 py-1 rounded text-sm">ads_management</code> permission to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Create ad campaigns, ad sets, and ads on your behalf</li>
              <li>Access your ad accounts and Facebook Pages</li>
              <li>Retrieve ad performance data</li>
              <li>Update and manage existing campaigns</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              You can revoke Jupho's access to your Facebook account at any time through your Facebook settings. 
              We only access data necessary to provide our services and comply with Facebook's Platform Terms 
              and Policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">5. AI and Data Processing</h2>
            <p className="text-charcoal-700 leading-relaxed">
              We use OpenAI's GPT-4o-mini to generate ad copy and provide conversational assistance. When you 
              interact with our AI agent:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Your conversations and business information may be sent to OpenAI for processing</li>
              <li>We do not use your data to train OpenAI's models</li>
              <li>Generated content is stored in our database for your future reference</li>
              <li>We implement security measures to protect data in transit and at rest</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">6. Information Sharing and Disclosure</h2>
            <p className="text-charcoal-700 leading-relaxed mb-2">We may share your information with:</p>
            
            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">6.1 Service Providers</h3>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li><strong>OpenAI:</strong> For AI-powered ad copy generation</li>
              <li><strong>Razorpay:</strong> For payment processing</li>
              <li><strong>Facebook/Meta:</strong> For ad creation and management</li>
              <li><strong>Hosting providers:</strong> For platform infrastructure</li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">6.2 Legal Requirements</h3>
            <p className="text-charcoal-700 leading-relaxed">
              We may disclose your information if required by law, court order, or to protect our rights and safety.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">6.3 Business Transfers</h3>
            <p className="text-charcoal-700 leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred 
              to the acquiring entity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">7. Data Security</h2>
            <p className="text-charcoal-700 leading-relaxed">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Encrypted storage of sensitive information</li>
              <li>Secure password hashing (bcrypt)</li>
              <li>JWT-based authentication</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              However, no method of transmission over the internet is 100% secure. While we strive to protect 
              your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">8. Data Retention</h2>
            <p className="text-charcoal-700 leading-relaxed">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations (e.g., tax records)</li>
              <li>Resolve disputes and enforce agreements</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              When you delete your account, we will delete or anonymize your personal information within 90 days, 
              except where we are required to retain it by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">9. Your Rights and Choices</h2>
            <p className="text-charcoal-700 leading-relaxed mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Revoke consent:</strong> Disconnect Facebook/Meta integration</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              To exercise these rights, contact us at the email address below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">10. Cookies and Tracking</h2>
            <p className="text-charcoal-700 leading-relaxed">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Maintain your login session</li>
              <li>Remember your preferences</li>
              <li>Analyze platform usage and performance</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              You can control cookies through your browser settings. Disabling cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">11. Children's Privacy</h2>
            <p className="text-charcoal-700 leading-relaxed">
              Jupho is not intended for users under the age of 18. We do not knowingly collect information from 
              children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">12. International Data Transfers</h2>
            <p className="text-charcoal-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. 
              We ensure appropriate safeguards are in place to protect your information in accordance with this 
              Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">13. Changes to This Privacy Policy</h2>
            <p className="text-charcoal-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Posting the new Privacy Policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending you an email notification (for material changes)</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              Your continued use of Jupho after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">14. Contact Us</h2>
            <p className="text-charcoal-700 leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 bg-charcoal-50 p-4 rounded-lg">
              <p className="text-charcoal-700"><strong>Email:</strong> privacy@jupho.io</p>
              <p className="text-charcoal-700 mt-2"><strong>Company:</strong> Jupho</p>
              <p className="text-charcoal-700 mt-2"><strong>Website:</strong> https://jupho.io</p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-charcoal-200">
            <p className="text-sm text-charcoal-600">
              This Privacy Policy complies with applicable data protection laws including GDPR (EU), 
              CCPA (California), and other regional regulations. For specific rights under your local 
              jurisdiction, please contact us.
            </p>
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
      </div>
    </div>
  );
}

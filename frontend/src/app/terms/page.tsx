import Link from 'next/link';

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-charcoal-900 mb-2">Terms of Service</h1>
          <p className="text-charcoal-600">Last updated: January 10, 2026</p>
        </div>

        <div className="prose prose-charcoal max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-charcoal-700 leading-relaxed">
              By accessing or using Jupho ("Platform", "Service", "we", "our", or "us"), you agree to be bound 
              by these Terms of Service and all applicable laws and regulations. If you do not agree with any 
              of these terms, you are prohibited from using this Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">2. Description of Service</h2>
            <p className="text-charcoal-700 leading-relaxed">
              Jupho is an AI-powered Meta ads creation tool designed for business owners. Our Service provides:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>AI-powered conversational interface for creating Meta/Facebook ads</li>
              <li>Automated ad copy generation (headlines, descriptions, primary text)</li>
              <li>Direct integration with Facebook Marketing API</li>
              <li>Ad campaign management and creation on behalf of users</li>
              <li>Payment processing for subscription plans</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">3. Account Registration</h2>
            
            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">3.1 Eligibility</h3>
            <p className="text-charcoal-700 leading-relaxed">
              You must be at least 18 years old and have the legal capacity to enter into contracts to use Jupho. 
              By creating an account, you represent and warrant that you meet these requirements.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">3.2 Account Security</h3>
            <p className="text-charcoal-700 leading-relaxed">You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Providing accurate and current information</li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">3.3 Account Termination</h3>
            <p className="text-charcoal-700 leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these Terms or engage 
              in fraudulent, illegal, or abusive activities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">4. Facebook/Meta Integration</h2>
            
            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">4.1 Authorization</h3>
            <p className="text-charcoal-700 leading-relaxed">
              By connecting your Facebook account to Jupho, you authorize us to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Access your Facebook ad accounts and Pages</li>
              <li>Create, manage, and modify ad campaigns on your behalf</li>
              <li>Retrieve ad performance data</li>
              <li>Access business information from Facebook Business Manager</li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">4.2 Compliance with Facebook Policies</h3>
            <p className="text-charcoal-700 leading-relaxed">
              You agree to comply with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Facebook's Terms of Service</li>
              <li>Facebook Advertising Policies</li>
              <li>Facebook Platform Terms</li>
              <li>All applicable Meta policies and guidelines</li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">4.3 Ad Content Responsibility</h3>
            <p className="text-charcoal-700 leading-relaxed">
              You are solely responsible for the content of ads created through Jupho. You must ensure that 
              your ads comply with all applicable laws and Facebook's advertising policies. We are not liable 
              for ad rejections, account suspensions, or policy violations.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">4.4 Revoking Access</h3>
            <p className="text-charcoal-700 leading-relaxed">
              You may revoke Jupho's access to your Facebook account at any time through your Facebook settings. 
              This will disable ad creation and management features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">5. Payment and Subscription</h2>
            
            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">5.1 Pricing</h3>
            <p className="text-charcoal-700 leading-relaxed">
              Subscription fees are charged according to the plan you select. All prices are in the currency 
              specified on our pricing page and are subject to change with 30 days' notice.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">5.2 Payment Processing</h3>
            <p className="text-charcoal-700 leading-relaxed">
              Payments are processed through Razorpay. By providing payment information, you authorize us to 
              charge your payment method for all fees incurred. You are responsible for ensuring your payment 
              information is current and accurate.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">5.3 Billing Cycle</h3>
            <p className="text-charcoal-700 leading-relaxed">
              Subscriptions are billed on a recurring basis according to your selected plan (monthly or annual). 
              Your subscription will automatically renew unless cancelled before the renewal date.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">5.4 Refunds</h3>
            <p className="text-charcoal-700 leading-relaxed">
              All payments are non-refundable except as required by law. If you cancel your subscription, you 
              will retain access until the end of your current billing period.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">5.5 Ad Spend</h3>
            <p className="text-charcoal-700 leading-relaxed">
              Jupho subscription fees are separate from your Facebook/Meta ad spend. You are responsible for 
              all advertising costs charged by Facebook/Meta for running your campaigns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">6. AI-Generated Content</h2>
            
            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">6.1 AI Assistance</h3>
            <p className="text-charcoal-700 leading-relaxed">
              Jupho uses artificial intelligence to generate ad copy and provide recommendations. AI-generated 
              content is provided as suggestions only and should be reviewed before use.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">6.2 Content Review</h3>
            <p className="text-charcoal-700 leading-relaxed">
              You are responsible for reviewing, editing, and approving all AI-generated content before 
              publishing ads. We do not guarantee the accuracy, appropriateness, or effectiveness of 
              AI-generated content.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">6.3 Intellectual Property</h3>
            <p className="text-charcoal-700 leading-relaxed">
              You retain ownership of content you create or provide. AI-generated suggestions become your 
              property once incorporated into your ads. You are responsible for ensuring your content does 
              not infringe on third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">7. Prohibited Activities</h2>
            <p className="text-charcoal-700 leading-relaxed mb-2">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any laws, regulations, or third-party rights</li>
              <li>Create misleading, deceptive, or fraudulent ads</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Reverse engineer, decompile, or disassemble the Service</li>
              <li>Use automated means to access the Service without permission</li>
              <li>Transmit viruses, malware, or harmful code</li>
              <li>Impersonate others or provide false information</li>
              <li>Interfere with other users' use of the Service</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">8. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">8.1 Our Rights</h3>
            <p className="text-charcoal-700 leading-relaxed">
              The Service, including its design, functionality, software, and content (excluding user content), 
              is owned by Jupho and protected by copyright, trademark, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">8.2 Limited License</h3>
            <p className="text-charcoal-700 leading-relaxed">
              We grant you a limited, non-exclusive, non-transferable license to access and use the Service 
              for your internal business purposes, subject to these Terms.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">8.3 Feedback</h3>
            <p className="text-charcoal-700 leading-relaxed">
              Any feedback, suggestions, or ideas you provide to us become our property, and we may use them 
              without obligation or compensation to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">9. Disclaimers and Limitations</h2>
            
            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">9.1 "As Is" Service</h3>
            <p className="text-charcoal-700 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR 
              IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
              PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">9.2 No Guarantee of Results</h3>
            <p className="text-charcoal-700 leading-relaxed">
              We do not guarantee specific ad performance, ROI, conversions, or business results. Ad 
              effectiveness depends on many factors beyond our control.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">9.3 Service Availability</h3>
            <p className="text-charcoal-700 leading-relaxed">
              We do not guarantee uninterrupted or error-free service. We may suspend or restrict access for 
              maintenance, updates, or technical issues.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">9.4 Third-Party Services</h3>
            <p className="text-charcoal-700 leading-relaxed">
              We are not responsible for the actions, performance, or availability of third-party services 
              (Facebook/Meta, OpenAI, Razorpay) integrated with Jupho.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-charcoal-700 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, JUPHO AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY 
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, 
              REVENUE, DATA, OR BUSINESS OPPORTUNITIES ARISING FROM:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Your use or inability to use the Service</li>
              <li>Ad performance or campaign results</li>
              <li>Facebook/Meta account suspensions or policy violations</li>
              <li>Errors in AI-generated content</li>
              <li>Unauthorized access to your account</li>
              <li>Service interruptions or data loss</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO JUPHO IN THE 12 MONTHS PRECEDING 
              THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">11. Indemnification</h2>
            <p className="text-charcoal-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Jupho and its affiliates from any claims, 
              damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Your violation of these Terms</li>
              <li>Your ad content or campaigns</li>
              <li>Your violation of Facebook/Meta policies</li>
              <li>Your infringement of third-party rights</li>
              <li>Your negligence or willful misconduct</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">12. Termination</h2>
            
            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">12.1 By You</h3>
            <p className="text-charcoal-700 leading-relaxed">
              You may cancel your subscription at any time through your account settings. Cancellation takes 
              effect at the end of your current billing period.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">12.2 By Us</h3>
            <p className="text-charcoal-700 leading-relaxed">
              We may suspend or terminate your account immediately if you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Violate these Terms</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Fail to pay subscription fees</li>
              <li>Abuse or misuse the Service</li>
            </ul>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">12.3 Effect of Termination</h3>
            <p className="text-charcoal-700 leading-relaxed">
              Upon termination, you will lose access to the Service, and your data may be deleted according 
              to our Privacy Policy. Provisions regarding intellectual property, liability, and indemnification 
              survive termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">13. Modifications to Terms</h2>
            <p className="text-charcoal-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will provide notice of material 
              changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-charcoal-700 mt-2">
              <li>Posting updated Terms with a new "Last updated" date</li>
              <li>Sending email notification to registered users</li>
              <li>Displaying an in-app notification</li>
            </ul>
            <p className="text-charcoal-700 leading-relaxed mt-3">
              Continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">14. Governing Law and Disputes</h2>
            
            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">14.1 Governing Law</h3>
            <p className="text-charcoal-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
              without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">14.2 Dispute Resolution</h3>
            <p className="text-charcoal-700 leading-relaxed">
              Any disputes arising from these Terms shall be resolved through good faith negotiations. If 
              resolution cannot be reached, disputes shall be submitted to binding arbitration in accordance 
              with applicable arbitration rules.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">15. Miscellaneous</h2>
            
            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">15.1 Entire Agreement</h3>
            <p className="text-charcoal-700 leading-relaxed">
              These Terms, along with our Privacy Policy, constitute the entire agreement between you and 
              Jupho regarding the Service.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">15.2 Severability</h3>
            <p className="text-charcoal-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable, the remaining provisions shall 
              remain in full effect.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">15.3 Waiver</h3>
            <p className="text-charcoal-700 leading-relaxed">
              Our failure to enforce any right or provision of these Terms shall not constitute a waiver of 
              such right or provision.
            </p>

            <h3 className="text-xl font-semibold text-charcoal-800 mb-3 mt-4">15.4 Assignment</h3>
            <p className="text-charcoal-700 leading-relaxed">
              You may not assign or transfer these Terms without our prior written consent. We may assign 
              these Terms without restriction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-4">16. Contact Information</h2>
            <p className="text-charcoal-700 leading-relaxed">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 bg-charcoal-50 p-4 rounded-lg">
              <p className="text-charcoal-700"><strong>Email:</strong> legal@jupho.io</p>
              <p className="text-charcoal-700 mt-2"><strong>Support:</strong> support@jupho.io</p>
              <p className="text-charcoal-700 mt-2"><strong>Company:</strong> Jupho</p>
              <p className="text-charcoal-700 mt-2"><strong>Website:</strong> https://jupho.io</p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-charcoal-200">
            <p className="text-sm text-charcoal-600">
              By using Jupho, you acknowledge that you have read, understood, and agree to be bound by 
              these Terms of Service.
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
            href="/privacy"
            className="text-sm text-coral-600 hover:text-coral-700 font-medium"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

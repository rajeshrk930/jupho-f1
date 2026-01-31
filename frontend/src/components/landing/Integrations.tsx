import { ArrowRight, Sheet, Webhook, Zap } from 'lucide-react';

export default function Integrations() {
  return (
    <section className="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-charcoal-900 mb-4 tracking-tight">
            Automate Your Entire Workflow
          </h2>
          <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
            Never lose a lead. Connect Jupho to the tools you already use.
          </p>
        </div>

        {/* Visual Workflow */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            {/* Meta Ads */}
            <div className="flex items-center justify-center bg-white rounded-xl p-6 shadow-lg w-48 h-32">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">f</span>
                </div>
                <p className="text-sm font-semibold text-charcoal-900">Meta Ads</p>
              </div>
            </div>

            <ArrowRight className="w-8 h-8 text-purple-600 rotate-90 md:rotate-0" />

            {/* Jupho */}
            <div className="flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-xl w-48 h-32">
              <div className="text-center">
                <Zap className="w-12 h-12 mx-auto mb-2 text-white" />
                <p className="text-sm font-bold text-white">Jupho</p>
              </div>
            </div>

            <ArrowRight className="w-8 h-8 text-purple-600 rotate-90 md:rotate-0" />

            {/* Integrations */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-center bg-white rounded-lg p-4 shadow-md w-24 h-24">
                <Sheet className="w-10 h-10 text-green-600" />
              </div>
              <div className="flex items-center justify-center bg-white rounded-lg p-4 shadow-md w-24 h-24">
                <Webhook className="w-10 h-10 text-blue-600" />
              </div>
              <div className="flex items-center justify-center bg-white rounded-lg p-4 shadow-md w-24 h-24">
                <span className="text-2xl font-bold text-orange-600">Z</span>
              </div>
              <div className="flex items-center justify-center bg-white rounded-lg p-4 shadow-md w-24 h-24">
                <span className="text-2xl font-bold text-purple-600">M</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Google Sheets */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sheet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                  Google Sheets Auto-Sync
                </h3>
                <p className="text-charcoal-600 mb-3">
                  Automatically backup all leads to Google Sheets every 15 minutes. Facebook deletes leads after 90 days—we don't.
                </p>
                <ul className="space-y-2 text-sm text-charcoal-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    Auto-sync every 15 minutes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    Never lose a lead again
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    Secure AES-256 encryption
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Webhooks */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Webhook className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                  Connect to 5,000+ Apps
                </h3>
                <p className="text-charcoal-600 mb-3">
                  Send leads to your CRM, Slack, email, or any tool via webhooks. Works with Zapier, Make, and more.
                </p>
                <ul className="space-y-2 text-sm text-charcoal-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Real-time lead delivery
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Custom integrations via API
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Zapier, Make, Pabbly support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Logos */}
        <div className="mt-12 text-center">
          <p className="text-sm text-charcoal-600 mb-6 font-medium">
            Works seamlessly with your favorite tools:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2 text-charcoal-700">
              <Sheet className="w-6 h-6 text-green-600" />
              <span className="font-semibold">Google Sheets</span>
            </div>
            <div className="flex items-center gap-2 text-charcoal-700">
              <span className="text-2xl font-bold text-orange-600">Z</span>
              <span className="font-semibold">Zapier</span>
            </div>
            <div className="flex items-center gap-2 text-charcoal-700">
              <span className="text-2xl font-bold text-purple-600">M</span>
              <span className="font-semibold">Make</span>
            </div>
            <div className="flex items-center gap-2 text-charcoal-700">
              <Webhook className="w-6 h-6 text-blue-600" />
              <span className="font-semibold">Custom Webhooks</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

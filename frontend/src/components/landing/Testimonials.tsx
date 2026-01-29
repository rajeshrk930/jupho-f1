import { Star } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-charcoal-900 mb-4 tracking-tight">
          Loved by Business Owners
        </h2>
        <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
          See what early users are saying about Jupho
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Testimonial 1 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-charcoal-700 mb-6 leading-relaxed">
            "I launched my first Meta ad in under 10 minutes. No more waiting days for designers or copywriters. Jupho is a game-changer!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              RK
            </div>
            <div>
              <p className="font-semibold text-charcoal-900">Rajesh Kumar</p>
              <p className="text-sm text-charcoal-600">Fitness Coach, Mumbai</p>
            </div>
          </div>
        </div>

        {/* Testimonial 2 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-charcoal-700 mb-6 leading-relaxed">
            "The AI actually understands my business. It generated better ad copy than what I was paying ₹5,000 for. Worth every rupee!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              PS
            </div>
            <div>
              <p className="font-semibold text-charcoal-900">Priya Sharma</p>
              <p className="text-sm text-charcoal-600">Boutique Owner, Delhi</p>
            </div>
          </div>
        </div>

        {/* Testimonial 3 */}
        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-charcoal-700 mb-6 leading-relaxed">
            "Finally, a tool that speaks my language. No complicated dashboards, just simple questions and professional results."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
              AM
            </div>
            <div>
              <p className="font-semibold text-charcoal-900">Arjun Mehta</p>
              <p className="text-sm text-charcoal-600">Restaurant Owner, Bangalore</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

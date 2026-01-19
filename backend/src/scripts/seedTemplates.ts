import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const winningTemplates = [
  {
    name: 'Restaurant Takeout Special',
    category: 'RESTAURANT',
    description: 'High-converting template for restaurant delivery and takeout promotions',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: {
      ageMin: 25,
      ageMax: 45,
      interestKeywords: ['Food', 'Restaurants', 'Food delivery', 'Cooking'],
      location: {
        isLocal: true,
        radius: 5,
      },
    },
    budget: {
      dailyAmount: 500,
      currency: 'INR',
      reasoning: 'Optimal for local restaurant promotions with 5km radius',
    },
    adCopy: {
      headlines: [
        'Order Now & Save 20%',
        'Fresh Food Delivered Fast',
        'Hungry? We Deliver!'
      ],
      primaryTexts: [
        'Craving delicious food? Order now and get 20% off your first order. Fresh ingredients, amazing taste, delivered to your door!',
        'Skip the cooking tonight! Get restaurant-quality meals delivered in 30 minutes. Limited time offer - Order now and save big!',
        'Your favorite dishes, delivered hot and fresh. First-time customers save 20%. Tap to order now!'
      ],
      descriptions: [
        'Fresh food, fast delivery',
        'Order now, eat in 30 mins',
        '20% off first order'
      ],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Gym Membership Drive',
    category: 'GYM',
    description: 'Proven template for fitness centers and gym memberships',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: {
      ageMin: 22,
      ageMax: 50,
      interestKeywords: ['Fitness', 'Gym', 'Weight training', 'Health', 'Exercise'],
      location: {
        isLocal: true,
        radius: 10,
      },
    },
    budget: {
      dailyAmount: 800,
      currency: 'INR',
      reasoning: 'Higher budget for competitive fitness market with wider reach',
    },
    adCopy: {
      headlines: [
        'Join Now - First Month Free!',
        'Transform Your Body Today',
        'Limited Spots Available'
      ],
      primaryTexts: [
        'Ready to transform? Join today and get your first month FREE! State-of-the-art equipment, expert trainers, and results that last.',
        'Stop waiting, start training! Limited time offer: First month on us when you sign up today. Premium gym, beginner-friendly.',
        'Your fitness journey starts here. Join now and enjoy free personal training sessions plus first month free. Spots filling fast!'
      ],
      descriptions: [
        'First month FREE!',
        'Expert trainers included',
        'Premium equipment'
      ],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Real Estate Open House',
    category: 'REAL_ESTATE',
    description: 'High-performance template for property listings and open houses',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: {
      ageMin: 28,
      ageMax: 55,
      interestKeywords: ['Real estate', 'Home buying', 'Property investment', 'Interior design'],
      location: {
        isLocal: true,
        radius: 15,
      },
    },
    budget: {
      dailyAmount: 1000,
      currency: 'INR',
      reasoning: 'Premium budget for high-value real estate leads',
    },
    adCopy: {
      headlines: [
        'View This Dream Home Today',
        'Open House This Weekend',
        'Your Perfect Home Awaits'
      ],
      primaryTexts: [
        'Beautiful 3BHK apartment in prime location. Modern amenities, spacious layout, ready to move in. Schedule your viewing today!',
        'This weekend only: Open house for stunning property. Premium finishes, great location, competitive price. RSVP now!',
        'Stop renting, start owning! Luxurious apartments with world-class amenities. Limited units available. Book site visit today!'
      ],
      descriptions: [
        'Modern 3BHK, prime location',
        'Open house this weekend',
        'Schedule viewing today'
      ],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Salon Special Offer',
    category: 'SALON',
    description: 'Effective template for beauty salons and spas',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: {
      ageMin: 20,
      ageMax: 45,
      interestKeywords: ['Beauty', 'Hair salon', 'Spa', 'Skincare', 'Makeup'],
      location: {
        isLocal: true,
        radius: 8,
      },
    },
    budget: {
      dailyAmount: 600,
      currency: 'INR',
      reasoning: 'Mid-range budget for local beauty service promotions',
    },
    adCopy: {
      headlines: [
        'New Client Special - 50% Off',
        'Pamper Yourself Today',
        'Book Your Makeover Now'
      ],
      primaryTexts: [
        'First visit? Get 50% off all services! Expert stylists, premium products, relaxing atmosphere. Book your appointment now!',
        'Transform your look today! New client special: Half price on haircuts, color, and styling. Limited appointments available!',
        'Treat yourself to luxury. Professional salon services at unbeatable prices. New customers save 50%. Book online now!'
      ],
      descriptions: [
        '50% off first visit',
        'Expert stylists',
        'Book appointment now'
      ],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Home Services Lead Gen',
    category: 'HOME_SERVICES',
    description: 'Versatile template for plumbing, electrical, cleaning services',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: {
      ageMin: 30,
      ageMax: 60,
      interestKeywords: ['Home improvement', 'Home repair', 'DIY', 'Home maintenance'],
      location: {
        isLocal: true,
        radius: 12,
      },
    },
    budget: {
      dailyAmount: 700,
      currency: 'INR',
      reasoning: 'Competitive pricing for home services market',
    },
    adCopy: {
      headlines: [
        'Same-Day Service Available',
        'Expert Repairs, Fair Prices',
        'Call Now for Free Quote'
      ],
      primaryTexts: [
        'Need repairs fast? We offer same-day service for all home repairs. Licensed professionals, upfront pricing, guaranteed work!',
        'Stop DIY disasters! Professional repairs at honest prices. Free estimates, quick service, 100% satisfaction guarantee.',
        'Your home deserves expert care. Call now for free quote on any repair or installation. Same-day appointments available!'
      ],
      descriptions: [
        'Same-day service',
        'Free estimates',
        'Licensed professionals'
      ],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Ecommerce Product Launch',
    category: 'ECOMMERCE',
    description: 'High-converting template for online store promotions',
    objective: 'OUTCOME_SALES',
    conversionMethod: 'website',
    targeting: {
      ageMin: 22,
      ageMax: 45,
      interestKeywords: ['Online shopping', 'E-commerce', 'Shopping', 'Fashion'],
      location: {
        isLocal: false,
      },
    },
    budget: {
      dailyAmount: 1200,
      currency: 'INR',
      reasoning: 'Higher budget for broader reach and direct sales',
    },
    adCopy: {
      headlines: [
        'Shop Now & Get 30% Off',
        'Limited Time Flash Sale',
        'Free Shipping on All Orders'
      ],
      primaryTexts: [
        'Flash sale alert! 30% off everything + free shipping. Premium products at unbeatable prices. Shop now before stock runs out!',
        'Your favorites are on sale! Limited time: Extra 30% off + free delivery. Thousands of happy customers. Order today!',
        'Biggest sale of the year! Save 30% on all products. Fast delivery, easy returns, secure checkout. Shop now!'
      ],
      descriptions: [
        '30% off + free shipping',
        'Flash sale ends soon',
        'Shop bestsellers now'
      ],
      cta: 'SHOP_NOW',
    },
  },
  {
    name: 'Dental Clinic New Patients',
    category: 'HEALTHCARE',
    description: 'Effective template for dental clinics and healthcare providers',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: {
      ageMin: 25,
      ageMax: 55,
      interestKeywords: ['Dental care', 'Health', 'Healthcare', 'Dentistry'],
      location: {
        isLocal: true,
        radius: 10,
      },
    },
    budget: {
      dailyAmount: 800,
      currency: 'INR',
      reasoning: 'Premium budget for high-value healthcare leads',
    },
    adCopy: {
      headlines: [
        'New Patient Special - $99',
        'Pain-Free Dentistry',
        'Same-Day Appointments'
      ],
      primaryTexts: [
        'New patients welcome! Complete exam and cleaning for just $99. Experienced dentists, modern technology, gentle care.',
        'Afraid of the dentist? We specialize in pain-free procedures. New patient special: Save 50% on first visit. Book now!',
        'Your smile deserves expert care. New patient offer: Comprehensive exam and x-rays for $99. Same-day appointments available!'
      ],
      descriptions: [
        'New patient $99 special',
        'Pain-free procedures',
        'Book appointment today'
      ],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Education Course Enrollment',
    category: 'EDUCATION',
    description: 'Template for online courses, coaching classes, and education',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: {
      ageMin: 18,
      ageMax: 35,
      interestKeywords: ['Education', 'Online courses', 'Learning', 'Career development'],
      location: {
        isLocal: false,
      },
    },
    budget: {
      dailyAmount: 900,
      currency: 'INR',
      reasoning: 'Mid-to-high budget for education market with national reach',
    },
    adCopy: {
      headlines: [
        'Learn New Skills - Enroll Now',
        'Free Demo Class Available',
        'Limited Seats Left!'
      ],
      primaryTexts: [
        'Transform your career! Enroll in our expert-led courses. Free demo class available. Industry-recognized certificates included!',
        'Learn from the best. Live interactive classes, recorded sessions, lifetime access. Early bird discount - 40% off. Register now!',
        'Upskill today, succeed tomorrow. Join thousands of successful students. Free demo, flexible timings, job assistance. Enroll now!'
      ],
      descriptions: [
        'Free demo class',
        'Expert instructors',
        '40% early bird discount'
      ],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Car Dealership Test Drive',
    category: 'AUTOMOTIVE',
    description: 'High-value template for car dealerships and automotive services',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: {
      ageMin: 28,
      ageMax: 55,
      interestKeywords: ['Cars', 'Automobiles', 'Vehicles', 'Car buying'],
      location: {
        isLocal: true,
        radius: 20,
      },
    },
    budget: {
      dailyAmount: 1500,
      currency: 'INR',
      reasoning: 'Premium budget for high-ticket automotive leads',
    },
    adCopy: {
      headlines: [
        'Test Drive This Weekend',
        'Special Financing Available',
        'Trade-In Bonus Offer'
      ],
      primaryTexts: [
        'Your dream car awaits! Schedule test drive this weekend. Special financing with low rates. Trade-in bonuses available!',
        'Limited time offer: Extra $2000 trade-in bonus + special financing. Book your test drive today and drive away happy!',
        'New arrivals just in! Schedule your test drive today. Flexible financing, great trade-in values, expert service. Visit us now!'
      ],
      descriptions: [
        'Schedule test drive',
        'Special financing',
        'Trade-in bonus available'
      ],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Hotel Weekend Getaway',
    category: 'HOSPITALITY',
    description: 'Proven template for hotels, resorts, and travel packages',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: {
      ageMin: 25,
      ageMax: 50,
      interestKeywords: ['Travel', 'Hotels', 'Vacation', 'Tourism', 'Weekend getaway'],
      location: {
        isLocal: false,
      },
    },
    budget: {
      dailyAmount: 1000,
      currency: 'INR',
      reasoning: 'Competitive budget for hospitality with regional targeting',
    },
    adCopy: {
      headlines: [
        'Weekend Escape - 30% Off',
        'Book Now, Relax Later',
        'Luxury Stay, Best Price'
      ],
      primaryTexts: [
        'Escape the ordinary! Weekend packages now 30% off. Luxury rooms, spa, fine dining. Book your perfect getaway today!',
        'Need a break? We have got you covered. Weekend special: Luxury accommodation at unbeatable prices. Limited availability!',
        'Unwind in style. Premium rooms, world-class amenities, breathtaking views. Book this weekend and save 30%. Reserve now!'
      ],
      descriptions: [
        '30% off weekend stays',
        'Luxury rooms + spa',
        'Book perfect getaway'
      ],
      cta: 'SIGN_UP',
    },
  },
];

async function seedTemplates() {
  console.log('🌱 Starting template seeding...');

  for (const template of winningTemplates) {
    try {
      const created = await prisma.adTemplate.create({
        data: {
          userId: null, // System template
          isPublic: true,
          name: template.name,
          category: template.category,
          description: template.description,
          objective: template.objective,
          conversionMethod: template.conversionMethod,
          targeting: JSON.stringify(template.targeting),
          budget: JSON.stringify(template.budget),
          adCopy: JSON.stringify(template.adCopy),
        },
      });
      console.log(`✅ Created template: ${created.name}`);
    } catch (error: any) {
      console.error(`❌ Failed to create ${template.name}:`, error.message);
    }
  }

  console.log('✨ Template seeding complete!');
}

seedTemplates()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

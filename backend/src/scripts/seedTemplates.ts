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
  // NEW 40 TEMPLATES - Coffee to Homestays
  {
    name: 'Coffee Shop Loyalty Program',
    category: 'RESTAURANT',
    description: 'Drive repeat visits with loyalty rewards',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 22, ageMax: 40, interestKeywords: ['Coffee', 'Cafe', 'Coffee shops', 'Breakfast'], location: { isLocal: true, radius: 3 } },
    budget: { dailyAmount: 400, currency: 'INR', reasoning: 'Local coffee shop with tight radius' },
    adCopy: {
      headlines: ['Join & Get Free Coffee', 'Loyalty Rewards Inside', 'Buy 5 Get 1 Free'],
      primaryTexts: ['Love coffee? Join our rewards program and get your 6th coffee FREE! Plus exclusive member discounts daily.', 'Sign up now and get a free coffee on your birthday! Earn points with every purchase. Your favorite drink awaits!', 'Coffee lovers unite! Join today and start earning rewards. Free drinks, special offers, birthday treats. Sign up now!'],
      descriptions: ['Buy 5 get 1 free', 'Birthday rewards', 'Exclusive member deals'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Yoga Studio Trial Class',
    category: 'GYM',
    description: 'Perfect for yoga and wellness studios',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 25, ageMax: 55, interestKeywords: ['Yoga', 'Wellness', 'Meditation', 'Fitness', 'Health'], location: { isLocal: true, radius: 8 } },
    budget: { dailyAmount: 600, currency: 'INR', reasoning: 'Mid-range for wellness market' },
    adCopy: {
      headlines: ['Free Trial Yoga Class', 'Find Your Inner Peace', 'First Class On Us'],
      primaryTexts: ['New to yoga? Try your first class FREE! Beginner-friendly, expert instructors, peaceful studio. Register today!', 'Transform mind and body. Free trial class for new students. All levels welcome. Book your spot now!', 'Discover the power of yoga. First class completely free. Small groups, personalized attention. Limited spots available!'],
      descriptions: ['Free first class', 'All levels welcome', 'Book trial now'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Luxury Villa Rentals',
    category: 'REAL_ESTATE',
    description: 'High-end property rentals and vacation homes',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 30, ageMax: 60, interestKeywords: ['Luxury homes', 'Villas', 'Vacation rentals', 'Real estate'], location: { isLocal: false } },
    budget: { dailyAmount: 1500, currency: 'INR', reasoning: 'Premium budget for luxury market' },
    adCopy: {
      headlines: ['Luxury Villas Available Now', 'Your Dream Villa Awaits', 'Exclusive Properties Only'],
      primaryTexts: ['Experience luxury living. Stunning villas with private pools, modern amenities, prime locations. Schedule your viewing today!', 'Limited luxury properties available. Private villas with world-class features. Inquire now for exclusive viewing!', 'Your perfect villa is waiting. Premium locations, breathtaking views, ultimate privacy. Contact us today!'],
      descriptions: ['Private pool villas', 'Prime locations', 'Schedule viewing'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Bridal Makeup Package',
    category: 'SALON',
    description: 'Special packages for bridal and wedding services',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 22, ageMax: 35, interestKeywords: ['Wedding', 'Bridal', 'Makeup', 'Beauty', 'Marriage'], location: { isLocal: true, radius: 15 } },
    budget: { dailyAmount: 900, currency: 'INR', reasoning: 'Premium bridal market' },
    adCopy: {
      headlines: ['Bridal Makeup Packages', 'Look Stunning On Your Day', 'Free Bridal Consultation'],
      primaryTexts: ['Your wedding day deserves perfection! Expert bridal makeup packages with free trial. Book your consultation today!', 'Look absolutely stunning! Complete bridal packages: makeup, hair, draping. Pre-wedding trial included. Limited dates!', 'Make your big day unforgettable. Professional bridal services with guaranteed satisfaction. Book free consultation now!'],
      descriptions: ['Free bridal trial', 'Complete packages', 'Expert makeup artists'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'AC Repair Emergency Service',
    category: 'HOME_SERVICES',
    description: 'Fast AC repair and maintenance services',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 25, ageMax: 60, interestKeywords: ['AC repair', 'Air conditioning', 'Home services', 'HVAC'], location: { isLocal: true, radius: 10 } },
    budget: { dailyAmount: 800, currency: 'INR', reasoning: 'Urgent service requires good visibility' },
    adCopy: {
      headlines: ['AC Not Working? Call Now', '24/7 Emergency Service', 'Same-Day AC Repairs'],
      primaryTexts: ['AC breakdown? We respond within 2 hours! Expert technicians, genuine parts, fair prices. Call now for emergency service!', 'Beat the heat! 24/7 AC repair service available. All brands serviced. Free inspection. Call now!', 'Quick AC repairs guaranteed. Same-day service, upfront pricing, 90-day warranty. Emergency? We are here 24/7!'],
      descriptions: ['2-hour response time', '24/7 emergency service', 'All brands serviced'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Fashion Store Sale',
    category: 'ECOMMERCE',
    description: 'Seasonal sales for fashion and apparel',
    objective: 'OUTCOME_SALES',
    conversionMethod: 'website',
    targeting: { ageMin: 18, ageMax: 40, interestKeywords: ['Fashion', 'Clothing', 'Online shopping', 'Style', 'Apparel'], location: { isLocal: false } },
    budget: { dailyAmount: 1100, currency: 'INR', reasoning: 'Competitive fashion ecommerce market' },
    adCopy: {
      headlines: ['Up To 70% Off Everything', 'New Collection Just Dropped', 'Free Shipping + Returns'],
      primaryTexts: ['Biggest fashion sale of the season! Up to 70% off + free shipping. Trending styles, all sizes available. Shop now!', 'Your wardrobe refresh starts here! New arrivals + massive discounts. Free returns, easy exchanges. Shop the sale!', 'Fashion at unbeatable prices! Limited time: Extra 50% off sale items. Thousands of styles. Order today!'],
      descriptions: ['Up to 70% off', 'New arrivals daily', 'Free shipping + returns'],
      cta: 'SHOP_NOW',
    },
  },
  {
    name: 'Pediatric Clinic Checkup',
    category: 'HEALTHCARE',
    description: 'Child healthcare and pediatric services',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 25, ageMax: 45, interestKeywords: ['Parenting', 'Children', 'Kids health', 'Pediatrics', 'Family health'], location: { isLocal: true, radius: 12 } },
    budget: { dailyAmount: 700, currency: 'INR', reasoning: 'Healthcare targeting parents' },
    adCopy: {
      headlines: ['Child Health Checkup - ₹499', 'Expert Pediatric Care', 'Your Child Deserves Best'],
      primaryTexts: ['Complete child health checkup for just ₹499! Experienced pediatricians, child-friendly clinic. Book appointment today!', 'Your child health is precious. Expert pediatric care with compassionate doctors. New patient special: ₹499 checkup!', 'Trusted by thousands of parents. Complete health checkup, vaccinations, growth monitoring. Book now for ₹499!'],
      descriptions: ['₹499 complete checkup', 'Expert pediatricians', 'Child-friendly clinic'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Digital Marketing Course',
    category: 'EDUCATION',
    description: 'Professional skill development courses',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 20, ageMax: 35, interestKeywords: ['Digital marketing', 'Career', 'Online courses', 'Marketing', 'SEO'], location: { isLocal: false } },
    budget: { dailyAmount: 1000, currency: 'INR', reasoning: 'High-value course with national reach' },
    adCopy: {
      headlines: ['Master Digital Marketing', 'Get Certified in 3 Months', 'Free Career Counseling'],
      primaryTexts: ['Launch your digital marketing career! Industry-expert instructors, hands-on projects, job assistance. Enroll now!', 'Learn SEO, social media, PPC, and more! Get certified in just 3 months. Free demo class available. Register today!', '95% placement rate! Complete digital marketing program with live projects. Early bird discount: 50% off. Enroll now!'],
      descriptions: ['Free demo class', 'Job assistance', '50% early bird off'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Bike Service Package',
    category: 'AUTOMOTIVE',
    description: 'Two-wheeler service and maintenance',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 20, ageMax: 45, interestKeywords: ['Bike', 'Two wheeler', 'Motorcycle', 'Vehicle service'], location: { isLocal: true, radius: 15 } },
    budget: { dailyAmount: 600, currency: 'INR', reasoning: 'Local automotive service market' },
    adCopy: {
      headlines: ['Bike Service from ₹399', 'Free Pickup & Drop', 'Same-Day Service Available'],
      primaryTexts: ['Keep your bike running smooth! Complete service starting ₹399. Free pickup & drop. Genuine parts guaranteed!', 'Professional bike care at your doorstep. All brands serviced. Same-day service available. Book now for ₹399!', 'Your bike deserves expert care. Full service package includes engine check, oil change, wash. Only ₹399! Call now!'],
      descriptions: ['From ₹399 only', 'Free pickup & drop', 'Genuine parts used'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Budget Hotel Booking',
    category: 'HOSPITALITY',
    description: 'Affordable hotel bookings and stays',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 22, ageMax: 50, interestKeywords: ['Budget travel', 'Hotels', 'Accommodation', 'Travel deals'], location: { isLocal: false } },
    budget: { dailyAmount: 700, currency: 'INR', reasoning: 'Budget travel market' },
    adCopy: {
      headlines: ['Hotels from ₹499/Night', 'Book Direct, Save More', 'Clean & Comfortable Stays'],
      primaryTexts: ['Travel on a budget! Clean, comfortable rooms starting just ₹499/night. Free WiFi, breakfast included. Book now!', 'Why pay more? Direct bookings save up to 30%. Quality stays at unbeatable prices. Check availability!', 'Budget-friendly doesn\'t mean compromise! Modern rooms, great locations, friendly service. Book from ₹499/night!'],
      descriptions: ['From ₹499/night', 'Free WiFi + breakfast', 'Book direct & save'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Bakery Fresh Delivery',
    category: 'RESTAURANT',
    description: 'Fresh baked goods delivery service',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 25, ageMax: 50, interestKeywords: ['Bakery', 'Cakes', 'Desserts', 'Food delivery', 'Baking'], location: { isLocal: true, radius: 5 } },
    budget: { dailyAmount: 500, currency: 'INR', reasoning: 'Local bakery delivery' },
    adCopy: {
      headlines: ['Fresh Baked Daily', 'Free Delivery Today', 'Order Your Favorites'],
      primaryTexts: ['Freshly baked goods delivered to your door! Cakes, pastries, breads made daily. First order gets free delivery!', 'Craving something sweet? Order now and get fresh baked treats delivered in 60 minutes. Quality guaranteed!', 'Daily fresh bakery items at your doorstep. Custom cakes available. Free delivery on first order. Order now!'],
      descriptions: ['Baked fresh daily', 'Free first delivery', 'Custom cakes available'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'CrossFit Training Program',
    category: 'GYM',
    description: 'High-intensity CrossFit and functional training',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 20, ageMax: 40, interestKeywords: ['CrossFit', 'HIIT', 'Functional training', 'Fitness', 'Workout'], location: { isLocal: true, radius: 10 } },
    budget: { dailyAmount: 900, currency: 'INR', reasoning: 'Premium fitness training' },
    adCopy: {
      headlines: ['Try CrossFit Free', 'Transform in 30 Days', 'Join the Community'],
      primaryTexts: ['Ready for real results? Try CrossFit FREE for one week! Small groups, expert coaching, amazing community. Join now!', 'Transform your fitness in just 30 days! Beginner-friendly CrossFit programs. First week free. Register today!', 'Join the fastest-growing fitness movement! Free trial week for new members. All fitness levels welcome. Start now!'],
      descriptions: ['Free trial week', 'Small group training', 'All levels welcome'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Commercial Property Lease',
    category: 'REAL_ESTATE',
    description: 'Office space and commercial property rentals',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 30, ageMax: 60, interestKeywords: ['Commercial real estate', 'Office space', 'Business', 'Workspace'], location: { isLocal: true, radius: 20 } },
    budget: { dailyAmount: 1200, currency: 'INR', reasoning: 'High-value commercial market' },
    adCopy: {
      headlines: ['Prime Office Space Available', 'Flexible Lease Terms', 'Move-In Ready Offices'],
      primaryTexts: ['Perfect office space in prime location! Modern facilities, flexible terms, ready to move in. Schedule viewing today!', 'Grow your business here! Premium commercial spaces with parking, security, and amenities. Competitive rates!', 'Find your ideal workspace! Various sizes available, prime locations, flexible lease options. Inquire now!'],
      descriptions: ['Prime locations', 'Flexible lease terms', 'Schedule viewing'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Nail Art Studio Promo',
    category: 'SALON',
    description: 'Nail salon and nail art services',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 18, ageMax: 40, interestKeywords: ['Nail art', 'Manicure', 'Pedicure', 'Beauty', 'Nails'], location: { isLocal: true, radius: 8 } },
    budget: { dailyAmount: 550, currency: 'INR', reasoning: 'Niche beauty service' },
    adCopy: {
      headlines: ['Nail Art from ₹299', 'Get Instagram-Worthy Nails', 'Book Appointment Now'],
      primaryTexts: ['Beautiful nails, beautiful you! Creative nail art starting just ₹299. Expert technicians, trendy designs. Book now!', 'Transform your nails today! Manicure, pedicure, nail art - all services available. First-time client discount!', 'Instagram-worthy nail designs! Professional nail care at affordable prices. Walk-ins welcome. Book appointment!'],
      descriptions: ['From ₹299', 'Trendy designs', 'Expert technicians'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Pest Control Service',
    category: 'HOME_SERVICES',
    description: 'Professional pest control and termite treatment',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 28, ageMax: 60, interestKeywords: ['Pest control', 'Home maintenance', 'Termite', 'Cleaning'], location: { isLocal: true, radius: 15 } },
    budget: { dailyAmount: 750, currency: 'INR', reasoning: 'Seasonal pest control demand' },
    adCopy: {
      headlines: ['Pest-Free Home Guaranteed', 'Free Inspection Today', 'Safe for Kids & Pets'],
      primaryTexts: ['Say goodbye to pests! Professional treatment with 1-year warranty. Safe for family & pets. Free inspection today!', 'Protect your home from pests! Eco-friendly treatments, licensed technicians, guaranteed results. Book free inspection!', 'Pest problems? We solve them permanently! Cockroaches, termites, rodents - all covered. Call for free quote!'],
      descriptions: ['Free inspection', '1-year warranty', 'Safe treatments'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Electronics Clearance Sale',
    category: 'ECOMMERCE',
    description: 'Electronics and gadgets sale',
    objective: 'OUTCOME_SALES',
    conversionMethod: 'website',
    targeting: { ageMin: 22, ageMax: 45, interestKeywords: ['Electronics', 'Gadgets', 'Technology', 'Shopping', 'Mobile phones'], location: { isLocal: false } },
    budget: { dailyAmount: 1400, currency: 'INR', reasoning: 'High-value electronics market' },
    adCopy: {
      headlines: ['Electronics Up To 60% Off', 'Latest Gadgets Best Prices', 'Free Delivery + Warranty'],
      primaryTexts: ['Massive electronics sale! Smartphones, laptops, headphones - up to 60% off. Free delivery + warranty included!', 'Latest tech at lowest prices! Limited stock clearance. Genuine products, secure checkout, fast shipping. Shop now!', 'Upgrade your tech for less! Brand new electronics at clearance prices. EMI available. Order today!'],
      descriptions: ['Up to 60% off', 'Free delivery', 'Genuine products'],
      cta: 'SHOP_NOW',
    },
  },
  {
    name: 'Physiotherapy Clinic',
    category: 'HEALTHCARE',
    description: 'Physical therapy and rehabilitation services',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 30, ageMax: 65, interestKeywords: ['Physiotherapy', 'Pain relief', 'Rehabilitation', 'Back pain', 'Healthcare'], location: { isLocal: true, radius: 10 } },
    budget: { dailyAmount: 750, currency: 'INR', reasoning: 'Healthcare specialist market' },
    adCopy: {
      headlines: ['Pain Relief Starts Here', 'Free Consultation Available', 'Expert Physiotherapists'],
      primaryTexts: ['Suffering from pain? Get expert physiotherapy treatment. Free consultation for new patients. Book appointment today!', 'Back pain, joint pain, sports injuries - we treat them all! Modern equipment, experienced therapists. Call now!', 'Your recovery is our priority! Personalized physiotherapy programs. Insurance accepted. Free assessment available!'],
      descriptions: ['Free consultation', 'Expert therapists', 'Modern equipment'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Coding Bootcamp for Kids',
    category: 'EDUCATION',
    description: 'Children coding and robotics classes',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 28, ageMax: 45, interestKeywords: ['Parenting', 'Kids education', 'Coding', 'STEM', 'Programming'], location: { isLocal: false } },
    budget: { dailyAmount: 850, currency: 'INR', reasoning: 'Premium kids education market' },
    adCopy: {
      headlines: ['Kids Learn Coding Here', 'Free Trial Class', 'Age 6-16 Years'],
      primaryTexts: ['Prepare your child for the future! Fun coding classes for ages 6-16. Free trial class. Small batches. Enroll now!', 'Learn coding through games! Expert teachers, interactive lessons, certificates. First class free. Register today!', 'Future-ready skills for kids! Coding, robotics, app development. Free demo class available. Limited seats!'],
      descriptions: ['Free trial class', 'Ages 6-16', 'Small batch sizes'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Used Car Dealership',
    category: 'AUTOMOTIVE',
    description: 'Certified pre-owned vehicles',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 25, ageMax: 50, interestKeywords: ['Used cars', 'Second hand cars', 'Automobiles', 'Car buying'], location: { isLocal: true, radius: 25 } },
    budget: { dailyAmount: 1300, currency: 'INR', reasoning: 'Competitive used car market' },
    adCopy: {
      headlines: ['Certified Used Cars', 'Best Prices Guaranteed', 'Exchange Your Old Car'],
      primaryTexts: ['Quality used cars at unbeatable prices! All vehicles certified, warranty included. Easy financing available. Visit today!', 'Find your perfect pre-owned car! Rigorous quality checks, fair pricing, hassle-free exchange. Test drive now!', 'Drive away your dream car! Certified pre-owned vehicles with warranty. Best exchange value guaranteed. Call now!'],
      descriptions: ['Certified vehicles', 'Warranty included', 'Easy exchange'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Beach Resort Package',
    category: 'HOSPITALITY',
    description: 'Beach resorts and coastal vacation packages',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 25, ageMax: 55, interestKeywords: ['Beach vacation', 'Resort', 'Travel', 'Holiday', 'Tourism'], location: { isLocal: false } },
    budget: { dailyAmount: 1100, currency: 'INR', reasoning: 'Premium vacation packages' },
    adCopy: {
      headlines: ['Beach Paradise Awaits', '3N/4D Package from ₹9,999', 'All-Inclusive Resort'],
      primaryTexts: ['Escape to paradise! 3 nights beach resort package from ₹9,999. Beachfront rooms, meals, activities included!', 'Your perfect beach vacation! All-inclusive packages with water sports, dining, spa. Limited offer. Book now!', 'Sun, sand, and luxury! Complete beach resort experience at unbeatable prices. Family packages available!'],
      descriptions: ['From ₹9,999', 'All-inclusive', 'Book beach getaway'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Cloud Kitchen Launch',
    category: 'RESTAURANT',
    description: 'Delivery-only restaurant promotion',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 20, ageMax: 45, interestKeywords: ['Food delivery', 'Online food', 'Home delivery', 'Fast food'], location: { isLocal: true, radius: 8 } },
    budget: { dailyAmount: 650, currency: 'INR', reasoning: 'Cloud kitchen delivery zone' },
    adCopy: {
      headlines: ['Now Delivering Near You', '30-Min Delivery Guaranteed', 'First Order 50% Off'],
      primaryTexts: ['New cloud kitchen in your area! Delicious food delivered in 30 minutes. First order gets 50% off. Order now!', 'Hungry? We deliver happiness! Fresh meals, quick delivery, great prices. New customer special: 50% discount!', 'Your favorite food, delivered fast! Now accepting orders in your locality. 50% off first order. Download app!'],
      descriptions: ['30-min delivery', '50% off first order', 'Order now'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Personal Training Package',
    category: 'GYM',
    description: 'One-on-one fitness coaching',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 25, ageMax: 50, interestKeywords: ['Personal trainer', 'Fitness coaching', 'Weight loss', 'Bodybuilding'], location: { isLocal: true, radius: 12 } },
    budget: { dailyAmount: 1000, currency: 'INR', reasoning: 'Premium personal training' },
    adCopy: {
      headlines: ['Personal Trainer Available', 'Get Results in 60 Days', 'Free Fitness Assessment'],
      primaryTexts: ['Achieve your fitness goals faster! Personal training with customized programs. Free fitness assessment. Book now!', 'Guaranteed results in 60 days! Expert personal trainers, nutrition guidance included. Limited slots. Register!', 'Transform your body with 1-on-1 training! Personalized workouts, diet plans, progress tracking. Try free session!'],
      descriptions: ['Free assessment', 'Customized programs', '60-day transformation'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Plot for Sale Campaign',
    category: 'REAL_ESTATE',
    description: 'Land and plot sales',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 30, ageMax: 60, interestKeywords: ['Land', 'Plot', 'Real estate investment', 'Property'], location: { isLocal: true, radius: 30 } },
    budget: { dailyAmount: 1100, currency: 'INR', reasoning: 'High-value land sales' },
    adCopy: {
      headlines: ['DTCP Approved Plots', 'Best Investment Opportunity', 'Limited Plots Available'],
      primaryTexts: ['Invest in your future! DTCP approved plots near main road. Clear title, ready for construction. Book site visit!', 'Premium plots at best prices! All amenities, gated community, easy EMI. Limited availability. Register interest!', 'Secure your investment today! Government-approved plots with excellent appreciation potential. Call now!'],
      descriptions: ['DTCP approved', 'Clear title', 'Easy EMI available'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Men Grooming Services',
    category: 'SALON',
    description: 'Men-specific salon and grooming',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 20, ageMax: 45, interestKeywords: ['Men grooming', 'Barbershop', 'Haircut', 'Beard styling'], location: { isLocal: true, radius: 7 } },
    budget: { dailyAmount: 600, currency: 'INR', reasoning: 'Men grooming niche' },
    adCopy: {
      headlines: ['Premium Men Grooming', 'First Visit 30% Off', 'Book Online Now'],
      primaryTexts: ['Gentlemen, look sharp! Premium grooming services: haircut, shave, beard styling. First visit 30% off!', 'Your style, perfected! Expert barbers, modern techniques, relaxing environment. Book appointment now!', 'Upgrade your look! Complete men grooming packages at great prices. New customer discount available!'],
      descriptions: ['30% off first visit', 'Expert barbers', 'Book appointment'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Interior Design Services',
    category: 'HOME_SERVICES',
    description: 'Home and office interior design',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 28, ageMax: 55, interestKeywords: ['Interior design', 'Home decor', 'Renovation', 'Furniture'], location: { isLocal: true, radius: 20 } },
    budget: { dailyAmount: 950, currency: 'INR', reasoning: 'Premium design services' },
    adCopy: {
      headlines: ['Free Design Consultation', 'Transform Your Space', 'Expert Interior Designers'],
      primaryTexts: ['Dream home, dream design! Free consultation with expert designers. Complete solutions, on-time delivery. Call now!', 'Transform your space beautifully! Custom designs, quality materials, affordable packages. Free consultation available!', 'Your vision, our expertise! Complete interior design services for homes & offices. Free 3D design. Inquire today!'],
      descriptions: ['Free consultation', 'Free 3D design', 'Complete solutions'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Furniture Online Store',
    category: 'ECOMMERCE',
    description: 'Online furniture shopping',
    objective: 'OUTCOME_SALES',
    conversionMethod: 'website',
    targeting: { ageMin: 25, ageMax: 50, interestKeywords: ['Furniture', 'Home decor', 'Interior', 'Online shopping'], location: { isLocal: false } },
    budget: { dailyAmount: 1200, currency: 'INR', reasoning: 'High-value furniture sales' },
    adCopy: {
      headlines: ['Furniture Sale - 40% Off', 'Free Assembly + Delivery', 'Shop Modern Designs'],
      primaryTexts: ['Furnish your home for less! Massive sale: 40% off + free delivery and assembly. Quality furniture, great prices!', 'Beautiful furniture, affordable prices! Modern designs for every room. Free installation. EMI available. Shop now!', 'Transform your home today! Huge furniture sale with free delivery. Thousands of designs. Order online!'],
      descriptions: ['40% off + free delivery', 'Free assembly', 'Modern designs'],
      cta: 'SHOP_NOW',
    },
  },
  {
    name: 'Eye Care Clinic',
    category: 'HEALTHCARE',
    description: 'Optometry and eye care services',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 25, ageMax: 65, interestKeywords: ['Eye care', 'Eyeglasses', 'Vision', 'Healthcare', 'Optometry'], location: { isLocal: true, radius: 15 } },
    budget: { dailyAmount: 700, currency: 'INR', reasoning: 'Eye care market' },
    adCopy: {
      headlines: ['Free Eye Checkup', 'Glasses from ₹999', 'Expert Optometrists'],
      primaryTexts: ['Protect your vision! Free comprehensive eye checkup. Wide range of frames starting ₹999. Book appointment!', 'See clearly, live better! Expert eye care with latest equipment. Glasses from ₹999. Free checkup for new patients!', 'Your eyes deserve the best! Complete eye examination free. Thousands of frame options. Visit us today!'],
      descriptions: ['Free eye checkup', 'From ₹999', 'Latest equipment'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'IELTS Coaching Classes',
    category: 'EDUCATION',
    description: 'Test preparation and language coaching',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 18, ageMax: 35, interestKeywords: ['IELTS', 'Study abroad', 'English learning', 'Test preparation'], location: { isLocal: false } },
    budget: { dailyAmount: 900, currency: 'INR', reasoning: 'Premium test prep market' },
    adCopy: {
      headlines: ['Score 7+ Band in IELTS', 'Free Demo Class Today', 'Expert Trainers'],
      primaryTexts: ['Achieve your dream score! Expert IELTS coaching with proven results. Free demo class available. Enroll now!', 'Study abroad made easy! Get 7+ band score guaranteed. Small batches, personal attention. Free trial class!', '90% success rate! Join best IELTS coaching. Live classes, mock tests, study material. Register today!'],
      descriptions: ['Free demo class', 'Expert trainers', '90% success rate'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Car Insurance Quotes',
    category: 'AUTOMOTIVE',
    description: 'Vehicle insurance comparison and sales',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 25, ageMax: 55, interestKeywords: ['Car insurance', 'Vehicle insurance', 'Insurance', 'Automobiles'], location: { isLocal: false } },
    budget: { dailyAmount: 800, currency: 'INR', reasoning: 'Insurance lead generation' },
    adCopy: {
      headlines: ['Car Insurance from ₹2,094', 'Compare & Save 85%', 'Instant Policy Online'],
      primaryTexts: ['Get the best car insurance deal! Compare 15+ insurers in seconds. Save up to 85%. Get instant quote!', 'Comprehensive car insurance from ₹2,094/year! Instant policy issuance, cashless claims. Get quote now!', 'Why pay more for insurance? Compare prices online and save big. Quick claims, 24/7 support. Get quote!'],
      descriptions: ['From ₹2,094/year', 'Compare & save 85%', 'Instant policy'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Hill Station Tour Package',
    category: 'HOSPITALITY',
    description: 'Mountain and hill station travel packages',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 25, ageMax: 55, interestKeywords: ['Hill station', 'Mountain travel', 'Tourism', 'Vacation', 'Trekking'], location: { isLocal: false } },
    budget: { dailyAmount: 900, currency: 'INR', reasoning: 'Seasonal travel packages' },
    adCopy: {
      headlines: ['Shimla Package ₹6,999', 'Hill Station Escape', 'Book Summer Vacation'],
      primaryTexts: ['Escape to the hills! Complete Shimla package: 4N/5D from ₹6,999. Hotel, transport, meals included. Book now!', 'Beat the heat in the mountains! All-inclusive hill station packages. Family-friendly, customizable. Limited spots!', 'Your perfect mountain getaway! Scenic locations, comfortable hotels, great prices. Early bird discount available!'],
      descriptions: ['From ₹6,999', 'All-inclusive', 'Hotels + transport'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Catering Services',
    category: 'RESTAURANT',
    description: 'Event catering and party food services',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 28, ageMax: 55, interestKeywords: ['Catering', 'Party', 'Events', 'Wedding', 'Food services'], location: { isLocal: true, radius: 15 } },
    budget: { dailyAmount: 750, currency: 'INR', reasoning: 'Event catering market' },
    adCopy: {
      headlines: ['Book Catering Services', 'From ₹299/Person', 'Free Menu Consultation'],
      primaryTexts: ['Make your event memorable! Professional catering from ₹299/person. Wide menu, all cuisines. Free tasting!', 'Hosting a party? We handle the food! Custom menus, experienced chefs, on-time service. Get free quote!', 'Delicious food for any occasion! Weddings, parties, corporate events. Competitive prices. Book consultation!'],
      descriptions: ['From ₹299/person', 'Free tasting', 'All cuisines'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Dance Classes for Adults',
    category: 'GYM',
    description: 'Adult dance fitness and classes',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 22, ageMax: 45, interestKeywords: ['Dance', 'Fitness', 'Zumba', 'Exercise', 'Hobby classes'], location: { isLocal: true, radius: 8 } },
    budget: { dailyAmount: 650, currency: 'INR', reasoning: 'Hobby and fitness classes' },
    adCopy: {
      headlines: ['Learn Dance & Get Fit', 'Free Trial Class', 'Zumba, Hip-Hop & More'],
      primaryTexts: ['Dance your way to fitness! Fun classes for all levels. Zumba, hip-hop, Bollywood. Free trial class. Join now!', 'No experience needed! Beginner-friendly dance classes. Lose weight while having fun. First class free!', 'Get fit, make friends, have fun! Adult dance classes starting this week. Multiple styles available. Try free!'],
      descriptions: ['Free trial class', 'All levels welcome', 'Multiple styles'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Rental Property Listing',
    category: 'REAL_ESTATE',
    description: 'House and apartment rentals',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 22, ageMax: 45, interestKeywords: ['House rent', 'Apartment', 'Rental property', 'Accommodation'], location: { isLocal: true, radius: 10 } },
    budget: { dailyAmount: 850, currency: 'INR', reasoning: 'Competitive rental market' },
    adCopy: {
      headlines: ['Rent Your Dream Home', '2BHK from ₹12,000/Month', 'Virtual Tours Available'],
      primaryTexts: ['Find your perfect rental home! 2BHK apartments from ₹12,000/month. Great locations, ready to move in. View now!', 'Quality rentals at best prices! Verified properties, transparent pricing, quick process. Schedule viewing today!', 'Your new home awaits! Browse hundreds of rental properties online. Virtual tours available. Inquire now!'],
      descriptions: ['From ₹12,000/month', 'Virtual tours', 'Ready to move'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Spa Membership Package',
    category: 'SALON',
    description: 'Spa and wellness memberships',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 28, ageMax: 55, interestKeywords: ['Spa', 'Wellness', 'Massage', 'Relaxation', 'Self-care'], location: { isLocal: true, radius: 12 } },
    budget: { dailyAmount: 800, currency: 'INR', reasoning: 'Premium wellness market' },
    adCopy: {
      headlines: ['Spa Membership - 50% Off', 'Unlimited Relaxation', 'Join Wellness Club'],
      primaryTexts: ['Treat yourself monthly! Spa membership with unlimited massages. Launch offer: 50% off. Limited spots available!', 'Relax, rejuvenate, repeat! Exclusive spa membership with amazing benefits. First month half price. Join now!', 'Your wellness journey starts here! Premium spa membership at special rates. Free trial session. Register today!'],
      descriptions: ['50% off membership', 'Unlimited massages', 'Free trial session'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Garden Maintenance Service',
    category: 'HOME_SERVICES',
    description: 'Landscaping and garden care',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 35, ageMax: 65, interestKeywords: ['Gardening', 'Landscaping', 'Home maintenance', 'Plants'], location: { isLocal: true, radius: 15 } },
    budget: { dailyAmount: 650, currency: 'INR', reasoning: 'Niche home service' },
    adCopy: {
      headlines: ['Professional Garden Care', 'Monthly Plans from ₹999', 'Free Garden Assessment'],
      primaryTexts: ['Beautiful gardens made easy! Professional maintenance from ₹999/month. Expert gardeners, regular service. Call now!', 'Your garden deserves expert care! Pruning, planting, lawn maintenance. Free assessment visit. Book service!', 'Keep your garden green! Affordable monthly plans with experienced gardeners. Free consultation. Get quote!'],
      descriptions: ['From ₹999/month', 'Expert gardeners', 'Free assessment'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Baby Products Store',
    category: 'ECOMMERCE',
    description: 'Online baby and kids products',
    objective: 'OUTCOME_SALES',
    conversionMethod: 'website',
    targeting: { ageMin: 25, ageMax: 40, interestKeywords: ['Baby products', 'Parenting', 'Kids', 'Newborn', 'Shopping'], location: { isLocal: false } },
    budget: { dailyAmount: 1000, currency: 'INR', reasoning: 'Parents shopping market' },
    adCopy: {
      headlines: ['Baby Products Sale', 'Up To 50% Off', 'Free Delivery + Returns'],
      primaryTexts: ['Everything for your little one! Up to 50% off on baby essentials. Safe products, trusted brands. Shop now!', 'Quality baby products at best prices! Diapers, toys, clothes, and more. Free delivery on all orders. Order today!', 'Give your baby the best! Massive sale on all baby products. Free returns, secure shopping. Browse collection!'],
      descriptions: ['Up to 50% off', 'Trusted brands', 'Free delivery'],
      cta: 'SHOP_NOW',
    },
  },
  {
    name: 'Dermatology Clinic',
    category: 'HEALTHCARE',
    description: 'Skin care and dermatology services',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 20, ageMax: 50, interestKeywords: ['Skin care', 'Dermatology', 'Acne treatment', 'Beauty', 'Healthcare'], location: { isLocal: true, radius: 15 } },
    budget: { dailyAmount: 850, currency: 'INR', reasoning: 'Specialist healthcare' },
    adCopy: {
      headlines: ['Expert Skin Care', 'Free Consultation', 'Acne, Hair, Skin Solutions'],
      primaryTexts: ['Get flawless skin! Expert dermatologists, advanced treatments, proven results. Free consultation for new patients!', 'Skin problems? We have solutions! Acne, pigmentation, hair loss - all treated. Book free consultation today!', 'Your skin deserves expert care! Latest technology, experienced doctors, affordable packages. Schedule appointment!'],
      descriptions: ['Free consultation', 'Expert dermatologists', 'Advanced treatments'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Stock Market Course',
    category: 'EDUCATION',
    description: 'Trading and investment education',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 22, ageMax: 45, interestKeywords: ['Stock market', 'Trading', 'Investment', 'Finance', 'Money'], location: { isLocal: false } },
    budget: { dailyAmount: 1100, currency: 'INR', reasoning: 'High-value financial education' },
    adCopy: {
      headlines: ['Learn Stock Trading', 'Free Webinar Today', 'Make Smart Investments'],
      primaryTexts: ['Master the stock market! Complete trading course with live market sessions. Free webinar today. Register now!', 'Start your trading journey! Learn from experts, practice with real money. Free demo webinar. Join thousands of students!', 'Invest smartly, grow wealth! Comprehensive stock market course. Lifetime support, practical training. Free session!'],
      descriptions: ['Free webinar', 'Live market sessions', 'Expert trainers'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Electric Vehicle Promotion',
    category: 'AUTOMOTIVE',
    description: 'EV sales and test drives',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 28, ageMax: 50, interestKeywords: ['Electric vehicles', 'EV', 'Cars', 'Sustainable', 'Technology'], location: { isLocal: true, radius: 30 } },
    budget: { dailyAmount: 1400, currency: 'INR', reasoning: 'Premium EV market' },
    adCopy: {
      headlines: ['Test Drive Electric Cars', 'Go Green, Save Money', 'Special EV Launch Offers'],
      primaryTexts: ['Experience the future today! Test drive our electric vehicles. Zero emissions, low running costs. Book now!', 'Make the smart switch! Electric cars with amazing range and features. Special launch discounts. Test drive today!', 'Drive electric, drive smart! Save lakhs on fuel. Government subsidies available. Schedule test drive now!'],
      descriptions: ['Free test drive', 'Government subsidies', 'Save on fuel'],
      cta: 'SIGN_UP',
    },
  },
  {
    name: 'Homestay Bookings',
    category: 'HOSPITALITY',
    description: 'Local homestay and guest house bookings',
    objective: 'OUTCOME_LEADS',
    conversionMethod: 'lead_form',
    targeting: { ageMin: 22, ageMax: 50, interestKeywords: ['Homestay', 'Budget travel', 'Accommodation', 'Local experience'], location: { isLocal: false } },
    budget: { dailyAmount: 600, currency: 'INR', reasoning: 'Budget travel accommodation' },
    adCopy: {
      headlines: ['Stay Like a Local', 'Homestays from ₹799/Night', 'Authentic Experience'],
      primaryTexts: ['Experience local hospitality! Cozy homestays from ₹799/night. Home-cooked meals, friendly hosts. Book now!', 'Travel different, stay authentic! Comfortable homestays in beautiful locations. Great prices. Reserve your stay!', 'More than just a room! Local homestays with personal touch. Clean, safe, affordable. Check availability!'],
      descriptions: ['From ₹799/night', 'Home-cooked meals', 'Local experience'],
      cta: 'SIGN_UP',
    },
  },
];

async function seedTemplates() {
  console.log('🌱 Starting 50 templates seeding (skipping existing)...\n');

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const template of winningTemplates) {
    try {
      // Check if template already exists
      const existing = await prisma.adTemplate.findFirst({
        where: { name: template.name },
      });

      if (existing) {
        console.log(`⏭️  Skipped (exists): ${template.name}`);
        skipped++;
        continue;
      }

      // Create new template
      const created_template = await prisma.adTemplate.create({
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
      console.log(`✅ Created: ${created_template.name}`);
      created++;
    } catch (error: any) {
      console.error(`❌ Failed: ${template.name}:`, error.message);
      failed++;
    }
  }

  const totalInDB = await prisma.adTemplate.count({ where: { isPublic: true } });
  
  console.log('\n✨ Seeding Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Total Templates in Array: ${winningTemplates.length}`);
  console.log(`   🗄️  Total System Templates in DB: ${totalInDB}`);
}

seedTemplates()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

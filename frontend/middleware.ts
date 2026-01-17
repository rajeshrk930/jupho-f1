import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes allowed on www subdomain (landing pages)
const isLandingRoute = createRouteMatcher([
  "/",
  "/privacy(.*)",
  "/terms(.*)",
]);

// Auth routes (public on app subdomain)
const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",      // Old route - will redirect to sign-in
  "/signup(.*)",     // Old route - will redirect to sign-up
  "/api/webhooks/clerk",
]);

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url);
  const hostname = url.hostname;
  const { userId } = await auth(); // Get current user's authentication status
  
  // Determine if we're on www or app subdomain
  const isWwwDomain = hostname === 'www.jupho.io' || hostname === 'localhost' || hostname.startsWith('localhost:');
  const isAppDomain = hostname === 'app.jupho.io' || (!isWwwDomain && !hostname.includes('www'));
  
  // 🔒 REDIRECT ALREADY-LOGGED-IN USERS AWAY FROM AUTH PAGES
  // If user is authenticated AND trying to access /sign-in or /sign-up
  if (userId && isAuthRoute(request) && !request.nextUrl.pathname.includes('/webhooks')) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return Response.redirect(dashboardUrl);
  }
  
  // 🔀 REDIRECT OLD AUTH ROUTES TO NEW CLERK ROUTES
  if (request.nextUrl.pathname === '/login') {
    const signInUrl = new URL('/sign-in', request.url);
    if (request.nextUrl.searchParams.get('redirect')) {
      signInUrl.searchParams.set('redirect_url', request.nextUrl.searchParams.get('redirect')!);
    }
    return Response.redirect(signInUrl);
  }
  
  if (request.nextUrl.pathname === '/signup') {
    const signUpUrl = new URL('/sign-up', request.url);
    return Response.redirect(signUpUrl);
  }
  
  // On www domain: allow landing pages, redirect app routes to app subdomain
  if (isWwwDomain) {
    if (isLandingRoute(request)) {
      return; // Allow public landing pages
    }
    // Redirect app routes to app subdomain
    if (!isAuthRoute(request) && !request.nextUrl.pathname.startsWith('/api')) {
      const appUrl = new URL(request.url);
      appUrl.hostname = appUrl.hostname.replace('www.', 'app.');
      if (appUrl.hostname === 'localhost' || appUrl.hostname.startsWith('localhost:')) {
        appUrl.hostname = appUrl.hostname; // Keep localhost as-is for dev
      }
      return Response.redirect(appUrl);
    }
  }
  
  // On app domain: require auth except for sign-in/sign-up and webhooks
  if (isAppDomain || !isWwwDomain) {
    if (isAuthRoute(request)) {
      return; // Allow auth pages and webhooks
    }
    // Protect all other routes (Clerk will use configured sign-in URL)
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

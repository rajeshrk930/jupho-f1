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
  "/api/webhooks/clerk",
]);

export default clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url);
  const hostname = url.hostname;
  
  // Determine if we're on www or app subdomain
  const isWwwDomain = hostname === 'www.jupho.io' || hostname === 'localhost' || hostname.startsWith('localhost:');
  const isAppDomain = hostname === 'app.jupho.io' || (!isWwwDomain && !hostname.includes('www'));
  
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
    // Protect all other routes
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

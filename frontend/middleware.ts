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
  const { nextUrl } = request;
  const hostname = nextUrl.hostname;
  const { userId } = await auth();

  const isWwwDomain =
    hostname === "www.jupho.io" ||
    hostname === "localhost" ||
    hostname.startsWith("localhost:");
  const isAppDomain = hostname === "app.jupho.io" || (!isWwwDomain && !hostname.includes("www"));

  // Redirect signed-in users away from auth pages
  if (userId && isAuthRoute(request) && !nextUrl.pathname.includes("/webhooks")) {
    return Response.redirect(new URL("/dashboard", request.url));
  }

  // Redirect legacy auth routes
  if (nextUrl.pathname.startsWith("/login")) {
    const signInUrl = new URL("/sign-in", request.url);
    const redirect = nextUrl.searchParams.get("redirect");
    if (redirect) {
      signInUrl.searchParams.set("redirect_url", redirect);
    }
    return Response.redirect(signInUrl);
  }

  if (nextUrl.pathname.startsWith("/signup")) {
    return Response.redirect(new URL("/sign-up", request.url));
  }

  // On www domain: allow landing pages, redirect app routes to app subdomain
  if (isWwwDomain) {
    if (isLandingRoute(request)) {
      return;
    }

    if (!isAuthRoute(request) && !nextUrl.pathname.startsWith("/api")) {
      const appUrl = new URL(request.url);
      appUrl.hostname = appUrl.hostname.replace("www.", "app.");
      return Response.redirect(appUrl);
    }
  }

  // On app domain: require auth except for sign-in/sign-up and webhooks
  if (isAppDomain || !isWwwDomain) {
    if (isAuthRoute(request)) {
      return;
    }
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

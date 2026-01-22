'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorLogsPage() {
  const [sentryConfigured, setSentryConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSentryStatus();
  }, []);

  const checkSentryStatus = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/health`);
      const data = await res.json();
      setSentryConfigured(data.sentry || false);
    } catch (error) {
      console.error('Failed to check Sentry status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <p>Checking error tracking status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sentryUrl = process.env.NODE_ENV === 'production' 
    ? 'https://jupho.sentry.io' 
    : 'https://sentry.io/organizations/jupho/projects/';

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Error Tracking</h1>
        <p className="text-muted-foreground">
          Monitor and debug errors across your application
        </p>
      </div>

      {/* Sentry Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Sentry Status
            <Badge variant={sentryConfigured ? 'default' : 'destructive'}>
              {sentryConfigured ? 'Active' : 'Not Configured'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time error tracking and performance monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sentryConfigured ? (
            <>
              <Alert>
                <AlertDescription>
                  ✅ Sentry is actively tracking errors. All unhandled exceptions, API failures, 
                  and performance issues are automatically captured with full context.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-semibold">What&apos;s Being Tracked:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>All unhandled errors with stack traces</li>
                  <li>Failed API calls to Facebook, OpenAI, Razorpay</li>
                  <li>User context (email, ID) for every error</li>
                  <li>Request breadcrumbs (last 100 user actions before error)</li>
                  <li>Performance metrics for slow API calls</li>
                  <li>Session replays for errors (user journey)</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button asChild>
                  <a 
                    href={sentryUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Open Sentry Dashboard
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  asChild
                >
                  <a 
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/test-error`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Test Error Tracking
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>
                ⚠️ Sentry is not configured. Set SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN environment variables.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Debug Guide */}
      <Card>
        <CardHeader>
          <CardTitle>How to Debug Issues (No More 7-Hour Searches!)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-1">Scenario 1: User Reports &quot;Something happened&quot;</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Open Sentry dashboard</li>
                <li>Search by user email (e.g., &quot;gugulothrajesh607@gmail.com&quot;)</li>
                <li>See all errors for that user with exact timestamps</li>
                <li>Click error → View stack trace + user journey</li>
                <li><strong>Time saved: 6 hours 50 minutes</strong></li>
              </ol>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-1">Scenario 2: Meta Account Connection Issues</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Sentry captures exact Facebook API error response</li>
                <li>Shows request payload that failed</li>
                <li>Displays user&apos;s breadcrumbs (what they clicked before error)</li>
                <li>See if error is user-specific or affects everyone</li>
                <li><strong>Instant diagnosis</strong></li>
              </ol>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold mb-1">Scenario 3: Admin Panel Page Load Issues</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Sentry shows which API call failed</li>
                <li>Performance tab reveals slow database queries</li>
                <li>Session replay shows exactly what user saw</li>
                <li>Error ID (e.g., ERR-a3f9b2) users can share with you</li>
                <li><strong>Fixed in minutes</strong></li>
              </ol>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              💡 <strong>Pro Tip:</strong> Set up Slack/email alerts in Sentry settings to get notified 
              immediately when critical errors happen, instead of waiting for users to report them.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Real-Time Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>What You Get Automatically</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Error Details</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Full stack trace</li>
                <li>✓ User email & ID</li>
                <li>✓ Device & browser info</li>
                <li>✓ Request URL & method</li>
                <li>✓ Response status code</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Context & History</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Last 100 user actions</li>
                <li>✓ API calls made before error</li>
                <li>✓ Console logs & network requests</li>
                <li>✓ User&apos;s journey path</li>
                <li>✓ Similar errors grouped together</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

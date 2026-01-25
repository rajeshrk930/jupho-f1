import { SignIn } from '@clerk/nextjs';
import AuthLayout from '@/components/auth/AuthLayout';
import { clerkTheme } from '@/lib/clerkTheme';

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn 
        appearance={clerkTheme}
        forceRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </AuthLayout>
  );
}

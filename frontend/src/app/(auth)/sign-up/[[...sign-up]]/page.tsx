import { SignUp } from '@clerk/nextjs';
import AuthLayout from '@/components/auth/AuthLayout';
import { clerkTheme } from '@/lib/clerkTheme';

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp 
        appearance={clerkTheme}
        forceRedirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </AuthLayout>
  );
}

import { SignIn } from '@clerk/nextjs';
import AuthLayout from '@/components/auth/AuthLayout';

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg"
          }
        }}
        forceRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </AuthLayout>
  );
}

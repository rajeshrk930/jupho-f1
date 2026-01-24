import { SignUp } from '@clerk/nextjs';
import AuthLayout from '@/components/auth/AuthLayout';

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg"
          }
        }}
        forceRedirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </AuthLayout>
  );
}

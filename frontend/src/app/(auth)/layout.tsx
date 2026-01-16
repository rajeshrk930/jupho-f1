export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-coral-50 to-mint-50">
      {children}
    </div>
  );
}

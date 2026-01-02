interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function PageContainer({ children, maxWidth = 'lg' }: PageContainerProps) {
  const widthClasses = {
    sm: 'max-w-xl',
    md: 'max-w-3xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    full: 'max-w-7xl',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className={`${widthClasses[maxWidth]} mx-auto`}>
        {children}
      </div>
    </div>
  );
}

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAuthEnabled } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is disabled, always render children
  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  // If authenticated, render the protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated, show login page
  return <LoginPage />;
}
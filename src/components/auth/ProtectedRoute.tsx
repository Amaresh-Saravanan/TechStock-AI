import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Verifying authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the attempted URL to redirect back after successful login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is authenticated, render the child routes
  return <Outlet />;
}

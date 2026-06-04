import { Navigate, useLocation } from 'react-router';
import { useApp } from '../../contexts/AppContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-[#757575]">Đang tải...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

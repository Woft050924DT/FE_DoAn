import { Navigate, useLocation } from 'react-router';
import { useApp } from '../../contexts/AppContext';
import { isAdminUser } from '../../utils/roles';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading, isAuthenticated } = useApp();
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

  if (!isAdminUser(user)) {
    return <Navigate to="/account" replace />;
  }

  return <>{children}</>;
}

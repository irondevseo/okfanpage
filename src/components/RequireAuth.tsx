import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function BootSplash() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 bg-slate-950 px-6">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500"
        aria-hidden
      />
      <p className="text-sm text-slate-400">Đang kiểm tra phiên đăng nhập…</p>
    </div>
  );
}

export function RequireAuth() {
  const { profile, status } = useAuth();

  if (status === 'boot') {
    return <BootSplash />;
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

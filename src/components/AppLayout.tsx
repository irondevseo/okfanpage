import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AppLayout() {
  const { profile, logout } = useAuth();

  return (
    <div className="flex min-h-full flex-col bg-slate-950">
      <header className="flex items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/40 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              [
                'text-sm font-semibold tracking-tight transition',
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200',
              ].join(' ')
            }
          >
            okfanpage
          </NavLink>
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300',
                ].join(' ')
              }
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/settings/api-ai"
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300',
                ].join(' ')
              }
            >
              Cài đặt
            </NavLink>
          </nav>
        </div>
        {profile && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-800/50 py-1 pl-1 pr-3">
              {profile.pictureUrl ? (
                <img
                  src={profile.pictureUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-700"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-medium text-slate-300">
                  {profile.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-100">
                  {profile.name}
                </p>
                <p className="truncate text-xs text-slate-500">ID {profile.id}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </header>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col px-4 py-5 sm:px-5">
        <Outlet />
      </main>
    </div>
  );
}

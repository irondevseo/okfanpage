import { NavLink, Outlet } from 'react-router-dom';

const categories: { to: string; label: string; hint: string }[] = [
  {
    to: '/settings/api-ai',
    label: 'API AI',
    hint: 'OpenRouter — model & API key',
  },
];

export function SettingsPage() {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-8 lg:flex-row lg:gap-10">
      <aside className="shrink-0 lg:w-56">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Cài đặt
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cấu hình chung cho ứng dụng.
        </p>
        <nav className="mt-8 flex flex-col gap-1 border-t border-slate-800/80 pt-6">
          {categories.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              className={({ isActive }) =>
                [
                  'rounded-xl px-4 py-3 text-left text-sm transition',
                  isActive
                    ? 'border border-blue-500/40 bg-blue-500/10 text-white'
                    : 'border border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/50 hover:text-slate-200',
                ].join(' ')
              }
            >
              <span className="font-medium">{c.label}</span>
              <span className="mt-0.5 block text-xs font-normal text-slate-500">
                {c.hint}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-h-0 min-w-0 flex-1 rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 sm:p-8">
        <Outlet />
      </div>
    </div>
  );
}

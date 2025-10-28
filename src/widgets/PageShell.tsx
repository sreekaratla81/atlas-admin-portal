import { NavLink, Outlet, useLocation, useMatches } from 'react-router-dom';

export function PageShell() {
  const matches = useMatches();
  const location = useLocation();
  const rootHandle = matches[0]?.handle as
    | { navItems?: { path: string; title: string }[] }
    | undefined;
  const navItems = rootHandle?.navItems ?? [];
  const breadcrumbs = matches
    .map((match) => (match.handle as { title?: string } | undefined)?.title)
    .filter((title): title is string => Boolean(title));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold">Atlas Admin</p>
            <p className="text-xs text-slate-500">
              Manage properties, bookings, listings, and guests
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded px-3 py-2 transition-colors ${
                    isActive || location.pathname.startsWith(item.path)
                      ? 'bg-slate-900 text-white'
                      : 'hover:bg-slate-100'
                  }`
                }
              >
                {item.title}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-4">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb} className="flex items-center gap-2">
                <span>{crumb}</span>
                {index < breadcrumbs.length - 1 ? <span className="text-slate-400">/</span> : null}
              </li>
            ))}
          </ol>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default PageShell;

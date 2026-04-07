import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, BookOpen, LogOut, Bell, Building2 } from 'lucide-react';
import clsx from 'clsx';
import GlobalErrorBoundary from '../common/GlobalErrorBoundary';

const CoordinatorLayout = () => {
  const { user, logout, isOffline, connectionStatus } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/coordinator', icon: LayoutDashboard },
    { name: 'My Courses', path: '/coordinator/courses', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="bg-purple-600 p-2 rounded-lg mr-3">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">Coordinator</span>
              </div>
              <nav className="ml-8 hidden sm:flex space-x-1 items-center">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/coordinator' && location.pathname.startsWith(item.path));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center",
                        isActive
                          ? "bg-purple-50 text-purple-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <Icon className={clsx("w-4 h-4 mr-2", isActive ? "text-purple-600" : "text-slate-500")} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center" title={`Status: ${connectionStatus}`}>
                <div className={clsx(
                  "w-3 h-3 rounded-full border border-white shadow-sm transition-colors duration-300",
                  connectionStatus === 'CONNECTED' && "bg-emerald-500",
                  connectionStatus === 'RECONNECTING' && "bg-orange-500 animate-pulse",
                  connectionStatus === 'DISCONNECTED' && "bg-red-500"
                )}></div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-500 bg-slate-50 rounded-full relative transition-colors hidden sm:block">
                <Bell className="w-5 h-5" />
              </button>
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 flex items-center justify-center text-white font-bold mr-3 shadow-md">
                  {user?.name?.charAt(0) || 'C'}
                </div>
                <div className="mr-4 hidden md:block">
                  <p className="text-sm font-medium text-slate-900 leading-tight">{user?.name || 'Coordinator'}</p>
                  <p className="text-xs text-purple-600 font-semibold">Course Coordinator</p>
                </div>
                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Sign Out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Offline Banner */}
      {isOffline && (
        <div className={clsx(
          "px-4 py-2 text-center text-sm font-semibold z-40 relative shadow-md transition-colors border-b",
          connectionStatus === 'RECONNECTING' ? "bg-orange-500 text-orange-50 border-orange-600" : "bg-red-500 text-red-50 border-red-600"
        )}>
          {connectionStatus === 'RECONNECTING' ? 'Reconnecting to server...' : 'System offline.'}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
          <GlobalErrorBoundary>
            <Outlet />
          </GlobalErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default CoordinatorLayout;

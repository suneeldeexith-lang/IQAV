import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, BookOpen, Users, Settings, LogOut, CheckSquare } from 'lucide-react';
import clsx from 'clsx';
import GlobalErrorBoundary from '../common/GlobalErrorBoundary';

const AdminLayout = () => {
  const { user, logout, isOffline, connectionStatus } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Compliance Records', path: '/admin/compliance', icon: CheckSquare },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 relative z-20 shadow-xl">
        <div className="h-20 flex justify-between items-center px-6 border-b border-slate-800">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-brand-500 mr-3" />
            <h1 className="text-xl font-bold tracking-tight">Admin Portal</h1>
          </div>
          <div className="flex items-center" title={`Status: ${connectionStatus}`}>
             <div className={clsx(
                "w-3 h-3 rounded-full border border-slate-900 shadow-sm transition-colors duration-300",
                connectionStatus === 'CONNECTED' && "bg-emerald-500",
                connectionStatus === 'RECONNECTING' && "bg-orange-500 animate-pulse",
                connectionStatus === 'DISCONNECTED' && "bg-red-500"
             )}></div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-brand-500/10 text-brand-400" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <Icon className={clsx(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive ? "text-brand-400" : "group-hover:text-slate-200"
                )} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-brand-500 rounded-r-full" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center px-4 py-3 mb-2 rounded-xl bg-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-admin-600 flex items-center justify-center text-white font-bold mr-3 shadow-inner">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-slate-50 overflow-hidden">
        {isOffline && (
           <div className={clsx(
              "px-4 py-2 text-center text-sm font-semibold z-40 relative shadow-md transition-colors border-b",
              connectionStatus === 'RECONNECTING' ? "bg-orange-500 text-orange-50 border-orange-600" : "bg-red-500 text-red-50 border-red-600"
           )}>
              {connectionStatus === 'RECONNECTING' ? (
                 <span className="flex items-center justify-center">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
                    Reconnecting to server...
                 </span>
              ) : (
                 "System offline. Please start backend server using npm run start:backend"
              )}
           </div>
        )}
        <div className="absolute top-[-20%] left-[20%] w-96 h-96 bg-admin-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob pointer-events-none"></div>
        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full relative z-10 min-h-full block">
          <GlobalErrorBoundary>
             <Outlet />
          </GlobalErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  Menu, 
  Tag, 
  BarChart3, 
  Coffee,
  Settings,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { useAuth } from '../stores/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const navItems = [
    { path: '/order', icon: ShoppingCart, label: 'ออเดอร์', color: 'text-blue-600', protected: false },
    { path: '/daily-sales', icon: TrendingUp, label: 'ยอดขายรายวัน', color: 'text-indigo-600', protected: false },
    { path: '/menu', icon: Menu, label: 'จัดการเมนู', color: 'text-green-600', protected: true },
    { path: '/promotions', icon: Tag, label: 'โปรโมชั่น', color: 'text-purple-600', protected: true },
    { path: '/reports', icon: BarChart3, label: 'รายงาน', color: 'text-orange-600', protected: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Coffee className="w-8 h-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-800">
              CHA-MA-ROD-FAI POS
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">ออกจากระบบ</span>
              </button>
            )}
            <button className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive(item.path) ? item.color : 'text-gray-400'}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

import { useState } from 'react';
import {
  LayoutDashboard, UtensilsCrossed, QrCode, ShoppingBag, Table2,
  Receipt, Package, Users, Gift, BarChart3, Settings, Shield,
  ClipboardList, Bell, ChevronLeft, Menu, X, Lock, LogOut, Store
} from 'lucide-react';
import AdminDashboard from './AdminDashboard';
import AdminReports from './AdminReports';
import AdminMenuManagement from './AdminMenuManagement';
import AdminInventory from './AdminInventory';
import AdminOrders from './AdminOrders';
import AdminTables from './AdminTables';
import AdminQR from './AdminQR';
import AdminBilling from './AdminBilling';
import AdminCustomers from './AdminCustomers';
import AdminLoyalty from './AdminLoyalty';
import AdminSettings from './AdminSettings';
import AdminUsers from './AdminUsers';
import AdminAuditLogs from './AdminAuditLogs';

type AdminModule =
  | 'dashboard' | 'menu' | 'qr' | 'orders' | 'tables'
  | 'billing' | 'inventory' | 'customers' | 'loyalty'
  | 'reports' | 'settings' | 'users' | 'audit';

interface NavItem { id: AdminModule; label: string; icon: React.ElementType; built: boolean; }

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard',          icon: LayoutDashboard, built: true  },
    ]
  },
  {
    title: 'Operations',
    items: [
      { id: 'menu',      label: 'Menu Management',    icon: UtensilsCrossed, built: true  },
      { id: 'qr',        label: 'QR Management',      icon: QrCode,          built: true  },
      { id: 'orders',    label: 'Order Management',   icon: ShoppingBag,     built: true  },
      { id: 'tables',    label: 'Table Management',   icon: Table2,          built: true  },
      { id: 'billing',   label: 'Billing & Payments', icon: Receipt,         built: true  },
    ]
  },
  {
    title: 'Business',
    items: [
      { id: 'inventory', label: 'Inventory',          icon: Package,         built: true  },
      { id: 'customers', label: 'Customers',          icon: Users,           built: true  },
      { id: 'loyalty',   label: 'Loyalty & Coupons',  icon: Gift,            built: true  },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { id: 'reports',   label: 'Reports & Analytics',icon: BarChart3,       built: true  },
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'settings',  label: 'Restaurant Settings',icon: Settings,        built: true  },
      { id: 'users',     label: 'User & Role Mgmt',   icon: Shield,          built: true  },
      { id: 'audit',     label: 'Audit Logs',         icon: ClipboardList,   built: true  },
    ]
  },
];

// Modules that use full-height layout (no internal padding wrapper)
const FULL_HEIGHT_MODULES: AdminModule[] = ['menu', 'orders', 'customers', 'settings'];

function ComingSoon({ module }: { module: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Lock className="w-7 h-7 text-gray-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{module} — Coming Soon</h3>
        <p className="text-sm text-gray-400 mt-1 max-w-xs">This module is under development.</p>
      </div>
      <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">Planned for next sprint</span>
    </div>
  );
}

function Sidebar({ active, onNavigate, collapsed, onToggle, onExit }: {
  active: AdminModule; onNavigate: (m: AdminModule) => void;
  collapsed: boolean; onToggle: () => void; onExit: () => void;
}) {
  return (
    <aside className={`h-screen bg-black flex flex-col transition-all duration-200 shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className={`flex items-center border-b border-white/10 h-14 px-4 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-pink-300 flex items-center justify-center shrink-0">
              <Store className="w-3.5 h-3.5 text-pink-900" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">SmartDine</p>
              <p className="text-[10px] text-neutral-500 leading-none mt-0.5">Admin Portal</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-pink-300 flex items-center justify-center">
            <Store className="w-3.5 h-3.5 text-pink-900" />
          </div>
        )}
        <button onClick={onToggle} className="text-neutral-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/8">
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_GROUPS.map(group => (
          <div key={group.title} className="mb-5">
            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-600 px-3 mb-2">
                {group.title}
              </p>
            )}
            {group.items.map(item => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-0.5 relative
                    ${collapsed ? 'justify-center' : ''}
                    ${isActive
                      ? 'bg-pink-200/15 text-pink-200'
                      : item.built
                        ? 'text-neutral-400 hover:bg-white/6 hover:text-white'
                        : 'text-neutral-700 hover:bg-white/4 hover:text-neutral-500'
                    }`}
                >
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-pink-300 rounded-r-full" />
                  )}
                  <item.icon className={`shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {!item.built && (
                        <span className="text-[9px] bg-white/8 text-neutral-600 px-1.5 py-0.5 rounded font-medium">Soon</span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 space-y-1 shrink-0">
        <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-pink-300 flex items-center justify-center shrink-0 text-[11px] font-bold text-pink-900">A</div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Admin User</p>
              <p className="text-[10px] text-neutral-500 truncate">Owner</p>
            </div>
          )}
        </div>
        <button
          onClick={onExit}
          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs text-neutral-500 hover:text-white hover:bg-white/8 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Exit to Site</span>}
        </button>
      </div>
    </aside>
  );
}

function TopBar({ module, onExit }: { module: AdminModule; onExit: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const label = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === module)?.label || module;

  return (
    <header className="h-14 bg-white border-b border-pink-100 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">SmartDine Admin</span>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-800">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-400 rounded-full" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800">Notifications</span>
                <button onClick={() => setNotifOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {[
                  { msg: 'New order #1047 — Table 7', time: '2 min', dot: true  },
                  { msg: 'Matcha powder critically low', time: '8 min', dot: true  },
                  { msg: 'Payment received ₹4,500', time: '22 min', dot: false },
                  { msg: 'Riya Sharma started shift', time: '48 min', dot: false },
                ].map((n, i) => (
                  <div key={i} className={`px-4 py-3 hover:bg-gray-50 ${n.dot ? 'bg-pink-50/30' : ''}`}>
                    <p className="text-xs text-gray-700 font-medium">{n.msg}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{n.time} ago</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button onClick={onExit}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors font-medium">
          <X className="w-3.5 h-3.5" /> Exit Admin
        </button>
      </div>
    </header>
  );
}

export default function AdminPortal({ onExit }: { onExit: () => void }) {
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeItem = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeModule);
  const moduleLabel = activeItem?.label || activeModule;
  const isFullHeight = FULL_HEIGHT_MODULES.includes(activeModule);

  function renderModule() {
    switch (activeModule) {
      case 'dashboard': return <AdminDashboard />;
      case 'reports':   return <AdminReports />;
      case 'menu':      return <AdminMenuManagement />;
      case 'inventory': return <AdminInventory />;
      case 'orders':    return <AdminOrders />;
      case 'tables':    return <AdminTables />;
      case 'qr':        return <AdminQR />;
      case 'billing':   return <AdminBilling />;
      case 'customers': return <AdminCustomers />;
      case 'loyalty':   return <AdminLoyalty />;
      case 'settings':  return <AdminSettings />;
      case 'users':     return <AdminUsers />;
      case 'audit':     return <AdminAuditLogs />;
      default:          return <ComingSoon module={moduleLabel} />;
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar active={activeModule} onNavigate={setActiveModule}
        collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} onExit={onExit} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar module={activeModule} onExit={onExit} />

        {isFullHeight ? (
          <div className="flex-1 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            {renderModule()}
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[1400px] mx-auto animate-[fadeIn_0.2s_ease-out]">
              {renderModule()}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

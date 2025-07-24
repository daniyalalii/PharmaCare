import { Link, useLocation } from 'wouter';
import { useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Pill
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { animateSidebar, animateSidebarItem, animateSidebarItemLeave, animateStaggerList } from '@/lib/gsapUtils';
import { LocalStorageManager } from '@/lib/localStorage';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package, badge: '4' },
  { name: 'Point of Sale', href: '/billing', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Prescriptions', href: '/prescriptions', icon: FileText, badge: '12' },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (sidebarRef.current) {
      animateSidebar(sidebarRef.current);
    }
    if (navRef.current) {
      const navItems = navRef.current.querySelectorAll('.nav-item');
      animateStaggerList(navItems as NodeListOf<Element>);
    }
  }, []);

  // Get low stock count for inventory badge
  const lowStockCount = LocalStorageManager.getProducts().filter(p => p.stock <= 10).length;
  // Get pending prescriptions count
  const pendingPrescriptionsCount = LocalStorageManager.getPrescriptions().filter(p => p.status === 'pending').length;

  return (
    <aside ref={sidebarRef} className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Pill className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PharmaCare</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav ref={navRef} className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          let badgeCount = item.badge;
          
          // Update badge counts dynamically
          if (item.name === 'Inventory') {
            badgeCount = lowStockCount > 0 ? lowStockCount.toString() : undefined;
          } else if (item.name === 'Prescriptions') {
            badgeCount = pendingPrescriptionsCount > 0 ? pendingPrescriptionsCount.toString() : undefined;
          }
          
          return (
            <Link key={item.name} href={item.href}>
              <a 
                className={cn(
                  "nav-item flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  isActive 
                    ? "bg-primary-50 text-primary-700 shadow-sm" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onMouseEnter={(e) => animateSidebarItem(e.currentTarget, isActive)}
                onMouseLeave={(e) => animateSidebarItemLeave(e.currentTarget, isActive)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {badgeCount && (
                  <span className={cn(
                    "ml-auto text-xs px-2 py-1 rounded-full",
                    item.name === 'Inventory' 
                      ? "bg-yellow-500 text-white"
                      : "bg-primary text-white"
                  )}>
                    {badgeCount}
                  </span>
                )}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Users className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Dr. Sarah Johnson</p>
            <p className="text-xs text-gray-500">Head Pharmacist</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

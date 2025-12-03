// components/admin/AdminSidebar.jsx

import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  AlertTriangle,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  MessageSquare,
  Shield,
  Calendar,
  Bell,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const { adminLogout, admin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const menuItems = [
    {
      section: 'Main',
      items: [
        {
          name: 'Dashboard',
          icon: LayoutDashboard,
          path: '/admin/dashboard',
          badge: null,
        },
        {
          name: 'Analytics',
          icon: BarChart3,
          path: '/admin/analytics',
          badge: null,
        },
      ],
    },
    {
      section: 'Management',
      items: [
        {
          name: 'Applications',
          icon: FileText,
          path: '/admin/applications',
          badge: { count: 5, variant: 'default' }, // You can make this dynamic
        },
        {
          name: 'Disputes',
          icon: AlertTriangle,
          path: '/admin/disputes',
          badge: { count: 3, variant: 'destructive' },
        },
        {
          name: 'Clients',
          icon: Users,
          path: '/admin/clients',
          badge: null,
        },
        {
          name: 'Counselors',
          icon: UserCheck,
          path: '/admin/counselors',
          badge: null,
        },
        {
          name: 'Sessions',
          icon: Calendar,
          path: '/admin/sessions',
          badge: null,
        },
      ],
    },
    {
      section: 'Finance',
      items: [
        {
          name: 'Payments',
          icon: CreditCard,
          path: '/admin/payments',
          badge: null,
        },
        {
          name: 'Payouts',
          icon: CreditCard,
          path: '/admin/payouts',
          badge: null,
        },
      ],
    },
    {
      section: 'Support',
      items: [
        {
          name: 'Messages',
          icon: MessageSquare,
          path: '/admin/messages',
          badge: { count: 12, variant: 'secondary' },
        },
        {
          name: 'Notifications',
          icon: Bell,
          path: '/admin/notifications',
          badge: null,
        },
      ],
    },
    {
      section: 'System',
      items: [
        {
          name: 'Settings',
          icon: Settings,
          path: '/admin/settings',
          badge: null,
        },
        {
          name: 'Security',
          icon: Shield,
          path: '/admin/security',
          badge: null,
        },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Admin Panel</h1>
           
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-slate-100"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {menuItems.map((section, idx) => (
            <div key={idx}>
              {!collapsed && (
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                  {section.section}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  const linkContent = (
                    <NavLink
                      to={item.path}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                        ${
                          active
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-slate-700 hover:bg-slate-100'
                        }
                        ${collapsed ? 'justify-center' : ''}
                      `}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-600' : ''}`} />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          {item.badge && (
                            <Badge variant={item.badge.variant} className="text-xs">
                              {item.badge.count}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  );

                  if (collapsed) {
                    return (
                      <TooltipProvider key={item.name}>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.name}</p>
                            {item.badge && <Badge className="ml-2">{item.badge.count}</Badge>}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }

                  return <div key={item.name}>{linkContent}</div>;
                })}
              </div>
              {idx < menuItems.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer - Admin Info */}
      <div className="p-4 border-t border-slate-200">
        <div
          className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''} mb-3 p-2 bg-slate-50 rounded-lg`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {admin?.fullName?.charAt(0) || 'A'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {admin?.fullName || 'Admin'}
              </p>
              <p className="text-xs text-slate-500 truncate">{admin?.email || 'admin@solvit.com'}</p>
            </div>
          )}
        </div>

        {collapsed ? (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;

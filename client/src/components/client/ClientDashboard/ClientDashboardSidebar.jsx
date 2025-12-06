import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  Users,
  CreditCard,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';

import { useClientAuth } from '../../../contexts/ClientAuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const sidebarItems = [
  {
    id: 'personal-info',
    path: '/client/dashboard/personal-info',
    name: 'Personal Information',
    icon: User,
    description: 'Manage your profile',
  },
  {
    id: 'bookings',
    path: '/client/dashboard/bookings',
    name: 'My Sessions',
    icon: Calendar,
    description: 'Upcoming & past sessions',
  },
  // {
  //   id: 'connected-counselors',
  //   path: '/client/dashboard/connected-counselors',
  //   name: 'Connected Counselors',
  //   icon: Users,
  //   description: 'Your counselors',
  // },
  // {
  //   id: 'payments',
  //   path: '/client/dashboard/payments',
  //   name: 'Payments & Billing',
  //   icon: CreditCard,
  //   description: 'Transaction history',
  // },
  // {
  //   id: 'account-settings',
  //   path: '/client/dashboard/account-settings',
  //   name: 'Account Settings',
  //   icon: Settings,
  //   description: 'Security & preferences',
  // },
  // {
  //   id: 'notifications',
  //   path: '/client/dashboard/notifications',
  //   name: 'Notifications',
  //   icon: Bell,
  //   description: 'Alerts & reminders',
  // },
  // {
  //   id: 'privacy-security',
  //   path: '/client/dashboard/privacy-security',
  //   name: 'Privacy & Security',
  //   icon: Shield,
  //   description: 'Data privacy settings',
  // },
  // {
  //   id: 'help-support',
  //   path: '/client/dashboard/help-support',
  //   name: 'Help & Support',
  //   icon: HelpCircle,
  //   description: 'Get assistance',
  // },
];

const ClientDashboardSidebar = ({ onNavigate, showCloseButton = false }) => {
  const location = useLocation();
  const { client, clientLogout } = useClientAuth();

  const handleLogout = async () => {
    try {
      await clientLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = () => {
    const name = client?.name || client?.firstName || '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0)?.toUpperCase() || 'C';
  };

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Profile Section with Gradient */}
      <div className="p-6 flex-shrink-0 bg-gradient-to-br from-primary-50/50 to-blue-50/30 dark:from-primary-950/30 dark:to-blue-950/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-base font-bold bg-gradient-to-r from-primary-700 to-blue-600 dark:from-primary-400 dark:to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </h2>
          </div>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNavigate}
              className="lg:hidden hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:scale-110 transition-all duration-300"
            >
              <X className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </Button>
          )}
        </div>
      </div>

      <Separator className="bg-primary-200/50 dark:bg-primary-800/30 flex-shrink-0" />

      {/* Navigation - Scrollable with proper padding */}
      <ScrollArea className="flex-1">
        <nav className="px-4 py-4 space-y-2" role="navigation" aria-label="Main navigation">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link key={item.id} to={item.path} onClick={handleNavClick}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    className={`
                      w-full justify-start h-auto py-3 px-3 transition-all duration-300
                      ${
                        active
                          ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }
                    `}
                    aria-current={active ? 'page' : undefined}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Icon
                        className={`w-5 h-5 shrink-0 mt-0.5 transition-all duration-300 ${active ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`}
                      />
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-semibold text-sm leading-snug">{item.name}</div>
                        <div
                          className={`text-xs mt-1 leading-snug ${active ? 'text-white/90' : 'text-neutral-500 dark:text-neutral-400'}`}
                        >
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Extra padding at bottom for scroll */}
        <div className="h-4" />
      </ScrollArea>

      <Separator className="bg-primary-200/50 dark:bg-primary-800/30 flex-shrink-0" />

      {/* Logout Button with Gradient Hover */}
      <div className="p-4 flex-shrink-0 bg-gradient-to-t from-red-50/30 to-transparent dark:from-red-950/10">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start h-auto py-3 px-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] transition-all duration-300 group"
        >
          <div className="flex items-center gap-3 w-full">
            <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
            <div className="flex-1 text-left min-w-0">
              <div className="font-semibold text-sm leading-snug">Logout</div>
              <div className="text-xs mt-0.5 text-neutral-500 dark:text-neutral-400">
                Sign out of your account
              </div>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default ClientDashboardSidebar;

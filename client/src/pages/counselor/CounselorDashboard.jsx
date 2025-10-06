
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  PenSquare,
  Menu,
  X,
} from 'lucide-react';
import MySlots from '../../components/counselor/counselorDashboard/Myslots';
import RecurringAvailabilityManager from '../../components/counselor/counselorDashboard/RecurringAvailabilityManager';
import BlogManagement from '../../components/counselor/counselorDashboard/BlogManagement';
import { useCounselorAuth } from '../../contexts/CounselorAuthContext';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

const CounselorDashboard = () => {
  const { counselor, counselorLogout } = useCounselorAuth();
  const [activeTab, setActiveTab] = useState('availability');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sidebarItems = [
    {
      id: 'availability',
      name: 'Set Availability',
      icon: Calendar,
      description: 'Manage your weekly schedule',
    },
    {
      id: 'slots',
      name: 'My Slots',
      icon: Clock,
      description: 'View upcoming appointments',
    },
    {
      id: 'blogManagement',
      name: 'Blog Management',
      icon: PenSquare,
      description: 'Create and manage blog posts',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      description: 'View your performance',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      description: 'Account preferences',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'availability':
        return <RecurringAvailabilityManager />;
      case 'slots':
        return <MySlots />;
      case 'blogManagement':
        return <BlogManagement />;
      case 'analytics':
        return (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="p-6"
          >
            <Card className="border border-neutral-200 dark:border-neutral-800">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                  Track your blog performance, client engagement, and more. Coming soon!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="p-6"
          >
            <Card className="border border-neutral-200 dark:border-neutral-800">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Settings className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Settings Panel
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                  Customize your account preferences and notification settings. Coming soon!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      default:
        return <RecurringAvailabilityManager />;
    }
  };

  const getInitials = () => {
    const first = counselor?.firstName?.charAt(0) || '';
    const last = counselor?.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  const handleNavClick = (itemId) => {
    setActiveTab(itemId);
    setMobileMenuOpen(false);
  };

  const SidebarContent = ({ showCloseButton = false }) => (
    <div className="flex flex-col h-full">
      {/* Profile Section with optional close button */}
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">Dashboard</h2>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 ring-2 ring-primary-100 dark:ring-primary-900">
            <AvatarFallback className="bg-gradient-to-br from-primary-600 to-primary-700 text-white font-bold text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
              {counselor?.firstName} {counselor?.lastName}
            </h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              Counselor
            </Badge>
          </div>
        </div>
      </div>

      <Separator className="bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />

      {/* Navigation - Scrollable */}
      <ScrollArea className="flex-1">
        <nav className="px-4 py-6 space-y-3" role="navigation" aria-label="Main navigation">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start h-auto py-5 px-4 transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-start gap-4 w-full">
                  <Icon className={`w-6 h-6 shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`} />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-base leading-tight">{item.name}</div>
                    <div className={`text-xs mt-1.5 leading-relaxed ${isActive ? 'text-white/90' : 'text-neutral-500 dark:text-neutral-400'}`}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );

  return (
    <div className="h-[calc(100vh-80px)] bg-neutral-50 dark:bg-neutral-950 flex overflow-hidden mt-[80px] fixed w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar with Close Button */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-neutral-900">
          <SidebarContent showCloseButton={true} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
               {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeIn}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default CounselorDashboard;

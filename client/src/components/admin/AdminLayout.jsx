// components/admin/AdminLayout.jsx

import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Shield } from 'lucide-react';

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-slate-50 overflow-x-hidden">
      {/* Mobile / Tablet Admin Header Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-base tracking-tight">Admin Panel</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-700 hover:bg-slate-100">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle admin navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 sm:w-80 max-w-[85vw] border-r border-slate-200">
            <AdminSidebar 
              collapsed={false} 
              setCollapsed={() => {}} 
              onItemClick={() => setMobileOpen(false)}
              isMobile={true}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen flex-shrink-0">
        <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} isMobile={false} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto lg:h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;


// File: src/pages/CounselorDashboard.jsx
import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import MySlots from "../components/counselorDashboard/Myslots";
import RecurringAvailabilityManager from "../components/counselorDashboard/RecurringAvailabilityManager";
import { useCounselorAuth } from "../contexts/CounselorAuthContext";

const CounselorDashboard = () => {
  const { counselor, logout } = useCounselorAuth();
  const [activeTab, setActiveTab] = useState("availability");

  const sidebarItems = [
    {
      id: "availability",
      name: "Set Availability",
      icon: CalendarDaysIcon,
      description: "Manage your weekly schedule",
    },
    {
      id: "slots",
      name: "My Slots",
      icon: ClockIcon,
      description: "View upcoming appointments",
    },
    {
      id: "profile",
      name: "Profile",
      icon: UserCircleIcon,
      description: "Update your information",
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: ChartBarIcon,
      description: "View your performance",
    },
    {
      id: "settings",
      name: "Settings",
      icon: Cog6ToothIcon,
      description: "Account preferences",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "availability":
        return <RecurringAvailabilityManager />;
      case "slots":
        return <MySlots />;
      case "profile":
        return <div className="p-6">Profile management coming soon...</div>;
      case "analytics":
        return <div className="p-6">Analytics dashboard coming soon...</div>;
      case "settings":
        return <div className="p-6">Settings panel coming soon...</div>;
      default:
        return <RecurringAvailabilityManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {counselor?.firstName?.charAt(0)}
                {counselor?.lastName?.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {counselor?.firstName} {counselor?.lastName}
              </h2>
              <p className="text-sm text-gray-500">Counselor</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-50 border-r-2 border-blue-600 text-blue-600"
                    : "text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center text-gray-700 hover:text-red-600 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {sidebarItems.find((item) => item.id === activeTab)?.name ||
                "Dashboard"}
            </h1>
            <p className="text-gray-600 mt-1">
              {sidebarItems.find((item) => item.id === activeTab)?.description}
            </p>
          </div>
        </header>

        <main className="flex-1">{renderContent()}</main>
      </div>
    </div>
  );
};

export default CounselorDashboard;

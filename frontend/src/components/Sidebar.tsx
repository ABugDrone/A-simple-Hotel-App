import React from "react";
import {
  LayoutDashboard, 
  BedDouble, 
  CalendarDays, 
  Users, 
  LogOut, 
  Brush,
  Hotel,
  Receipt,
  Settings,
  Download,
  Menu,
  X,
  Palette
} from "lucide-react";
import { Staff } from "../types";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  occupancyPercent: number;
  currentUser: Staff;
  onLogout: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onInstallPWA?: () => void;
  isInstallable?: boolean;
  onThemeSettings?: () => void;
}

export default function Sidebar({ 
  currentView, 
  onViewChange, 
  occupancyPercent,
  currentUser,
  onLogout,
  isSidebarOpen,
  onToggleSidebar,
  onInstallPWA,
  isInstallable,
  onThemeSettings
}: SidebarProps) {
  const allMenuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "rooms", label: "Rooms & Suites", icon: BedDouble },
    { id: "reservations", label: "Front Desk", icon: CalendarDays },
    { id: "housekeeping", label: "Housekeeping", icon: Brush },
    { id: "guests", label: "Guest Directory", icon: Users },
    { id: "billing", label: "Payments & Debt", icon: Receipt },
    { id: "admin_config", label: "Admin Config", icon: Settings },
  ];

  const menuItems = allMenuItems.filter(item => currentUser.allowedTabs.includes(item.id));

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-900 text-white p-2 rounded-lg shadow-lg cursor-pointer"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-40
        w-64 bg-white border-r border-slate-200 text-slate-900 
        flex flex-col justify-between flex-shrink-0
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Hotel Brand Header */}
        <div className="p-6 lg:p-8 pb-6 lg:pb-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Amirable Hotel & Hospitality" className="h-10 w-auto flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xs font-bold tracking-[0.15em] text-slate-400 uppercase truncate">
                Amirable
              </h1>
              <p className="text-lg font-medium text-slate-900 truncate">
                Suites
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 lg:px-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] px-4 mb-3">
            Operations
          </div>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                id={`nav-item-${item.id}`}
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  if (window.innerWidth < 1024) onToggleSidebar();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                  isActive 
                    ? "bg-slate-50 text-slate-900 font-medium border border-slate-200/50 shadow-xs" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer / Occupancy Widget */}
        <div className="p-4 lg:p-8 border-t border-slate-100 bg-white space-y-4">
          {/* Theme Settings Button */}
          {onThemeSettings && (
            <button
              onClick={onThemeSettings}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Palette className="w-4 h-4 flex-shrink-0" />
              <span>Theme & Font</span>
            </button>
          )}

          {/* Install App Button */}
          <button
            onClick={onInstallPWA}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 flex-shrink-0" />
            <span>{isInstallable ? "Install App" : "Install as App"}</span>
          </button>

          <div className="mb-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              <span>Occupancy</span>
              <span>{occupancyPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div 
                className="bg-slate-900 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold uppercase flex-shrink-0">
                {getInitials(currentUser.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{currentUser.role}</p>
              </div>
            </div>
            
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-lg text-xs text-slate-500 font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Portal Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
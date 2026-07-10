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
  Settings
} from "lucide-react";
import { Staff } from "../types";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  occupancyPercent: number;
  currentUser: Staff;
  onLogout: () => void;
}

export default function Sidebar({ 
  currentView, 
  onViewChange, 
  occupancyPercent,
  currentUser,
  onLogout
}: SidebarProps) {
  // Master list of all possible tabs
  const allMenuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "rooms", label: "Rooms & Suites", icon: BedDouble },
    { id: "reservations", label: "Front Desk", icon: CalendarDays },
    { id: "housekeeping", label: "Housekeeping", icon: Brush },
    { id: "guests", label: "Guest Directory", icon: Users },
    { id: "billing", label: "Payments & Debt", icon: Receipt },
    { id: "admin_config", label: "Admin Config", icon: Settings },
  ];

  // Filter based on currently logged in user allowedTabs
  const menuItems = allMenuItems.filter(item => currentUser.allowedTabs.includes(item.id));

  // Compute Initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside id="sidebar-nav" className="w-64 bg-white border-r border-slate-200 text-slate-900 flex flex-col justify-between h-screen sticky top-0 flex-shrink-0">
      {/* Hotel Brand Header */}
      <div className="p-8 pb-10">
        <div>
          <h1 className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
            The Reserve
          </h1>
          <p className="text-xl font-medium text-slate-900 mt-1">
            Amirable Suite
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
              onClick={() => onViewChange(item.id)}
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
      <div className="p-8 border-t border-slate-100 bg-white">
        <div className="mb-6">
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

        {/* Staff Profile and Log out button */}
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold uppercase">
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
  );
}

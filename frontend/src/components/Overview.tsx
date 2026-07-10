import React from "react";
import { 
  TrendingUp, 
  BedDouble, 
  UserCheck, 
  Wrench, 
  CircleDollarSign,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { Room, Booking, OperationLog } from "../types";

interface OverviewProps {
  rooms: Room[];
  bookings: Booking[];
  logs: OperationLog[];
  onViewChange: (view: string) => void;
}

export default function Overview({ rooms, bookings, logs, onViewChange }: OverviewProps) {
  // 1. Calculate Core KPIs
  const totalRoomsCount = rooms.length;
  const occupiedRoomsCount = rooms.filter(r => r.status === "Occupied").length;
  const availableRoomsCount = rooms.filter(r => r.status === "Available").length;
  const cleaningRoomsCount = rooms.filter(r => r.status === "Cleaning").length;
  const maintenanceRoomsCount = rooms.filter(r => r.status === "Maintenance").length;

  const occupancyRate = totalRoomsCount > 0 
    ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) 
    : 0;

  const checkedInBookingsCount = bookings.filter(b => b.status === "Checked In").length;
  const upcomingBookingsCount = bookings.filter(b => b.status === "Upcoming").length;

  // Revenue is calculated from currently Checked In room price sums
  const activeRevenue = bookings
    .filter(b => b.status === "Checked In")
    .reduce((sum, b) => {
      const room = rooms.find(r => r.id === b.roomId);
      return sum + (room ? room.price : 0);
    }, 0);

  // Housekeeping/Maintenance alerts count
  const housekeepingAlertsCount = cleaningRoomsCount + maintenanceRoomsCount;

  // 2. Custom Render Room Status Blocks
  const statusSummary = [
    { label: "Available", count: availableRoomsCount, color: "bg-emerald-500", text: "text-emerald-500", bgLight: "bg-emerald-50" },
    { label: "Occupied", count: occupiedRoomsCount, color: "bg-blue-500", text: "text-blue-500", bgLight: "bg-blue-50" },
    { label: "Cleaning Needed", count: cleaningRoomsCount, color: "bg-amber-500", text: "text-amber-500", bgLight: "bg-amber-50" },
    { label: "Maintenance", count: maintenanceRoomsCount, color: "bg-rose-500", text: "text-rose-500", bgLight: "bg-rose-50" },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-medium text-3xl tracking-tight text-slate-900">
            Hotel Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time Boutique Operations & Performance Summary.
          </p>
        </div>
        
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Occupancy Card */}
        <div id="stat-occupancy" className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-lg text-slate-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 bg-slate-50 text-slate-600 rounded border border-slate-200/40">
              Live
            </span>
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Room Occupancy</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-display font-medium text-slate-900">{occupancyRate}%</span>
              <span className="text-xs text-slate-400 font-medium">({occupiedRoomsCount}/{totalRoomsCount})</span>
            </div>
          </div>
        </div>

        {/* Daily Revenue Card */}
        <div id="stat-revenue" className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-lg text-slate-700">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 bg-slate-50 text-slate-600 rounded border border-slate-200/40">
              Today
            </span>
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Revenue</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-display font-medium text-slate-900">₦{activeRevenue}</span>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                +8.2% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Expected Arrivals Card */}
        <div id="stat-arrivals" className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-lg text-slate-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <button 
              onClick={() => onViewChange("reservations")}
              className="text-xs text-slate-900 font-medium hover:underline cursor-pointer"
            >
              View Desk
            </button>
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expected Arrivals</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-display font-medium text-slate-900">{upcomingBookingsCount}</span>
              <span className="text-xs text-slate-400 font-medium">bookings</span>
            </div>
          </div>
        </div>

        {/* Housekeeping Alert Card */}
        <div id="stat-housekeeping" className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex justify-between items-start">
            <div className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-lg text-slate-700">
              <Wrench className="w-5 h-5" />
            </div>
            {housekeepingAlertsCount > 0 && (
              <span className="w-2 h-2 bg-slate-900 rounded-full animate-ping mt-1" />
            )}
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Housekeeping Tasks</p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-display font-medium text-slate-900">{housekeepingAlertsCount}</span>
              <span className="text-xs text-slate-400 font-medium">pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Room Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Room Status Breakdown Chart Panel */}
        <div className="lg:col-span-1 bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display font-medium text-lg text-slate-900">Room Status Distribution</h3>
            <p className="text-xs text-slate-500 mt-1">Quick overview of capacity allocation.</p>
          </div>

          {/* SVG Custom Donut/Segment Visual */}
          <div className="my-6 flex justify-center items-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                {/* Available Segment */}
                <circle 
                  cx="50" cy="50" r="40" fill="transparent" 
                  stroke="#475569" strokeWidth="8" 
                  strokeDasharray={`${Math.round(80 * Math.PI * (availableRoomsCount / (totalRoomsCount || 1)))} 251`}
                />
                {/* Occupied Segment */}
                <circle 
                  cx="50" cy="50" r="40" fill="transparent" 
                  stroke="#0f172a" strokeWidth="8" 
                  strokeDasharray={`${Math.round(80 * Math.PI * (occupiedRoomsCount / (totalRoomsCount || 1)))} 251`}
                  strokeDashoffset={`-${Math.round(80 * Math.PI * (availableRoomsCount / (totalRoomsCount || 1)))}`}
                />
                {/* Cleaning Segment */}
                <circle 
                  cx="50" cy="50" r="40" fill="transparent" 
                  stroke="#94a3b8" strokeWidth="8" 
                  strokeDasharray={`${Math.round(80 * Math.PI * (cleaningRoomsCount / (totalRoomsCount || 1)))} 251`}
                  strokeDashoffset={`-${Math.round(80 * Math.PI * ((availableRoomsCount + occupiedRoomsCount) / (totalRoomsCount || 1)))}`}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-display font-medium text-slate-900">{occupancyRate}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Occupancy</span>
              </div>
            </div>
          </div>

          {/* Legend Table */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {statusSummary.map((item, idx) => {
              // Custom monochrome / clean slate dots
              let dotColor = "bg-slate-400";
              if (item.label === "Available") dotColor = "bg-slate-600";
              if (item.label === "Occupied") dotColor = "bg-slate-900";
              if (item.label === "Cleaning Needed") dotColor = "bg-slate-300";
              if (item.label === "Maintenance") dotColor = "bg-rose-400";

              return (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <span className="text-slate-600">{item.label}</span>
                  </div>
                  <span className="font-mono font-medium text-slate-900">{item.count} Rooms</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Miniature Hotel Grid representation */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-medium text-lg text-slate-900">Hotel Directory</h3>
              <p className="text-xs text-slate-500 mt-1">Interactive overview of each room's floor position and state.</p>
            </div>
            <button 
              onClick={() => onViewChange("rooms")}
              className="text-xs font-semibold text-slate-900 hover:underline cursor-pointer"
            >
              Configure Rooms
            </button>
          </div>

          <div className="space-y-6">
            {/* Group rooms by floor */}
            {[3, 2, 1].map((floorNum) => {
              const floorRooms = rooms.filter(r => r.floor === floorNum);
              return (
                <div key={floorNum} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <div className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-[0.15em]">
                    Floor {floorNum}
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {floorRooms.map((room) => {
                      let statusBg = "";
                      let badgeDot = "";

                      if (room.status === "Available") {
                        statusBg = "bg-white border-slate-200 text-slate-900 hover:bg-slate-50/50";
                        badgeDot = "bg-slate-400";
                      } else if (room.status === "Occupied") {
                        statusBg = "bg-slate-950 border-slate-950 text-white hover:bg-slate-900";
                        badgeDot = "bg-white";
                      } else if (room.status === "Cleaning") {
                        statusBg = "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/50";
                        badgeDot = "bg-slate-300";
                      } else {
                        statusBg = "bg-rose-50/50 border-rose-100 text-rose-900 hover:bg-rose-50";
                        badgeDot = "bg-rose-400";
                      }

                      return (
                        <div
                          key={room.id}
                          className={`p-3.5 rounded-lg border flex flex-col justify-between h-20 transition-all cursor-pointer ${statusBg}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-mono text-sm font-bold">{room.roomNumber}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${badgeDot}`} />
                          </div>
                          <div className={`text-[10px] font-medium truncate ${room.status === "Occupied" ? "text-slate-300" : "text-slate-500"}`}>
                            {room.type} • ₦{room.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operational Audit Log Feed */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-xl shadow-xs">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="font-display font-medium text-lg text-slate-900">Recent Operational History</h3>
            <p className="text-xs text-slate-500 mt-1">Chronological system tracking of hotel management logs.</p>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Live Audit Log</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-2 space-y-3 pt-2">
          {logs.slice(0, 10).map((log) => {
            let logTypeBadge = "";
            if (log.type === "Booking") {
              logTypeBadge = "bg-slate-100 text-slate-800 border-slate-200/60";
            } else if (log.type === "Housekeeping") {
              logTypeBadge = "bg-slate-50 text-slate-700 border-slate-200/40";
            } else if (log.type === "Guest") {
              logTypeBadge = "bg-slate-900 text-white border-slate-800";
            } else {
              logTypeBadge = "bg-white text-slate-600 border-slate-200";
            }

            return (
              <div key={log.id} className="flex justify-between items-start py-3 first:pt-0 last:pb-0 gap-4">
                <div className="flex gap-3 items-start">
                  <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${logTypeBadge} flex-shrink-0 mt-0.5`}>
                    {log.type}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-700 leading-tight">
                      {log.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      STAFF: <span className="font-semibold text-slate-600">{log.staffMember}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 mt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

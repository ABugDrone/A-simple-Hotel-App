import React, { useState } from "react";
import { 
  Brush, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Activity,
  BedDouble
} from "lucide-react";
import { Room } from "../types";

interface HousekeepingProps {
  rooms: Room[];
  onUpdateRoomStatus: (roomId: string, status: Room["status"]) => void;
  onAddLog: (type: "Booking" | "Housekeeping" | "System" | "Guest", message: string) => void;
}

export default function Housekeeping({
  rooms,
  onUpdateRoomStatus,
  onAddLog
}: HousekeepingProps) {
  const [filter, setFilter] = useState<string>("Needs Cleaning");

  // Filter calculations
  const filteredRooms = rooms.filter(room => {
    if (filter === "All") return true;
    if (filter === "Needs Cleaning") return room.status === "Cleaning";
    if (filter === "Maintenance") return room.status === "Maintenance";
    if (filter === "Available") return room.status === "Available";
    return true;
  });

  const getStatusBadge = (status: Room["status"]) => {
    switch (status) {
      case "Cleaning":
        return {
          label: "Needs Housekeeping",
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          icon: Brush
        };
      case "Maintenance":
        return {
          label: "Maintenance Required",
          bg: "bg-rose-50 text-rose-800 border-rose-100",
          icon: Wrench
        };
      case "Available":
        return {
          label: "Ready & Clean",
          bg: "bg-slate-950 text-white border-slate-950",
          icon: CheckCircle2
        };
      case "Occupied":
        return {
          label: "Guest Occupied",
          bg: "bg-white text-slate-900 border-slate-300 font-medium",
          icon: BedDouble
        };
    }
  };

  const handleUpdateStatus = (room: Room, nextStatus: Room["status"]) => {
    onUpdateRoomStatus(room.id, nextStatus);
    onAddLog(
      nextStatus === "Available" || nextStatus === "Cleaning" ? "Housekeeping" : "System",
      `Room ${room.roomNumber} housekeeping status updated: changed to ${nextStatus}.`
    );
  };

  // Staff summary list for realism
  const housekeepers = [
    { name: "Elena Rostova", zone: "Floor 1-2 Suites", status: "Active" },
    { name: "Carlos Ortega", zone: "Floor 3 Penthouses", status: "On Break" },
    { name: "Sarah Jenkins", zone: "Floors 1-3 Standard", status: "Active" }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-medium text-3xl tracking-tight text-slate-900">
            Housekeeping Board
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Dispatch cleanings, release ready rooms, and oversee facility maintenance.
          </p>
        </div>

        {/* Dynamic task count indicator */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center gap-3">
          <Brush className="w-5 h-5 text-slate-900" />
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</div>
            <span className="text-xs font-bold text-slate-900">
              {rooms.filter(r => r.status === "Cleaning").length} rooms require cleaning
            </span>
          </div>
        </div>
      </div>

      {/* Grid Layout splits staff list and room checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ROOM CHECKLIST PANEL */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-medium text-base text-slate-900">Room Queue</h3>
              <p className="text-xs text-slate-400 mt-0.5">Filter work queues for available cleaning rosters.</p>
            </div>

            {/* Sub filters */}
            <div className="flex bg-slate-50 border border-slate-200/60 rounded-lg p-1">
              {[
                { id: "Needs Cleaning", label: "Dirty" },
                { id: "Maintenance", label: "Repairs" },
                { id: "Available", label: "Clean / Ready" },
                { id: "All", label: "All Rooms" }
              ].map((tab) => {
                const isActive = filter === tab.id;
                return (
                  <button
                    id={`hk-filter-${tab.id}`}
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`px-3 py-1.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? "bg-white text-slate-900 border border-slate-200/40 shadow-xs" 
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rooms List */}
          <div className="divide-y divide-slate-100 space-y-4">
            {filteredRooms.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium text-xs">
                No rooms matching current queue criteria.
              </div>
            ) : (
              filteredRooms.map((room) => {
                const badge = getStatusBadge(room.status)!;
                const BadgeIcon = badge.icon;

                return (
                  <div key={room.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 first:pt-0 last:pb-0 gap-4">
                    <div className="flex gap-4 items-center">
                      {/* Room icon or circle */}
                      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col items-center justify-center text-slate-700">
                        <span className="font-mono text-xs font-bold leading-none">{room.roomNumber}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-1">{room.type[0]}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">Room {room.roomNumber}</span>
                          <span className="text-xs text-slate-400 font-semibold">Floor {room.floor} • {room.type}</span>
                        </div>
                        <div className={`mt-1.5 inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${badge.bg}`}>
                          <BadgeIcon className="w-3 h-3 flex-shrink-0" />
                          <span>{badge.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Housekeeping state changes buttons */}
                    <div className="flex gap-2 w-full sm:w-auto">
                      {room.status === "Cleaning" && (
                        <>
                          <button
                            id={`hk-clean-${room.roomNumber}`}
                            onClick={() => handleUpdateStatus(room, "Available")}
                            className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Clean</span>
                          </button>
                          <button
                            id={`hk-maintenance-${room.roomNumber}`}
                            onClick={() => handleUpdateStatus(room, "Maintenance")}
                            className="flex-1 sm:flex-none text-slate-600 hover:bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Request Maintenance</span>
                          </button>
                        </>
                      )}

                      {room.status === "Maintenance" && (
                        <button
                          id={`hk-repair-done-${room.roomNumber}`}
                          onClick={() => handleUpdateStatus(room, "Cleaning")}
                          className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Brush className="w-3.5 h-3.5" />
                          <span>Resolve Repairs (Needs Cleaning)</span>
                        </button>
                      )}

                      {room.status === "Available" && (
                        <button
                          id={`hk-reclean-${room.roomNumber}`}
                          onClick={() => handleUpdateStatus(room, "Cleaning")}
                          className="flex-1 sm:flex-none text-slate-600 hover:bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Brush className="w-3.5 h-3.5" />
                          <span>Set Dirty</span>
                        </button>
                      )}

                      {room.status === "Occupied" && (
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                          Guest in room
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* STAFF DIRECTORY & PERFORMANCE */}
        <div className="lg:col-span-1 bg-white border border-slate-200/80 p-6 rounded-xl space-y-6">
          <div>
            <h3 className="font-display font-medium text-base text-slate-900">Housekeeping Staff</h3>
            <p className="text-xs text-slate-400 mt-0.5">Staff on shift for cleaning schedules.</p>
          </div>

          <div className="space-y-4">
            {housekeepers.map((hk, index) => (
              <div key={index} className="flex justify-between items-center bg-slate-50/50 border border-slate-200/60 p-3.5 rounded-lg text-xs">
                <div className="flex gap-2.5 items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs font-display">
                    {hk.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{hk.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{hk.zone}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold ${
                  hk.status === "Active" ? "bg-slate-900 text-white" : "bg-slate-200/60 text-slate-500"
                }`}>
                  {hk.status}
                </span>
              </div>
            ))}
          </div>

          {/* Guidelines Callout card */}
          <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-lg text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
              <Activity className="w-4 h-4 text-slate-900" />
              <span>Standard Room Turn Times</span>
            </div>
            <p className="leading-relaxed">
              Daily Cleanings must be fully resolved under 20 minutes. Checkout cleanings allow up to 45 minutes for deep sterilization and amenity replenishing. Set room statuses accordingly.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

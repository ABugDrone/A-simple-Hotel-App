import React, { useState } from "react";
import { 
  BedDouble, 
  CircleDot, 
  Coffee, 
  Tv, 
  Wifi, 
  Compass, 
  Plus, 
  DollarSign, 
  Wrench, 
  Brush, 
  Check, 
  Clock, 
  AlertTriangle,
  Receipt,
  CreditCard,
  PlusCircle
} from "lucide-react";
import { Room, Booking, Guest } from "../types";

interface RoomsProps {
  rooms: Room[];
  bookings: Booking[];
  guests: Guest[];
  onUpdateRoom: (roomId: string, updatedRoom: Partial<Room>) => void;
  onUpdateBooking: (bookingId: string, updatedFields: Partial<Booking>) => void;
  onUpdateGuest: (guestId: string, updatedFields: Partial<Guest>) => void;
  onAddLog: (type: "Booking" | "Housekeeping" | "System" | "Guest", message: string) => void;
  onGuestClick: (guest: Guest) => void;
}

export default function Rooms({ 
  rooms, 
  bookings, 
  guests,
  onUpdateRoom, 
  onUpdateBooking,
  onUpdateGuest,
  onAddLog,
  onGuestClick
}: RoomsProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);
  const [newPrice, setNewPrice] = useState<number>(0);

  // Modal active tab state
  const [modalTab, setModalTab] = useState<"info" | "folio" | "debt">("info");

  // Debt pay states
  const [modalDebtPayAmount, setModalDebtPayAmount] = useState<string>("");
  const [modalDebtPayMethod, setModalDebtPayMethod] = useState<string>("Card");
  const [modalSelectedGuestId, setModalSelectedGuestId] = useState<string>("");

  // Billing states
  const [chargeDesc, setChargeDesc] = useState<string>("");
  const [chargeAmount, setChargeAmount] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Card");

  // Filter logic
  const filteredRooms = rooms.filter(room => {
    if (selectedFilter === "All") return true;
    return room.status === selectedFilter;
  });

  const handleOpenRoomModal = (room: Room) => {
    setSelectedRoom(room);
    setNewPrice(room.price);
    setIsEditingPrice(false);
    setModalTab("info");
    setModalDebtPayAmount("");
    setModalSelectedGuestId("");
  };

  const handleUpdateStatus = (status: Room["status"]) => {
    if (!selectedRoom) return;
    
    onUpdateRoom(selectedRoom.id, { status });
    onAddLog(
      status === "Cleaning" || status === "Available" ? "Housekeeping" : "System",
      `Room ${selectedRoom.roomNumber} status updated to ${status}.`
    );

    // Update local modal state
    setSelectedRoom(prev => prev ? { ...prev, status } : null);
  };

  const handleSavePrice = () => {
    if (!selectedRoom || newPrice <= 0) return;

    onUpdateRoom(selectedRoom.id, { price: newPrice });
    onAddLog("System", `Room ${selectedRoom.roomNumber} standard rate updated from ₦${selectedRoom.price} to ₦${newPrice}.`);
    
    setSelectedRoom(prev => prev ? { ...prev, price: newPrice } : null);
    setIsEditingPrice(false);
  };

  // Get active booking for a room if Occupied
  const getActiveBooking = (roomId: string) => {
    return bookings.find(b => b.roomId === roomId && b.status === "Checked In");
  };

  const getAmenityIcon = (amenityName: string) => {
    const lowercase = amenityName.toLowerCase();
    if (lowercase.includes("wi-fi") || lowercase.includes("internet")) return <Wifi className="w-4 h-4 text-slate-400" />;
    if (lowercase.includes("coffee") || lowercase.includes("espresso")) return <Coffee className="w-4 h-4 text-slate-400" />;
    if (lowercase.includes("tv")) return <Tv className="w-4 h-4 text-slate-400" />;
    if (lowercase.includes("balcony") || lowercase.includes("view")) return <Compass className="w-4 h-4 text-slate-400" />;
    return <CircleDot className="w-4 h-4 text-slate-400" />;
  };

  const statusOptions: { value: Room["status"]; label: string; bg: string; text: string; icon: any }[] = [
    { value: "Available", label: "Available / Clean", bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", icon: Check },
    { value: "Occupied", label: "Occupied", bg: "bg-blue-50 border-blue-100", text: "text-blue-700", icon: BedDouble },
    { value: "Cleaning", label: "Housekeeping Needed", bg: "bg-amber-50 border-amber-100", text: "text-amber-700", icon: Brush },
    { value: "Maintenance", label: "Maintenance Mode", bg: "bg-rose-50 border-rose-100", text: "text-rose-700", icon: Wrench },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-medium text-3xl tracking-tight text-slate-900">
            Rooms & Suites
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time occupancy status, amenity configs, and price management.
          </p>
        </div>

        {/* Quick legend info */}
        <div className="flex items-center gap-4 bg-white border border-slate-200/80 px-4 py-2.5 rounded-lg text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span>Cleaning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/60 pb-5">
        {["All", "Available", "Occupied", "Cleaning", "Maintenance"].map((tab) => {
          const isActive = selectedFilter === tab;
          const count = tab === "All" ? rooms.length : rooms.filter(r => r.status === tab).length;

          return (
            <button
              id={`room-tab-${tab}`}
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                isActive 
                  ? "bg-slate-900 border-slate-900 text-white shadow-xs" 
                  : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab}
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Rooms Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => {
          const activeBooking = getActiveBooking(room.id);
          
          let cardBorder = "border-slate-200/80";
          let badgeBg = "bg-slate-50 text-slate-700 border-slate-200/40";
          let badgeDot = "bg-slate-400";

          if (room.status === "Available") {
            badgeBg = "bg-slate-50 text-slate-700 border-slate-200/50";
            badgeDot = "bg-slate-500";
          } else if (room.status === "Occupied") {
            badgeBg = "bg-slate-950 text-white border-slate-950";
            badgeDot = "bg-white";
            cardBorder = "border-slate-300";
          } else if (room.status === "Cleaning") {
            badgeBg = "bg-slate-100 text-slate-700 border-slate-200/60";
            badgeDot = "bg-slate-400";
          } else if (room.status === "Maintenance") {
            badgeBg = "bg-rose-50 text-rose-800 border-rose-100";
            badgeDot = "bg-rose-400";
          }

          return (
            <div
              id={`room-card-${room.roomNumber}`}
              key={room.id}
              onClick={() => handleOpenRoomModal(room)}
              className={`bg-white border rounded-xl p-5 shadow-xs hover:border-slate-900 transition-all cursor-pointer flex flex-col justify-between group ${cardBorder}`}
            >
              <div className="space-y-4">
                {/* Header: Room # and Status Badge */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-mono text-lg font-bold text-slate-900 leading-none">
                      {room.roomNumber}
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold mt-1 inline-block uppercase tracking-wider">
                      {room.type}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1.5 ${badgeBg}`}>
                    <span className={`w-1 h-1 rounded-full ${badgeDot}`} />
                    {room.status}
                  </span>
                </div>

                {/* Main: Price and Occupancy */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Standard Rate</span>
                    <span className="text-lg font-display font-medium text-slate-900">₦{room.price}<span className="text-xs font-normal text-slate-400">/night</span></span>
                  </div>
                </div>

                {/* Amenities List */}
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities.slice(0, 3).map((amenity, index) => (
                      <div key={index} className="flex items-center gap-1 bg-slate-50 border border-slate-200/40 px-2 py-0.5 rounded text-[9px] font-medium text-slate-500">
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                    {room.amenities.length > 3 && (
                      <span className="text-[9px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        +{room.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Guest check-in context if occupied */}
              {room.status === "Occupied" && activeBooking && (() => {
                const totalRoomCharge = activeBooking.totalPrice;
                const totalExtra = (activeBooking.extraCharges || []).reduce((sum, item) => sum + item.amount, 0);
                const totalPaid = (activeBooking.payments || []).reduce((sum, item) => sum + item.amount, 0);
                const balance = totalRoomCharge + totalExtra - totalPaid;

                return (
                  <div className="mt-4 bg-slate-50 border border-slate-200/60 p-3.5 rounded-lg text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[120px]" title={activeBooking.guestName}>
                        {activeBooking.guestName}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200/60 text-slate-700 rounded font-mono">
                        {activeBooking.id}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                      <div>
                        <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Stay Dates</span>
                        <div className="font-medium text-slate-800 font-mono truncate">{activeBooking.checkInDate} to {activeBooking.checkOutDate}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Outstanding</span>
                        <div className={`font-bold font-mono ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          ₦{balance.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {room.status === "Cleaning" && (
                <div className="mt-4 bg-slate-50 border border-slate-200/50 p-3 rounded-lg text-xs text-slate-700 flex items-center gap-2">
                  <Brush className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="truncate font-semibold uppercase tracking-wider text-[10px]">Housekeeping Required</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Room Details Modal */}
      {selectedRoom && (
        <div id="room-detail-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-white">
              <div>
                <h2 className="font-mono text-2xl font-bold text-slate-900">
                  Room {selectedRoom.roomNumber}
                </h2>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                  Floor {selectedRoom.floor} • {selectedRoom.type} Suite
                </p>
              </div>
              <button 
                id="btn-close-room-modal"
                onClick={() => setSelectedRoom(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Sticky Tabs Bar */}
            <div className="flex border-b border-slate-100 px-6 bg-slate-50/50">
              <button
                onClick={() => setModalTab("info")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  modalTab === "info"
                    ? "border-slate-900 text-slate-900 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
                }`}
              >
                Room Status
              </button>
              {selectedRoom.status === "Occupied" && (
                <button
                  onClick={() => setModalTab("folio")}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    modalTab === "folio"
                      ? "border-slate-900 text-slate-900 font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
                  }`}
                >
                  Active Folio
                </button>
              )}
              <button
                onClick={() => setModalTab("debt")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  modalTab === "debt"
                    ? "border-slate-900 text-slate-900 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-600 font-medium"
                }`}
              >
                Previous Stay Debt
              </button>
            </div>

            {/* Modal Content Container */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* TAB 1: INFO & STATUS */}
              {modalTab === "info" && (
                <>
                  {/* Dynamic Price Editor */}
                  <div className="space-y-2 bg-slate-50 border border-slate-200/60 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nightly Rate</span>
                      {!isEditingPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-display font-medium text-slate-900">₦{selectedRoom.price}</span>
                          <button 
                            id="btn-edit-room-price"
                            onClick={() => {
                              setNewPrice(selectedRoom.price);
                              setIsEditingPrice(true);
                            }}
                            className="text-xs text-slate-900 hover:underline font-semibold"
                          >
                            Adjust Rate
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="relative rounded-lg shadow-xs w-24">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                              <span className="text-slate-500 text-xs font-semibold">₦</span>
                            </div>
                            <input
                              id="input-room-price"
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(Number(e.target.value))}
                              className="block w-full rounded-lg border border-slate-300 py-1 pl-6 pr-2 text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 font-bold text-slate-800"
                            />
                          </div>
                          <button 
                            id="btn-save-room-price"
                            onClick={handleSavePrice}
                            className="bg-slate-900 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-slate-800"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setIsEditingPrice(false)}
                            className="text-xs text-slate-500 hover:underline font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Status Selectors */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Set Operational Status</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {statusOptions.map((opt) => {
                        const isSelected = selectedRoom.status === opt.value;
                        const OptIcon = opt.icon;
                        return (
                          <button
                            id={`btn-set-status-${opt.value}`}
                            key={opt.value}
                            onClick={() => handleUpdateStatus(opt.value)}
                            className={`p-3.5 rounded-lg border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                              isSelected 
                                ? "bg-slate-900 border-slate-900 text-white shadow-xs" 
                                : "bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"
                            }`}
                          >
                            <OptIcon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-xs font-semibold">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amenities listing */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/50 px-3 py-1 rounded text-xs font-semibold text-slate-600">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: ACTIVE RES RESUME (FOLIO) */}
              {modalTab === "folio" && selectedRoom.status === "Occupied" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guest Account & Billing Ledger</h4>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded font-bold">
                      <Receipt className="w-3 h-3" />
                      Active Folio
                    </span>
                  </div>
                  {(() => {
                    const activeBooking = getActiveBooking(selectedRoom.id);
                    if (!activeBooking) return <p className="text-xs text-slate-400">No active reservation logged.</p>;

                    const totalRoomCharge = activeBooking.totalPrice;
                    const extraCharges = activeBooking.extraCharges || [];
                    const payments = activeBooking.payments || [];
                    const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
                    const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
                    const balance = totalRoomCharge + totalExtra - totalPaid;

                    const handlePostCharge = (e: React.FormEvent) => {
                      e.preventDefault();
                      if (!chargeDesc.trim() || !chargeAmount || Number(chargeAmount) <= 0) return;
                      const newCharge = {
                        id: `CHG-${Date.now().toString().slice(-4)}`,
                        description: chargeDesc.trim(),
                        amount: Number(chargeAmount),
                        date: new Date().toISOString().split('T')[0]
                      };
                      const updated = [...extraCharges, newCharge];
                      onUpdateBooking(activeBooking.id, { extraCharges: updated });
                      onAddLog("Guest", `Posted charge of ₦${newCharge.amount} (${newCharge.description}) to Room ${selectedRoom.roomNumber} folio.`);
                      setChargeDesc("");
                      setChargeAmount("");
                    };

                    const handlePostPayment = (e: React.FormEvent) => {
                      e.preventDefault();
                      if (!paymentAmount || Number(paymentAmount) <= 0) return;
                      const newPayment = {
                        id: `PAY-${Date.now().toString().slice(-4)}`,
                        amount: Number(paymentAmount),
                        method: paymentMethod,
                        date: new Date().toISOString().split('T')[0]
                      };
                      const updated = [...payments, newPayment];
                      onUpdateBooking(activeBooking.id, { payments: updated });
                      onAddLog("Guest", `Recorded payment of ₦${newPayment.amount} via ${newPayment.method} for Room ${selectedRoom.roomNumber} folio.`);
                      setPaymentAmount("");
                    };

                    return (
                      <div className="space-y-4">
                        {/* Guest Meta Card */}
                        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Registered Guest</p>
                              <p className="text-sm font-bold text-slate-900 mt-0.5">{activeBooking.guestName}</p>
                            </div>
                            <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 bg-white text-slate-700 rounded border border-slate-200">
                              {activeBooking.id}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs pt-2.5 border-t border-slate-200/60">
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Check-In</span>
                              <p className="font-semibold text-slate-800 font-mono mt-0.5">{activeBooking.checkInDate}</p>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Check-Out</span>
                              <p className="font-semibold text-slate-800 font-mono mt-0.5">{activeBooking.checkOutDate}</p>
                            </div>
                          </div>
                        </div>

                        {/* Folio Ledger Summary */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200/60 p-3 rounded-lg text-center">
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase font-bold">Room Charges</span>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">₦{(totalRoomCharge + totalExtra).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase font-bold">Total Paid</span>
                            <p className="text-xs font-bold text-emerald-600 mt-0.5">₦{totalPaid.toLocaleString()}</p>
                          </div>
                          <div className="border-l border-slate-200">
                            <span className="text-[8px] text-slate-400 uppercase font-bold">Balance Due</span>
                            <p className={`text-xs font-black mt-0.5 ${balance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                              ₦{balance.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Itemized charges / payments list */}
                        <div className="border border-slate-200/80 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 px-3 py-2 border-b border-slate-200/60 flex justify-between items-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Folio Itemization</span>
                            <span className="text-[9px] text-slate-400 font-semibold">{1 + extraCharges.length + payments.length} transactions</span>
                          </div>
                          <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 text-xs">
                            {/* Base room charge */}
                            <div className="p-3 flex justify-between items-center hover:bg-slate-50/40">
                              <div>
                                <p className="font-semibold text-slate-800">Base Lodging Fee</p>
                                <p className="text-[9px] text-slate-400 font-mono">{activeBooking.checkInDate} (Nights base rent)</p>
                              </div>
                              <span className="font-bold font-mono text-slate-900">₦{totalRoomCharge.toLocaleString()}</span>
                            </div>

                            {/* Extra charges */}
                            {extraCharges.map((item) => (
                              <div key={item.id} className="p-3 flex justify-between items-center hover:bg-slate-50/40 bg-rose-50/10">
                                <div>
                                  <p className="font-semibold text-slate-800 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    {item.description}
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-mono">{item.date} • {item.id}</p>
                                </div>
                                <span className="font-bold font-mono text-slate-900">₦{item.amount.toLocaleString()}</span>
                              </div>
                            ))}

                            {/* Payments */}
                            {payments.map((item) => (
                              <div key={item.id} className="p-3 flex justify-between items-center hover:bg-slate-50/40 bg-emerald-50/10">
                                <div>
                                  <p className="font-semibold text-slate-800 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Payment Recieved ({item.method})
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-mono">{item.date} • {item.id}</p>
                                </div>
                                <span className="font-bold font-mono text-emerald-600">-₦{item.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive billing action forms */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          {/* Post Charge Form */}
                          <form onSubmit={handlePostCharge} className="bg-slate-50 border border-slate-200/60 p-3 rounded-lg space-y-2">
                            <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Post Additional Charge</span>
                            <input
                              id="input-charge-desc"
                              type="text"
                              required
                              placeholder="e.g. Laundry, Spa, Bar"
                              value={chargeDesc}
                              onChange={(e) => setChargeDesc(e.target.value)}
                              className="block w-full rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-800 bg-white"
                            />
                            <div className="flex gap-1.5">
                              <div className="relative flex-1">
                                <span className="absolute left-1.5 inset-y-0 flex items-center text-[10px] font-bold text-slate-400">₦</span>
                                <input
                                  id="input-charge-amount"
                                  type="number"
                                  required
                                  placeholder="Amount"
                                  value={chargeAmount}
                                  onChange={(e) => setChargeAmount(e.target.value)}
                                  className="block w-full rounded border border-slate-200 pl-4 pr-1 py-1 text-[11px] text-slate-800 bg-white font-mono"
                                />
                              </div>
                              <button
                                type="submit"
                                className="bg-slate-900 text-white px-2.5 py-1 rounded text-[10px] font-bold hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                              >
                                <PlusCircle className="w-3 h-3" />
                                <span>Add</span>
                              </button>
                            </div>
                          </form>

                          {/* Record Payment Form */}
                          <form onSubmit={handlePostPayment} className="bg-slate-50 border border-slate-200/60 p-3 rounded-lg space-y-2">
                            <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Record Guest Payment</span>
                            <select
                              id="select-payment-method"
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="block w-full rounded border border-slate-200 px-1.5 py-1 text-[11px] text-slate-800 bg-white"
                            >
                              <option value="Card">Visa / MasterCard</option>
                              <option value="Cash">Cash Deposit</option>
                              <option value="Transfer">Bank Wire Transfer</option>
                            </select>
                            <div className="flex gap-1.5">
                              <div className="relative flex-1">
                                <span className="absolute left-1.5 inset-y-0 flex items-center text-[10px] font-bold text-slate-400">₦</span>
                                <input
                                  id="input-payment-amount"
                                  type="number"
                                  required
                                  placeholder="Amount"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                  className="block w-full rounded border border-slate-200 pl-4 pr-1 py-1 text-[11px] text-slate-800 bg-white font-mono"
                                />
                              </div>
                              <button
                                type="submit"
                                className="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Pay</span>
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 3: PREVIOUS STAY DEBT TAB */}
              {modalTab === "debt" && (
                <div className="space-y-6">
                  {(() => {
                    const activeBooking = getActiveBooking(selectedRoom.id);
                    const activeGuest = activeBooking ? guests.find(g => g.id === activeBooking.guestId) : null;
                    const debtorsList = guests.filter(g => (g.debt || 0) > 0);

                    const handleActiveGuestDebtPaySubmit = (e: React.FormEvent) => {
                      e.preventDefault();
                      if (!activeGuest || !modalDebtPayAmount || Number(modalDebtPayAmount) <= 0) return;
                      const amount = Number(modalDebtPayAmount);
                      const currentDebt = activeGuest.debt || 0;
                      const newDebt = Math.max(0, currentDebt - amount);

                      onUpdateGuest(activeGuest.id, {
                        debt: newDebt,
                        totalSpend: activeGuest.totalSpend + amount
                      });

                      onAddLog("Guest", `Recorded debt payment of ₦${amount.toLocaleString()} via ${modalDebtPayMethod} for Guest ${activeGuest.name} (Room ${selectedRoom.roomNumber} previous stay). Debt reduced to ₦${newDebt.toLocaleString()}.`);
                      setModalDebtPayAmount("");
                    };

                    const handleGeneralGuestDebtPaySubmit = (e: React.FormEvent) => {
                      e.preventDefault();
                      if (!modalSelectedGuestId || !modalDebtPayAmount || Number(modalDebtPayAmount) <= 0) return;
                      const targetGuest = guests.find(g => g.id === modalSelectedGuestId);
                      if (!targetGuest) return;
                      const amount = Number(modalDebtPayAmount);
                      const currentDebt = targetGuest.debt || 0;
                      const newDebt = Math.max(0, currentDebt - amount);

                      onUpdateGuest(targetGuest.id, {
                        debt: newDebt,
                        totalSpend: targetGuest.totalSpend + amount
                      });

                      onAddLog("Guest", `Recorded debt payment of ₦${amount.toLocaleString()} via ${modalDebtPayMethod} for Guest ${targetGuest.name} (linked via Room ${selectedRoom.roomNumber} portal). Debt reduced to ₦${newDebt.toLocaleString()}.`);
                      setModalDebtPayAmount("");
                      setModalSelectedGuestId("");
                    };

                    return (
                      <div className="space-y-4">
                        {activeGuest ? (
                          <div className="space-y-4">
                            <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg space-y-3">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Current Room Occupant</span>
                              <div className="flex justify-between items-center">
                                <p className="text-sm font-bold text-slate-900">{activeGuest.name}</p>
                                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {activeGuest.id}
                                </span>
                              </div>

                              {(activeGuest.debt || 0) > 0 ? (
                                <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-lg flex items-start gap-2.5">
                                  <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                                  <div className="space-y-1">
                                    <p className="text-xs font-bold text-rose-800">Unpaid Balance from Previous Stays</p>
                                    <p className="text-xl font-mono font-black text-rose-600">₦{activeGuest.debt?.toLocaleString()}</p>
                                    <p className="text-[10px] text-rose-700 leading-relaxed">
                                      This guest has an outstanding debt. Settle the balance using the form below.
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-lg flex items-start gap-2.5">
                                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-emerald-800">Account in Good Standing</p>
                                    <p className="text-xs text-emerald-700">This guest has zero previous stay debt.</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {(activeGuest.debt || 0) > 0 && (
                              <form onSubmit={handleActiveGuestDebtPaySubmit} className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg space-y-3">
                                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Record Debt Settle Payment</span>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Pay Amount</label>
                                    <div className="relative">
                                      <span className="absolute left-2 inset-y-0 flex items-center text-[10px] font-bold text-slate-400">₦</span>
                                      <input
                                        id="input-room-debt-pay-amount"
                                        type="number"
                                        required
                                        placeholder="Amount"
                                        value={modalDebtPayAmount}
                                        onChange={(e) => setModalDebtPayAmount(e.target.value)}
                                        className="block w-full rounded border border-slate-200 pl-5 pr-1 py-1.5 text-xs text-slate-800 bg-white font-mono"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Method</label>
                                    <select
                                      id="select-room-debt-pay-method"
                                      value={modalDebtPayMethod}
                                      onChange={(e) => setModalDebtPayMethod(e.target.value)}
                                      className="block w-full rounded border border-slate-200 px-1 py-1.5 text-xs text-slate-800 bg-white font-semibold"
                                    >
                                      <option value="Card">Visa/MasterCard</option>
                                      <option value="Cash">Cash Deposit</option>
                                      <option value="Transfer">Bank Wire</option>
                                    </select>
                                  </div>
                                </div>
                                <button
                                  type="submit"
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Record Debt Settle</span>
                                </button>
                              </form>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg text-center text-slate-500">
                              <p className="text-xs font-semibold">Vacant Room - No active guest profile is loaded.</p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                Search and select any past debtor guest from the ledger below to view or settle their previous stay debt.
                              </p>
                            </div>

                            <form onSubmit={handleGeneralGuestDebtPaySubmit} className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg space-y-3">
                              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">General Settle Form (Vacant Portal)</span>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Select Guest Debt Account</label>
                                <select
                                  id="select-room-vacant-debt-guest"
                                  required
                                  value={modalSelectedGuestId}
                                  onChange={(e) => {
                                    setModalSelectedGuestId(e.target.value);
                                    const tgt = guests.find(g => g.id === e.target.value);
                                    setModalDebtPayAmount(tgt ? (tgt.debt || 0).toString() : "");
                                  }}
                                  className="block w-full text-xs font-semibold rounded border border-slate-200 px-2 py-1.5 bg-white text-slate-700 focus:outline-none"
                                >
                                  <option value="">-- Choose Debtor Profile --</option>
                                  {debtorsList.map(g => (
                                    <option key={g.id} value={g.id}>{g.name} (Owes ₦{g.debt?.toLocaleString()})</option>
                                  ))}
                                </select>
                              </div>

                              {modalSelectedGuestId && (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Pay Amount</label>
                                      <div className="relative">
                                        <span className="absolute left-2 inset-y-0 flex items-center text-[10px] font-bold text-slate-400">₦</span>
                                        <input
                                          id="input-room-vacant-debt-pay"
                                          type="number"
                                          required
                                          placeholder="Amount"
                                          value={modalDebtPayAmount}
                                          onChange={(e) => setModalDebtPayAmount(e.target.value)}
                                          className="block w-full rounded border border-slate-200 pl-5 pr-1 py-1.5 text-xs text-slate-800 bg-white font-mono"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Method</label>
                                      <select
                                        id="select-room-vacant-debt-method"
                                        value={modalDebtPayMethod}
                                        onChange={(e) => setModalDebtPayMethod(e.target.value)}
                                        className="block w-full rounded border border-slate-200 px-1 py-1.5 text-xs text-slate-800 bg-white font-semibold"
                                      >
                                        <option value="Card">Visa/MasterCard</option>
                                        <option value="Cash">Cash Deposit</option>
                                        <option value="Transfer">Bank Wire</option>
                                      </select>
                                    </div>
                                  </div>
                                  <button
                                    type="submit"
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Post Settle Payment</span>
                                  </button>
                                </div>
                              )}
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>

            {/* Close trigger footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                id="btn-room-modal-done"
                onClick={() => setSelectedRoom(null)}
                className="bg-slate-900 text-white px-5 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

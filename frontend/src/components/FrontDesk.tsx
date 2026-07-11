import React, { useState } from "react";
import { 
  CalendarDays, 
  Search, 
  Plus, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  XCircle, 
  DollarSign,
  User,
  BedDouble,
  ChevronRight,
  Info,
  UserCheck,
  UserMinus,
  Receipt,
  CreditCard,
  PlusCircle,
  LogOut,
  ArrowRightLeft,
  UtensilsCrossed,
  Shirt,
  ArrowLeftRight
} from "lucide-react";
import { Booking, Room, Guest } from "../types";
import InvoiceModal from "./InvoiceModal";

interface FrontDeskProps {
  bookings: Booking[];
  rooms: Room[];
  guests: Guest[];
  onAddBooking: (booking: Booking) => void;
  onAddGuest: (guest: Guest) => void;
  onUpdateBookingStatus: (bookingId: string, status: Booking["status"]) => void;
  onUpdateBooking: (bookingId: string, updatedFields: Partial<Booking>) => void;
  onUpdateRoomStatus: (roomId: string, status: Room["status"]) => void;
  onAddLog: (type: "Booking" | "Housekeeping" | "System" | "Guest", message: string) => void;
  onCheckOutBooking: (bookingId: string) => void;
  onUpdateGuest: (guestId: string, updatedFields: Partial<Guest>) => void;
  onGuestClick: (guest: Guest) => void;
  onTransferBookingRoom: (bookingId: string, newRoomId: string) => void;
}

export default function FrontDesk({
  bookings,
  rooms,
  guests,
  onAddBooking,
  onAddGuest,
  onUpdateBookingStatus,
  onUpdateBooking,
  onUpdateRoomStatus,
  onAddLog,
  onCheckOutBooking,
  onUpdateGuest,
  onGuestClick,
  onTransferBookingRoom
}: FrontDeskProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  // Express Check-In & Check-Out Desk states
  const [activeFormTab, setActiveFormTab] = useState<"checkin" | "checkout" | "transfer">("checkin");
  const [isFormPanelOpen, setIsFormPanelOpen] = useState<boolean>(true);
  
  // Express Check-In Form State
  const [expressRoomId, setExpressRoomId] = useState<string>("");
  const [expressGuestSelect, setExpressGuestSelect] = useState<"existing" | "new">("existing");
  const [expressGuestId, setExpressGuestId] = useState<string>("");
  const [expressGuestName, setExpressGuestName] = useState<string>("");
  const [expressGuestEmail, setExpressGuestEmail] = useState<string>("");
  const [expressGuestPhone, setExpressGuestPhone] = useState<string>("");
  const [expressCheckInDate, setExpressCheckInDate] = useState<string>("2026-07-06");
  const [expressCheckOutDate, setExpressCheckOutDate] = useState<string>("2026-07-09");
  const [expressNotes, setExpressNotes] = useState<string>("");

  // Express Check-Out Form State
  const [expressCheckOutRoomId, setExpressCheckOutRoomId] = useState<string>("");
  const [expressPayAmount, setExpressPayAmount] = useState<string>("");
  const [expressPayMethod, setExpressPayMethod] = useState<string>("Card");

  // Quick payment modal states
  const [paymentModalBookingId, setPaymentModalBookingId] = useState<string | null>(null);
  const [quickPayAmount, setQuickPayAmount] = useState<string>("");
  const [quickPayMethod, setQuickPayMethod] = useState<string>("Card");

  // Clickable summary modals state
  const [isDebtsModalOpen, setIsDebtsModalOpen] = useState<boolean>(false);
  const [isActiveUnpaidModalOpen, setIsActiveUnpaidModalOpen] = useState<boolean>(false);

  // Guest statement / Invoice state
  const [isInvoiceOpen, setIsInvoiceOpen] = useState<boolean>(false);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);
  const [invoiceGuest, setInvoiceGuest] = useState<Guest | null>(null);

  // Settle guest debt input states (for checked out guests list)
  const [settleGuestId, setSettleGuestId] = useState<string | null>(null);
  const [settleDebtAmount, setSettleDebtAmount] = useState<string>("");
  const [settleDebtMethod, setSettleDebtMethod] = useState<string>("Card");

  // Kitchen & Laundry department charge states
  const [departmentTab, setDepartmentTab] = useState<"kitchen" | "laundry">("kitchen");
  const [deptChargeBookingId, setDeptChargeBookingId] = useState<string>("");
  const [deptChargeAmount, setDeptChargeAmount] = useState<string>("");
  const [deptChargeDesc, setDeptChargeDesc] = useState<string>("");
  const [deptChargeItem, setDeptChargeItem] = useState<string>("");

  // Calculations for dashboard clickable cards
  const totalOutstandingDebt = guests.reduce((sum, g) => sum + (g.debt || 0), 0);
  const debtGuestsCount = guests.filter(g => (g.debt || 0) > 0).length;

  const activeUnpaidBookings = bookings.filter(b => {
    if (b.status !== "Checked In") return false;
    const totalRoomCharge = b.totalPrice;
    const extraCharges = b.extraCharges || [];
    const payments = b.payments || [];
    const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
    const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
    const outstanding = totalRoomCharge + totalExtra - totalPaid;
    return outstanding > 0;
  });

  const totalActiveUnpaidAmount = activeUnpaidBookings.reduce((sum, b) => {
    const totalRoomCharge = b.totalPrice;
    const extraCharges = b.extraCharges || [];
    const payments = b.payments || [];
    const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
    const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
    const outstanding = totalRoomCharge + totalExtra - totalPaid;
    return sum + outstanding;
  }, 0);
  
  // Booking Wizard states
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedGuestId, setSelectedGuestId] = useState<string>("new");
  
  // New Guest Form states
  const [newGuestName, setNewGuestName] = useState<string>("");
  const [newGuestEmail, setNewGuestEmail] = useState<string>("");
  const [newGuestPhone, setNewGuestPhone] = useState<string>("");
  const [newGuestNotes, setNewGuestNotes] = useState<string>("");
  const [newGuestVip, setNewGuestVip] = useState<boolean>(false);

  // Date selections
  const [checkIn, setCheckIn] = useState<string>("2026-07-06");
  const [checkOut, setCheckOut] = useState<string>("2026-07-09");
  const [bookingNotes, setBookingNotes] = useState<string>("");

  // Search/Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.roomNumber.includes(searchTerm) || 
                          b.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status: Booking["status"]) => {
    switch (status) {
      case "Checked In":
        return "bg-slate-900 text-white border-slate-900";
      case "Checked Out":
        return "bg-slate-50 text-slate-600 border-slate-200/60";
      case "Upcoming":
        return "bg-white text-slate-900 border-slate-300 font-medium";
      case "Cancelled":
        return "bg-rose-50 text-rose-800 border-rose-100";
    }
  };

  // Check-In Action
  const handleCheckIn = (booking: Booking) => {
    onUpdateBookingStatus(booking.id, "Checked In");
    onUpdateRoomStatus(booking.roomId, "Occupied");
    onAddLog("Booking", `Guest ${booking.guestName} successfully checked into Room ${booking.roomNumber}.`);
  };

  // Check-Out Action
  const handleCheckOut = (booking: Booking) => {
    onCheckOutBooking(booking.id);
  };

  // Cancel Booking Action
  const handleCancelBooking = (booking: Booking) => {
    onUpdateBookingStatus(booking.id, "Cancelled");
    onUpdateRoomStatus(booking.roomId, "Available");
    onAddLog("Booking", `Reservation ${booking.id} for ${booking.guestName} has been cancelled.`);
  };

  // Kitchen & Laundry department charge handler
  const handleDeptChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptChargeBookingId || !deptChargeAmount || Number(deptChargeAmount) <= 0 || !deptChargeDesc.trim()) return;

    const booking = bookings.find(b => b.id === deptChargeBookingId);
    if (!booking) return;

    const amount = Number(deptChargeAmount);
    const deptName = departmentTab === "kitchen" ? "Kitchen" : "Laundry";
    const desc = deptChargeDesc.trim();
    const chargeItem = deptChargeItem.trim();

    const newCharge = {
      id: `CHG-${Date.now().toString().slice(-4)}`,
      description: `${deptName}: ${desc}${chargeItem ? ` (${chargeItem})` : ""}`,
      amount,
      date: new Date().toISOString().split("T")[0]
    };

    const currentCharges = booking.extraCharges || [];
    onUpdateBooking(booking.id, {
      extraCharges: [...currentCharges, newCharge]
    });

    onAddLog("System", `${deptName} Department: Posted charge of ₦${amount.toLocaleString()} for "${desc}${chargeItem ? ` - ${chargeItem}` : ""}" to Guest ${booking.guestName} (Room ${booking.roomNumber}).`);

    setDeptChargeBookingId("");
    setDeptChargeAmount("");
    setDeptChargeDesc("");
    setDeptChargeItem("");
  };

  // Calculate reservation nights
  const calculateNights = (start: string, end: string) => {
    const sDate = new Date(start);
    const eDate = new Date(end);
    const diff = eDate.getTime() - sDate.getTime();
    if (diff <= 0) return 1;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Selected Room detail
  const selectedRoomObj = rooms.find(r => r.id === selectedRoomId);
  const totalCalculatedNights = calculateNights(checkIn, checkOut);
  const calculatedPrice = selectedRoomObj ? selectedRoomObj.price * totalCalculatedNights : 0;

  // Finalize Wizard Booking Submission
  const handleCreateBooking = () => {
    if (!selectedRoomId || (selectedGuestId === "new" && !newGuestName)) return;

    let finalGuestId = selectedGuestId;
    let finalGuestName = "";

    // 1. Create and Register New Guest if needed
    if (selectedGuestId === "new") {
      const gId = `G-${Date.now().toString().slice(-4)}`;
      const newGuest: Guest = {
        id: gId,
        name: newGuestName,
        email: newGuestEmail || "no-email@amirablesuite.com",
        phone: newGuestPhone || "N/A",
        vipStatus: newGuestVip,
        notes: newGuestNotes,
        visitCount: 1,
        totalSpend: calculatedPrice
      };
      onAddGuest(newGuest);
      finalGuestId = gId;
      finalGuestName = newGuestName;
      onAddLog("Guest", `New guest profile ${newGuest.name} (${gId}) created during registration.`);
    } else {
      const existingGuest = guests.find(g => g.id === selectedGuestId);
      finalGuestName = existingGuest ? existingGuest.name : "Unknown Guest";
    }

    // 2. Build booking object
    const bookingId = `B-${Date.now().toString().slice(-4)}`;
    const targetRoom = rooms.find(r => r.id === selectedRoomId)!;
    
    const newBooking: Booking = {
      id: bookingId,
      roomId: selectedRoomId,
      roomNumber: targetRoom.roomNumber,
      guestId: finalGuestId,
      guestName: finalGuestName,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      status: "Upcoming",
      totalPrice: calculatedPrice,
      notes: bookingNotes
    };

    onAddBooking(newBooking);
    onAddLog("Booking", `New Booking ${bookingId} registered for ${finalGuestName} in Room ${targetRoom.roomNumber} (Dates: ${checkIn} to ${checkOut}).`);

    // Reset wizard states
    setIsWizardOpen(false);
    setWizardStep(1);
    setSelectedRoomId("");
    setSelectedGuestId("new");
    setNewGuestName("");
    setNewGuestEmail("");
    setNewGuestPhone("");
    setNewGuestNotes("");
    setNewGuestVip(false);
    setBookingNotes("");
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Frontdesk Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-medium text-3xl tracking-tight text-slate-900">
            Front Desk Operations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor arrivals, check-in guests, handle billing, and coordinate schedules.
          </p>
        </div>

        {/* Wizard trigger */}
        <button
          id="btn-open-booking-wizard"
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Clickable KPI Metrics Cards for Debts and Unpaid Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Total Outstanding Debts (Checked Out) */}
        <button
          id="btn-metric-outstanding-debts"
          onClick={() => setIsDebtsModalOpen(true)}
          className="bg-white border border-slate-200/80 hover:border-slate-300 p-6 rounded-xl shadow-xs transition-all text-left flex items-start gap-4 cursor-pointer group"
        >
          <div className="p-3 bg-rose-50 border border-rose-100/50 rounded-lg text-rose-600 group-hover:bg-rose-100/40 transition-colors">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Outstanding Debts (Checked Out)</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-display font-medium text-slate-900">₦{totalOutstandingDebt.toLocaleString()}</span>
              <span className="text-xs text-rose-500 font-semibold bg-rose-50 border border-rose-100/30 px-1.5 py-0.5 rounded">
                {debtGuestsCount} Guest Accounts
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium group-hover:text-slate-500 transition-all">
              Click to view unpaid past-guest invoices & settle debt accounts →
            </p>
          </div>
        </button>

        {/* Card 2: Active Unpaid Accounts (Checked In) */}
        <button
          id="btn-metric-active-unpaid"
          onClick={() => setIsActiveUnpaidModalOpen(true)}
          className="bg-white border border-slate-200/80 hover:border-slate-300 p-6 rounded-xl shadow-xs transition-all text-left flex items-start gap-4 cursor-pointer group"
        >
          <div className="p-3 bg-amber-50 border border-amber-100/50 rounded-lg text-amber-600 group-hover:bg-amber-100/40 transition-colors">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Unpaid Accounts (Checked In)</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-display font-medium text-slate-900">₦{totalActiveUnpaidAmount.toLocaleString()}</span>
              <span className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-100/30 px-1.5 py-0.5 rounded">
                {activeUnpaidBookings.length} Active Stays
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium group-hover:text-slate-500 transition-all">
              Click to monitor current room folios & post stay payments →
            </p>
          </div>
        </button>
      </div>

      {/* Express Check-In & Check-Out Forms Panel */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <ArrowRightLeft className="w-5 h-5 text-slate-800" />
            <div>
              <h2 className="font-display font-medium text-slate-900 text-sm">Express Reception Desk</h2>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Quickly register arrivals or settle departures and payments</p>
            </div>
          </div>
          <button
            id="btn-toggle-express-panel"
            onClick={() => setIsFormPanelOpen(!isFormPanelOpen)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-all"
          >
            {isFormPanelOpen ? "Collapse Desk" : "Expand Desk"}
          </button>
        </div>

        {isFormPanelOpen && (
          <div className="p-6 space-y-6">
            {/* Tab Selection */}
            <div className="flex border-b border-slate-100 pb-4">
              <button
                id="btn-express-tab-checkin"
                onClick={() => setActiveFormTab("checkin")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer mr-2 ${
                  activeFormTab === "checkin"
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Guest Check-In Form</span>
              </button>
              <button
                id="btn-express-tab-checkout"
                onClick={() => setActiveFormTab("checkout")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  activeFormTab === "checkout"
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <UserMinus className="w-4 h-4" />
                <span>Guest Check-Out Form</span>
              </button>
              <button
                id="btn-express-tab-transfer"
                onClick={() => setActiveFormTab("transfer")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ml-2 ${
                  activeFormTab === "transfer"
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Room Transfer</span>
              </button>
            </div>

            {/* TAB CONTENT: EXPRESS CHECK-IN FORM */}
            {activeFormTab === "checkin" && (() => {
              // Get available rooms
              const availableRooms = rooms.filter(r => r.status === "Available");

              const handleExpressCheckInSubmit = (e: React.FormEvent) => {
                e.preventDefault();
                if (!expressRoomId) return;

                let guestIdToUse = expressGuestId;
                let guestNameToUse = "";

                if (expressGuestSelect === "new") {
                  if (!expressGuestName.trim()) return;
                  const newGId = `G-${Date.now().toString().slice(-4)}`;
                  const newG: Guest = {
                    id: newGId,
                    name: expressGuestName.trim(),
                    email: expressGuestEmail.trim() || "no-email@amirablesuite.com",
                    phone: expressGuestPhone.trim() || "N/A",
                    vipStatus: false,
                    notes: expressNotes || "",
                    visitCount: 1,
                    totalSpend: 0
                  };
                  onAddGuest(newG);
                  guestIdToUse = newGId;
                  guestNameToUse = expressGuestName.trim();
                  onAddLog("Guest", `New guest profile ${newG.name} created during express check-in.`);
                } else {
                  const existingGuest = guests.find(g => g.id === expressGuestId);
                  if (!existingGuest) {
                    return;
                  }
                  guestNameToUse = existingGuest.name;
                }

                // Create active Checked-In booking
                const bId = `B-${Date.now().toString().slice(-4)}`;
                const targetRoom = rooms.find(r => r.id === expressRoomId)!;
                const nights = calculateNights(expressCheckInDate, expressCheckOutDate);
                const totalPrice = targetRoom.price * nights;

                const newBooking: Booking = {
                  id: bId,
                  roomId: expressRoomId,
                  roomNumber: targetRoom.roomNumber,
                  guestId: guestIdToUse,
                  guestName: guestNameToUse,
                  checkInDate: expressCheckInDate,
                  checkOutDate: expressCheckOutDate,
                  status: "Checked In",
                  totalPrice: totalPrice,
                  notes: expressNotes || "",
                  extraCharges: [],
                  payments: []
                };

                onAddBooking(newBooking);
                onUpdateRoomStatus(expressRoomId, "Occupied");
                onAddLog("Booking", `Express Reception: Guest ${guestNameToUse} checked directly into Room ${targetRoom.roomNumber} for ${nights} nights (Outstanding: ₦${totalPrice}).`);

                // Reset Check-in form state
                setExpressRoomId("");
                setExpressGuestName("");
                setExpressGuestEmail("");
                setExpressGuestPhone("");
                setExpressNotes("");
              };

              // Calculate temporary total
              const selectedRoomObj = rooms.find(r => r.id === expressRoomId);
              const calculatedNights = calculateNights(expressCheckInDate, expressCheckOutDate);
              const estTotal = selectedRoomObj ? selectedRoomObj.price * calculatedNights : 0;

              return (
                <form onSubmit={handleExpressCheckInSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Accommodation & Dates */}
                  <div className="space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      1. Select Room & Dates
                    </h3>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Select Available Room</label>
                      <select
                        id="express-select-room"
                        required
                        value={expressRoomId}
                        onChange={(e) => setExpressRoomId(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-white"
                      >
                        <option value="">-- Choose Vacant Room --</option>
                        {availableRooms.map(r => (
                          <option key={r.id} value={r.id}>Room {r.roomNumber} - {r.type} (₦{r.price}/night)</option>
                        ))}
                      </select>
                      {availableRooms.length === 0 && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1">No rooms are vacant. Settle some guests or clean rooms first.</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Check-In</label>
                        <input
                          id="express-checkin-date"
                          type="date"
                          required
                          value={expressCheckInDate}
                          onChange={(e) => setExpressCheckInDate(e.target.value)}
                          className="block w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Check-Out</label>
                        <input
                          id="express-checkout-date"
                          type="date"
                          required
                          value={expressCheckOutDate}
                          onChange={(e) => setExpressCheckOutDate(e.target.value)}
                          className="block w-full rounded-lg border border-slate-200 px-2 py-2 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Guest Details */}
                  <div className="space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      2. Guest Registration
                    </h3>

                    <div>
                      <div className="flex bg-slate-100 p-0.5 rounded-lg mb-3">
                        <button
                          type="button"
                          onClick={() => setExpressGuestSelect("existing")}
                          className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                            expressGuestSelect === "existing" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"
                          }`}
                        >
                          Existing Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setExpressGuestSelect("new");
                            setExpressGuestId("");
                          }}
                          className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                            expressGuestSelect === "new" ? "bg-white text-slate-900 shadow-xs" : "text-slate-400"
                          }`}
                        >
                          New Guest Profile
                        </button>
                      </div>

                      {expressGuestSelect === "existing" ? (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Associated Guest Profile</label>
                          <select
                            id="express-select-guest"
                            required={expressGuestSelect === "existing"}
                            value={expressGuestId}
                            onChange={(e) => setExpressGuestId(e.target.value)}
                            className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-white"
                          >
                            <option value="">-- Choose Guest Profile --</option>
                            {guests.map(g => (
                              <option key={g.id} value={g.id}>{g.name} ({g.email})</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Full Guest Name</label>
                            <input
                              id="express-guest-name"
                              type="text"
                              required={expressGuestSelect === "new"}
                              placeholder="Eleanor Vance"
                              value={expressGuestName}
                              onChange={(e) => setExpressGuestName(e.target.value)}
                              className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Email</label>
                              <input
                                id="express-guest-email"
                                type="email"
                                placeholder="name@domain.com"
                                value={expressGuestEmail}
                                onChange={(e) => setExpressGuestEmail(e.target.value)}
                                className="block w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Phone</label>
                              <input
                                id="express-guest-phone"
                                type="text"
                                placeholder="+234..."
                                value={expressGuestPhone}
                                onChange={(e) => setExpressGuestPhone(e.target.value)}
                                className="block w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Stay Preferences / Notes</label>
                      <textarea
                        id="express-notes"
                        rows={1}
                        placeholder="preferences, dietary, late checkout terms..."
                        value={expressNotes}
                        onChange={(e) => setExpressNotes(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Column 3: Settle & Submit */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        3. Review & Settle
                      </h3>

                      <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-4 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Lodging rate:</span>
                          <span className="font-semibold text-slate-800">₦{selectedRoomObj?.price.toLocaleString() || 0} / night</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Length of stay:</span>
                          <span className="font-semibold text-slate-800">{calculatedNights} Nights</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                          <span className="font-bold text-slate-900">Total Lodging Fee:</span>
                          <span className="text-xl font-display font-medium text-slate-900">₦{estTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      id="btn-express-checkin-submit"
                      type="submit"
                      disabled={!expressRoomId || (expressGuestSelect === "new" && !expressGuestName) || (expressGuestSelect === "existing" && !expressGuestId)}
                      className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        (!expressRoomId || (expressGuestSelect === "new" && !expressGuestName) || (expressGuestSelect === "existing" && !expressGuestId)) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-white" />
                      <span>Process Direct Check-In</span>
                    </button>
                  </div>
                </form>
              );
            })()}

            {/* TAB CONTENT: EXPRESS CHECK-OUT FORM */}
            {activeFormTab === "checkout" && (() => {
              // Get occupied rooms
              const occupiedRooms = rooms.filter(r => r.status === "Occupied");
              
              // Get active booking details for the selected check-out room
              const activeBooking = bookings.find(b => b.roomId === expressCheckOutRoomId && b.status === "Checked In");

              const handlePostCheckoutPayment = (e: React.FormEvent) => {
                e.preventDefault();
                if (!activeBooking || !expressPayAmount || Number(expressPayAmount) <= 0) return;

                const newPayment = {
                  id: `PAY-${Date.now().toString().slice(-4)}`,
                  amount: Number(expressPayAmount),
                  method: expressPayMethod,
                  date: new Date().toISOString().split('T')[0]
                };

                const currentPayments = activeBooking.payments || [];
                onUpdateBooking(activeBooking.id, { payments: [...currentPayments, newPayment] });
                onAddLog("Guest", `Express Settle: Recorded payment of ₦${newPayment.amount} via ${newPayment.method} for Room ${activeBooking.roomNumber} folio.`);
                setExpressPayAmount("");
              };

              const handleCheckoutAndVacate = () => {
                if (!activeBooking) return;

                onCheckOutBooking(activeBooking.id);

                // Reset Check-out state
                setExpressCheckOutRoomId("");
                setExpressPayAmount("");
              };

              // Compute billing details if active booking exists
              const roomCharge = activeBooking ? activeBooking.totalPrice : 0;
              const extraCharges = activeBooking?.extraCharges || [];
              const payments = activeBooking?.payments || [];
              const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
              const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
              const outstanding = roomCharge + totalExtra - totalPaid;

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Choose Occupied Room */}
                  <div className="space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      1. Select Occupied Room
                    </h3>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Select Occupied Room / Guest</label>
                      <select
                        id="express-checkout-room"
                        value={expressCheckOutRoomId}
                        onChange={(e) => {
                          setExpressCheckOutRoomId(e.target.value);
                          setExpressPayAmount("");
                        }}
                        className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-white"
                      >
                        <option value="">-- Choose Occupied Room --</option>
                        {occupiedRooms.map(r => {
                          const bk = bookings.find(b => b.roomId === r.id && b.status === "Checked In");
                          return (
                            <option key={r.id} value={r.id}>Room {r.roomNumber} - {bk ? bk.guestName : "Unknown Guest"}</option>
                          );
                        })}
                      </select>
                      {occupiedRooms.length === 0 && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1">All suites are currently vacant. No departures scheduled.</p>
                      )}
                    </div>

                    {activeBooking && (
                      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg space-y-1.5 text-xs">
                        <p className="font-bold text-slate-800">Checked In Guest Information</p>
                        <p><span className="text-slate-400 font-medium">Guest:</span> {activeBooking.guestName}</p>
                        <p><span className="text-slate-400 font-medium">Book ID:</span> <span className="font-mono">{activeBooking.id}</span></p>
                        <p><span className="text-slate-400 font-medium">Schedule:</span> <span className="font-mono">{activeBooking.checkInDate} to {activeBooking.checkOutDate}</span></p>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Live Folio & Settlements */}
                  <div className="space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      2. Guest Account Folio
                    </h3>

                    {!activeBooking ? (
                      <p className="text-xs text-slate-400 italic pt-6 text-center">Select an occupied room to load the guest billing ledger and accounts.</p>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary ledger */}
                        <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-center text-xs">
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase font-bold">Total Bill</span>
                            <p className="font-bold text-slate-800 mt-0.5">₦{(roomCharge + totalExtra).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase font-bold">Total Paid</span>
                            <p className="font-bold text-emerald-600 mt-0.5">₦{totalPaid.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase font-bold">Outstanding</span>
                            <p className={`font-black mt-0.5 ${outstanding > 0 ? "text-rose-600" : "text-emerald-700"}`}>₦{outstanding.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* List items */}
                        <div className="border border-slate-200 rounded divide-y divide-slate-100 max-h-32 overflow-y-auto text-[11px] bg-white">
                          <div className="p-2 flex justify-between">
                            <span className="font-semibold text-slate-700">Room Rent ({calculateNights(activeBooking.checkInDate, activeBooking.checkOutDate)} nights)</span>
                            <span className="font-mono text-slate-900">₦{roomCharge.toLocaleString()}</span>
                          </div>
                          {extraCharges.map(item => (
                            <div key={item.id} className="p-2 flex justify-between bg-rose-50/20">
                              <span className="text-slate-600 font-semibold">Post: {item.description}</span>
                              <span className="font-mono text-slate-900">₦{item.amount.toLocaleString()}</span>
                            </div>
                          ))}
                          {payments.map(item => (
                            <div key={item.id} className="p-2 flex justify-between bg-emerald-50/20">
                              <span className="text-emerald-700 font-semibold">Payment: {item.method}</span>
                              <span className="font-mono text-emerald-600">-₦{item.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        {/* Express post payment form */}
                        {outstanding > 0 && (
                          <form onSubmit={handlePostCheckoutPayment} className="bg-slate-50 border border-slate-200/60 p-3 rounded-lg space-y-2">
                            <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Record Settle Payment</span>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-2 inset-y-0 flex items-center text-[10px] font-bold text-slate-400">₦</span>
                                <input
                                  id="input-express-pay"
                                  type="number"
                                  required
                                  placeholder={outstanding.toString()}
                                  value={expressPayAmount}
                                  onChange={(e) => setExpressPayAmount(e.target.value)}
                                  className="block w-full rounded border border-slate-200 pl-4 pr-1 py-1 text-xs text-slate-800 bg-white font-mono"
                                />
                              </div>
                              <select
                                id="select-express-pay-method"
                                value={expressPayMethod}
                                onChange={(e) => setExpressPayMethod(e.target.value)}
                                className="rounded border border-slate-200 px-1.5 py-1 text-[11px] bg-white text-slate-800"
                              >
                                <option value="Card">Card</option>
                                <option value="Cash">Cash</option>
                                <option value="Transfer">Transfer</option>
                              </select>
                              <button type="submit" className="bg-slate-900 text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-slate-800 cursor-pointer">
                                Settle
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Column 3: Settle & checkout action */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        3. Complete Settle & Checkout
                      </h3>

                      <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-4 text-xs space-y-2">
                        <div className="flex justify-between items-baseline pt-1">
                          <span className="font-bold text-slate-800">Balance Status:</span>
                          <span className={`font-mono text-base font-bold ${outstanding > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                            {outstanding > 0 ? `₦${outstanding.toLocaleString()} Due` : "Fully Settled ₦0"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                          Clicking checkout will set the booking to "Checked Out", make Room {activeBooking?.roomNumber || "?"} "Cleaning Needed" (for housekeeping services), and record the transaction.
                        </p>
                      </div>
                    </div>

                    <button
                      id="btn-express-checkout-submit"
                      type="button"
                      disabled={!activeBooking}
                      onClick={handleCheckoutAndVacate}
                      className={`w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        !activeBooking ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <LogOut className="w-4 h-4 text-white" />
                      <span>Process Checkout & Vacate Suite</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* TAB CONTENT: ROOM TRANSFER FORM */}
            {activeFormTab === "transfer" && (() => {
              // Get occupied rooms with active bookings
              const occupiedRooms = rooms.filter(r => r.status === "Occupied");
              const availableRooms = rooms.filter(r => r.status === "Available");

              // Get active booking for selected room
              const transferActiveBooking = bookings.find(b => b.roomId === expressCheckOutRoomId && b.status === "Checked In");
              const transferCurrentRoom = rooms.find(r => r.id === expressCheckOutRoomId);
              const transferNewRoom = rooms.find(r => r.id === transferNewRoomId);

              const handleTransferSubmit = () => {
                if (!transferActiveBooking || !transferNewRoomId) return;
                
                onTransferBookingRoom(transferActiveBooking.id, transferNewRoomId);
                
                // Reset transfer state
                setExpressCheckOutRoomId("");
                setTransferNewRoomId("");
              };

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Select Occupied Room */}
                  <div className="space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      1. Select Current Occupied Room
                    </h3>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Select Guest Room to Transfer</label>
                      <select
                        id="transfer-select-current-room"
                        value={expressCheckOutRoomId}
                        onChange={(e) => {
                          setExpressCheckOutRoomId(e.target.value);
                          setTransferNewRoomId("");
                        }}
                        className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-white"
                      >
                        <option value="">-- Choose Occupied Room --</option>
                        {occupiedRooms.map(r => {
                          const bk = bookings.find(b => b.roomId === r.id && b.status === "Checked In");
                          return (
                            <option key={r.id} value={r.id}>Room {r.roomNumber} - {bk ? bk.guestName : "Unknown Guest"}</option>
                          );
                        })}
                      </select>
                      {occupiedRooms.length === 0 && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1">No occupied rooms available for transfer.</p>
                      )}
                    </div>

                    {transferActiveBooking && transferCurrentRoom && (
                      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg space-y-1.5 text-xs">
                        <p className="font-bold text-slate-800">Current Booking Info</p>
                        <p><span className="text-slate-400 font-medium">Guest:</span> {transferActiveBooking.guestName}</p>
                        <p><span className="text-slate-400 font-medium">Room:</span> Room {transferCurrentRoom.roomNumber} ({transferCurrentRoom.type})</p>
                        <p><span className="text-slate-400 font-medium">Rate:</span> ₦{transferCurrentRoom.price.toLocaleString()}/night</p>
                        <p><span className="text-slate-400 font-medium">Schedule:</span> <span className="font-mono">{transferActiveBooking.checkInDate} to {transferActiveBooking.checkOutDate}</span></p>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Select New Room */}
                  <div className="space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      2. Select New Available Room
                    </h3>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Choose Destination Room</label>
                      <select
                        id="transfer-select-new-room"
                        value={transferNewRoomId}
                        onChange={(e) => setTransferNewRoomId(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-white"
                      >
                        <option value="">-- Choose Available Room --</option>
                        {availableRooms.filter(r => r.id !== expressCheckOutRoomId).map(r => (
                          <option key={r.id} value={r.id}>Room {r.roomNumber} - {r.type} (₦{r.price.toLocaleString()}/night)</option>
                        ))}
                      </select>
                      {availableRooms.filter(r => r.id !== expressCheckOutRoomId).length === 0 && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1">No other rooms available for transfer.</p>
                      )}
                    </div>

                    {transferNewRoom && (
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg space-y-1.5 text-xs">
                        <p className="font-bold text-blue-800">New Room Details</p>
                        <p><span className="text-slate-600 font-medium">Room:</span> Room {transferNewRoom.roomNumber}</p>
                        <p><span className="text-slate-600 font-medium">Type:</span> {transferNewRoom.type}</p>
                        <p><span className="text-slate-600 font-medium">Rate:</span> ₦{transferNewRoom.price.toLocaleString()}/night</p>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Transfer Summary & Submit */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        3. Transfer Summary
                      </h3>

                      <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-4 space-y-3 text-xs">
                        {transferActiveBooking && transferCurrentRoom && transferNewRoom ? (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="text-center">
                                <span className="text-[9px] text-slate-400 uppercase font-bold">From</span>
                                <p className="font-bold text-slate-900">Room {transferCurrentRoom.roomNumber}</p>
                                <p className="text-[10px] text-slate-500">₦{transferCurrentRoom.price.toLocaleString()}/n</p>
                              </div>
                              <ArrowLeftRight className="w-5 h-5 text-blue-500" />
                              <div className="text-center">
                                <span className="text-[9px] text-slate-400 uppercase font-bold">To</span>
                                <p className="font-bold text-blue-600">Room {transferNewRoom.roomNumber}</p>
                                <p className="text-[10px] text-blue-500">₦{transferNewRoom.price.toLocaleString()}/n</p>
                              </div>
                            </div>
                            
                            {transferCurrentRoom.price !== transferNewRoom.price && (
                              <div className="bg-amber-50 border border-amber-100 p-2 rounded text-[10px] text-amber-700 font-semibold">
                                Rate difference: {transferNewRoom.price > transferCurrentRoom.price ? "+" : ""}₦{(transferNewRoom.price - transferCurrentRoom.price).toLocaleString()}/night
                              </div>
                            )}

                            <div className="border-t border-slate-200 pt-2">
                              <p className="text-[10px] text-slate-400">
                                Guest {transferActiveBooking.guestName} will be moved from Room {transferCurrentRoom.roomNumber} to Room {transferNewRoom.roomNumber}. 
                                Old room will be marked for cleaning.
                              </p>
                            </div>
                          </>
                        ) : (
                          <p className="text-slate-400 italic text-center py-4">
                            Select both current and new rooms to see transfer summary.
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      id="btn-express-transfer-submit"
                      type="button"
                      disabled={!transferActiveBooking || !transferNewRoomId}
                      onClick={handleTransferSubmit}
                      className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        (!transferActiveBooking || !transferNewRoomId) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <ArrowLeftRight className="w-4 h-4 text-white" />
                      <span>Process Room Transfer</span>
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        )}
      </div>

      {/* Kitchen & Laundry Department Charges */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <UtensilsCrossed className="w-5 h-5 text-slate-800" />
            <div>
              <h2 className="font-display font-medium text-slate-900 text-sm">Kitchen & Laundry Desk</h2>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Post department charges to guest folios in real-time</p>
            </div>
          </div>
        </div>

        {/* Department Tabs */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex gap-2">
            <button
              onClick={() => setDepartmentTab("kitchen")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                departmentTab === "kitchen"
                  ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Kitchen Orders</span>
            </button>
            <button
              onClick={() => setDepartmentTab("laundry")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                departmentTab === "laundry"
                  ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>Laundry Services</span>
            </button>
          </div>
        </div>

        {/* Charge Form */}
        <div className="p-6">
          <form onSubmit={handleDeptChargeSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Select Guest Room</label>
              <select
                required
                value={deptChargeBookingId}
                onChange={(e) => setDeptChargeBookingId(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="">-- Choose Active Room --</option>
                {bookings.filter(b => b.status === "Checked In").map(b => (
                  <option key={b.id} value={b.id}>Room {b.roomNumber} - {b.guestName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                {departmentTab === "kitchen" ? "Item / Dish" : "Service Type"}
              </label>
              <input
                type="text"
                required
                placeholder={departmentTab === "kitchen" ? "e.g. Grilled Chicken, Room Service" : "e.g. Dry Cleaning, Ironing"}
                value={deptChargeItem}
                onChange={(e) => setDeptChargeItem(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Description / Note</label>
              <input
                type="text"
                required
                placeholder="Brief description"
                value={deptChargeDesc}
                onChange={(e) => setDeptChargeDesc(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-2 inset-y-0 flex items-center text-[10px] font-bold text-slate-400">₦</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="0"
                    value={deptChargeAmount}
                    onChange={(e) => setDeptChargeAmount(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 pl-5 pr-2 py-2 text-xs font-mono font-semibold text-slate-800"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!deptChargeBookingId || !deptChargeAmount || Number(deptChargeAmount) <= 0 || !deptChargeDesc.trim()}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  (!deptChargeBookingId || !deptChargeAmount || Number(deptChargeAmount) <= 0 || !deptChargeDesc.trim())
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-slate-200/80 p-4 rounded-xl">
        <div className="relative flex-1 w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            id="search-bookings"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Guest name, Room #, or Booking ID..."
            className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">Filter:</span>
          <div className="flex bg-slate-50 border border-slate-200/60 rounded-lg p-1">
            {["All", "Upcoming", "Checked In", "Checked Out", "Cancelled"].map((status) => {
              const isActive = filterStatus === status;
              return (
                <button
                  id={`booking-filter-${status}`}
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? "bg-white text-slate-900 border border-slate-200/40 shadow-xs" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200/60 text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                <th className="py-4 px-6">ID & Guest</th>
                <th className="py-4 px-6">Room</th>
                <th className="py-4 px-6">Schedule Dates</th>
                <th className="py-4 px-6">Rate / Total</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No matching bookings found on record.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Guest Name & ID */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => {
                          const guest = guests.find(g => g.id === b.guestId || g.name === b.guestName);
                          if (guest) onGuestClick(guest);
                        }}
                        className="text-left hover:underline cursor-pointer text-slate-900 font-semibold hover:text-slate-700 transition-colors"
                      >
                        {b.guestName}
                      </button>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{b.id}</div>
                    </td>

                    {/* Room Details */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">Room {b.roomNumber}</div>
                      {(() => {
                        const roomObj = rooms.find(r => r.id === b.roomId);
                        return (
                          <div className="text-xs text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                            {roomObj ? roomObj.type : "Boutique"}
                          </div>
                        );
                      })()}
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-6">
                      <div className="font-mono text-xs text-slate-800 font-semibold">
                        {b.checkInDate} <span className="text-slate-300 mx-1">→</span> {b.checkOutDate}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                        {calculateNights(b.checkInDate, b.checkOutDate)} nights
                      </div>
                    </td>

                    {/* Cost */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">₦{b.totalPrice}</div>
                      {(() => {
                        const roomObj = rooms.find(r => r.id === b.roomId);
                        return (
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            (₦{roomObj ? roomObj.price : 0}/night)
                          </div>
                        );
                      })()}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${getStatusStyle(b.status)}`}>
                        {b.status}
                      </span>
                    </td>

                    {/* Interactive operations */}
                    <td className="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                      {/* Check-In Option */}
                      {b.status === "Upcoming" && (
                        <>
                          <button
                            id={`btn-record-upcoming-pay-${b.id}`}
                            onClick={() => {
                              setPaymentModalBookingId(b.id);
                              const roomCharge = b.totalPrice;
                              const extraCharges = b.extraCharges || [];
                              const payments = b.payments || [];
                              const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
                              const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
                              setQuickPayAmount((roomCharge + totalExtra - totalPaid).toString());
                            }}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 px-2.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Record Payment</span>
                          </button>
                          <button
                            id={`btn-checkin-${b.id}`}
                            onClick={() => handleCheckIn(b)}
                            className="bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer"
                          >
                            Check In
                          </button>
                          <button
                            id={`btn-cancel-${b.id}`}
                            onClick={() => handleCancelBooking(b)}
                            className="text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {/* Check-Out Option */}
                      {b.status === "Checked In" && (
                        <>
                          <button
                            id={`btn-record-active-pay-${b.id}`}
                            onClick={() => {
                              setPaymentModalBookingId(b.id);
                              const roomCharge = b.totalPrice;
                              const extraCharges = b.extraCharges || [];
                              const payments = b.payments || [];
                              const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
                              const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
                              setQuickPayAmount((roomCharge + totalExtra - totalPaid).toString());
                            }}
                            className="bg-emerald-600 text-white hover:bg-emerald-700 px-2.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Record Payment</span>
                          </button>
                          <button
                            id={`btn-checkout-${b.id}`}
                            onClick={() => handleCheckOut(b)}
                            className="bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer"
                          >
                            Check Out & Bill
                          </button>
                        </>
                      )}

                      {/* No surveys for checked out guests */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Step Booking Wizard Modal */}
      {isWizardOpen && (
        <div id="booking-wizard-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="font-display font-medium text-lg text-slate-900">
                  New Reservation
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[9px] tracking-wider px-2 py-0.5 rounded font-bold uppercase ${wizardStep === 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>1. Room</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className={`text-[9px] tracking-wider px-2 py-0.5 rounded font-bold uppercase ${wizardStep === 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>2. Guest</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className={`text-[9px] tracking-wider px-2 py-0.5 rounded font-bold uppercase ${wizardStep === 3 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>3. Confirmation</span>
                </div>
              </div>
              <button 
                id="btn-close-wizard"
                onClick={() => setIsWizardOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* STEP 1: SCHEDULE DATES & ROOM */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Check-In Date</label>
                      <input
                        id="wizard-checkin"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Check-Out Date</label>
                      <input
                        id="wizard-checkout"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Available Rooms ({totalCalculatedNights} nights)</label>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                      {rooms
                        .filter(r => r.status === "Available")
                        .map((r) => (
                          <div
                            id={`wizard-room-select-${r.roomNumber}`}
                            key={r.id}
                            onClick={() => setSelectedRoomId(r.id)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all flex flex-col justify-between h-20 ${
                              selectedRoomId === r.id 
                                ? "bg-slate-950 border-slate-950 text-white" 
                                : "bg-slate-50 border-slate-200/50 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <div className="flex justify-between items-start font-semibold text-xs">
                              <span>Room {r.roomNumber}</span>
                              <span className={`font-bold ${selectedRoomId === r.id ? 'text-amber-300' : 'text-slate-900'}`}>₦{r.price}/n</span>
                            </div>
                            <span className={`text-[9px] uppercase font-bold tracking-tight ${selectedRoomId === r.id ? 'text-slate-300' : 'text-slate-400'}`}>{r.type}</span>
                          </div>
                        ))}
                    </div>
                    {rooms.filter(r => r.status === "Available").length === 0 && (
                      <p className="text-xs text-rose-800 font-semibold bg-rose-50 p-2.5 rounded-lg mt-2">
                        All rooms are occupied, dirty, or in maintenance. Update statuses to book.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: GUEST RECORD */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Guest Association</label>
                    <select
                      id="wizard-guest-select"
                      value={selectedGuestId}
                      onChange={(e) => setSelectedGuestId(e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                    >
                      <option value="new">Register New Guest Profile</option>
                      {guests.map((g) => (
                        <option key={g.id} value={g.id}>{g.name} (VIP: {g.vipStatus ? "Yes" : "No"})</option>
                      ))}
                    </select>
                  </div>

                  {selectedGuestId === "new" ? (
                    <div className="space-y-3 p-4 bg-slate-50/50 border border-slate-200/60 rounded-lg">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">New Guest Form</p>
                      
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Full Guest Name</label>
                        <input
                          id="wizard-guest-name"
                          type="text"
                          required
                          placeholder="e.g. Eleanor Vance"
                          value={newGuestName}
                          onChange={(e) => setNewGuestName(e.target.value)}
                          className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Email Address</label>
                          <input
                            id="wizard-guest-email"
                            type="email"
                            placeholder="name@domain.com"
                            value={newGuestEmail}
                            onChange={(e) => setNewGuestEmail(e.target.value)}
                            className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Phone Number</label>
                          <input
                            id="wizard-guest-phone"
                            type="text"
                            placeholder="+1 (555) 000-0000"
                            value={newGuestPhone}
                            onChange={(e) => setNewGuestPhone(e.target.value)}
                            className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          id="wizard-guest-vip"
                          type="checkbox"
                          checked={newGuestVip}
                          onChange={(e) => setNewGuestVip(e.target.checked)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                        <label htmlFor="wizard-guest-vip" className="text-xs font-semibold text-slate-600 select-none">VIP Client Status</label>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Special Preferences / Private Notes</label>
                        <textarea
                          id="wizard-guest-notes"
                          rows={2}
                          placeholder="preferences, dietary, VIP expectations..."
                          value={newGuestNotes}
                          onChange={(e) => setNewGuestNotes(e.target.value)}
                          className="block w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-lg text-xs space-y-1 text-slate-600">
                      <p className="font-bold text-slate-800">Associated Guest Profile</p>
                      {(() => {
                        const guestObj = guests.find(g => g.id === selectedGuestId);
                        if (!guestObj) return null;
                        return (
                          <>
                            <p><span className="font-medium text-slate-400">Email:</span> {guestObj.email}</p>
                            <p><span className="font-medium text-slate-400">Phone:</span> {guestObj.phone}</p>
                            {guestObj.vipStatus && <span className="inline-block mt-2 bg-slate-900 text-white px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">VIP Platinum Guest</span>}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Reservation Notes</label>
                    <textarea
                      id="wizard-booking-notes"
                      rows={2}
                      placeholder="special checkout terms, custom configurations..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: BOOKING SUMMARY & CONFIRM */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-4 rounded-lg text-slate-700">
                    <Info className="w-5 h-5 text-slate-900 flex-shrink-0" />
                    <p className="text-xs leading-relaxed">
                      Please audit all reservation specs carefully before creating the official record.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 overflow-hidden text-xs">
                    <div className="grid grid-cols-2 p-4 bg-slate-50/50">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Guest</span>
                        <p className="font-bold text-slate-900 mt-0.5">{selectedGuestId === "new" ? newGuestName : guests.find(g => g.id === selectedGuestId)?.name}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Accommodation</span>
                        <p className="font-bold text-slate-900 mt-0.5">Room {selectedRoomObj?.roomNumber} ({selectedRoomObj?.type})</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 p-4">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Schedule Timeline</span>
                        <p className="font-bold text-slate-900 mt-0.5">{checkIn} to {checkOut}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">Stay Length</span>
                        <p className="font-bold text-slate-900 mt-0.5">{totalCalculatedNights} Nights</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-slate-50">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wide">Grand Total Estimate</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">(₦{selectedRoomObj?.price || 0} / night base rate)</p>
                      </div>
                      <span className="text-2xl font-display font-medium text-slate-900">₦{calculatedPrice}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Control Panel */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
              {/* Left Action */}
              <div>
                {wizardStep > 1 ? (
                  <button
                    onClick={() => setWizardStep(prev => prev - 1)}
                    className="text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Back
                  </button>
                ) : (
                  <button
                    onClick={() => setIsWizardOpen(false)}
                    className="text-slate-500 hover:underline px-2 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>

              {/* Right Action */}
              <div>
                {wizardStep < 3 ? (
                  <button
                    id="wizard-btn-next"
                    disabled={wizardStep === 1 && !selectedRoomId}
                    onClick={() => setWizardStep(prev => prev + 1)}
                    className={`bg-slate-900 text-white hover:bg-slate-800 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      wizardStep === 1 && !selectedRoomId ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    id="wizard-btn-finalize"
                    onClick={handleCreateBooking}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Finalize Reservation</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Quick Payment Record Modal */}
      {paymentModalBookingId && (() => {
        const bk = bookings.find(b => b.id === paymentModalBookingId);
        if (!bk) return null;

        const totalRoomCharge = bk.totalPrice;
        const extraCharges = bk.extraCharges || [];
        const payments = bk.payments || [];
        const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
        const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
        const outstanding = totalRoomCharge + totalExtra - totalPaid;

        const handleQuickPaymentSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const amount = Number(quickPayAmount);
          if (isNaN(amount) || amount <= 0) return;

          const newPayment = {
            id: `PAY-${Date.now().toString().slice(-4)}`,
            amount,
            method: quickPayMethod,
            date: new Date().toISOString().split('T')[0]
          };

          const updatedPayments = [...payments, newPayment];
          onUpdateBooking(bk.id, { payments: updatedPayments });
          onAddLog("Guest", `Recorded payment of ₦${amount.toLocaleString()} via ${quickPayMethod} for Room ${bk.roomNumber} folio.`);
          
          // Reset and close
          setPaymentModalBookingId(null);
          setQuickPayAmount("");
          setQuickPayMethod("Card");
        };

        return (
          <div id="quick-payment-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-slate-800" />
                  <h3 className="font-display font-medium text-slate-900 text-base">Record Guest Payment</h3>
                </div>
                <button
                  id="btn-close-payment-modal"
                  onClick={() => setPaymentModalBookingId(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Guest:</span>
                    <span className="font-bold text-slate-900">{bk.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Room Allocation:</span>
                    <span className="font-bold text-slate-900">Room {bk.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Booking ID:</span>
                    <span className="font-mono text-slate-600">{bk.id}</span>
                  </div>
                  <div className="border-t border-slate-200/60 pt-2 flex justify-between text-slate-800 font-semibold">
                    <span>Outstanding Due:</span>
                    <span className="font-mono font-black text-rose-600">₦{outstanding.toLocaleString()}</span>
                  </div>
                </div>

                <form onSubmit={handleQuickPaymentSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Amount</label>
                      <div className="relative">
                        <span className="absolute left-2.5 inset-y-0 flex items-center text-slate-400 text-xs font-bold">₦</span>
                        <input
                          id="quick-payment-amount"
                          type="number"
                          required
                          value={quickPayAmount}
                          onChange={(e) => setQuickPayAmount(e.target.value)}
                          className="block w-full border border-slate-200 rounded-lg py-2 pl-6 pr-2 text-xs font-semibold text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Method</label>
                      <select
                        id="quick-payment-method"
                        value={quickPayMethod}
                        onChange={(e) => setQuickPayMethod(e.target.value)}
                        className="block w-full text-xs font-semibold rounded-lg border border-slate-200 px-2 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      >
                        <option value="Card">Visa / MasterCard</option>
                        <option value="Cash">Cash Deposit</option>
                        <option value="Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      id="btn-cancel-quick-pay"
                      type="button"
                      onClick={() => setPaymentModalBookingId(null)}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold px-4 py-2 rounded-lg text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-submit-quick-pay"
                      type="submit"
                      disabled={!quickPayAmount || Number(quickPayAmount) <= 0}
                      className={`bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer ${
                        (!quickPayAmount || Number(quickPayAmount) <= 0) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Post Payment</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Outstanding Checked-Out Debts Modal */}
      {isDebtsModalOpen && (
        <div id="modal-outstanding-debts" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full overflow-hidden border border-slate-100 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-600" />
                <div>
                  <h3 className="font-display font-medium text-slate-900 text-base">Outstanding Checked-Out Debts</h3>
                  <p className="text-xs text-slate-500 mt-0.5">List of guest profiles with unpaid balances from historical stays.</p>
                </div>
              </div>
              <button
                id="btn-close-debts-modal"
                onClick={() => {
                  setIsDebtsModalOpen(false);
                  setSettleGuestId(null);
                  setSettleDebtAmount("");
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer animate-none bg-transparent border-none text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {guests.filter(g => (g.debt || 0) > 0).length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm font-semibold">
                  No checked-out guest accounts currently hold an outstanding debt. All accounts settled!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200/60 rounded-xl overflow-hidden">
                  {guests.filter(g => (g.debt || 0) > 0).map(g => {
                    const isSettling = settleGuestId === g.id;
                    const latestBooking = bookings
                      .filter(b => b.guestId === g.id || b.guestName === g.name)
                      .sort((a, b) => new Date(b.checkOutDate).getTime() - new Date(a.checkOutDate).getTime())[0];

                    const handleSettleSubmitLocal = (e: React.FormEvent) => {
                      e.preventDefault();
                      const amt = Number(settleDebtAmount);
                      if (isNaN(amt) || amt <= 0) return;
                      
                      const currentDebt = g.debt || 0;
                      const newDebt = Math.max(0, currentDebt - amt);
                      onUpdateGuest(g.id, { debt: newDebt });
                      onAddLog("Guest", `Settle Payment: Recorded debt payment of ₦${amt.toLocaleString()} via ${settleDebtMethod} for Guest ${g.name}. Debt balance reduced from ₦${currentDebt.toLocaleString()} to ₦${newDebt.toLocaleString()}.`);
                      
                      setSettleGuestId(null);
                      setSettleDebtAmount("");
                    };

                    return (
                      <div key={g.id} className="p-4 bg-white hover:bg-slate-50/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{g.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{g.id}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 space-x-2">
                              <span>{g.email}</span>
                              <span>•</span>
                              <span>{g.phone}</span>
                            </div>
                            {latestBooking && (
                              <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                                LAST STAY: Room {latestBooking.roomNumber} (Checkout: {latestBooking.checkOutDate})
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Outstanding Debt</span>
                              <span className="font-mono text-base font-black text-rose-600">₦{(g.debt || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setInvoiceGuest(g);
                                  setInvoiceBooking(latestBooking || null);
                                  setIsInvoiceOpen(true);
                                }}
                                className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                              >
                                View Account
                              </button>
                              <button
                                onClick={() => {
                                  if (isSettling) {
                                    setSettleGuestId(null);
                                    setSettleDebtAmount("");
                                  } else {
                                    setSettleGuestId(g.id);
                                    setSettleDebtAmount((g.debt || 0).toString());
                                  }
                                }}
                                className="bg-rose-50 border border-rose-100 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                              >
                                {isSettling ? "Cancel" : "Settle"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {isSettling && (
                          <form onSubmit={handleSettleSubmitLocal} className="mt-4 bg-slate-50 border border-slate-200/60 p-4 rounded-lg space-y-3">
                            <div className="text-xs font-bold text-slate-700">Record Debt Settle Payment for {g.name}</div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Amount</label>
                                <div className="relative">
                                  <span className="absolute left-2.5 inset-y-0 flex items-center text-slate-400 text-xs font-bold">₦</span>
                                  <input
                                    type="number"
                                    required
                                    value={settleDebtAmount}
                                    onChange={(e) => setSettleDebtAmount(e.target.value)}
                                    className="block w-full border border-slate-200 rounded-lg py-1.5 pl-6 pr-2 text-xs font-semibold text-slate-800 font-mono bg-white focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Method</label>
                                <select
                                  value={settleDebtMethod}
                                  onChange={(e) => setSettleDebtMethod(e.target.value)}
                                  className="block w-full text-xs font-semibold rounded-lg border border-slate-200 px-2 py-1.5 bg-white text-slate-700 focus:outline-none"
                                >
                                  <option value="Card">Visa / MasterCard</option>
                                  <option value="Cash">Cash Deposit</option>
                                  <option value="Transfer">Bank Transfer</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => { setSettleGuestId(null); setSettleDebtAmount(""); }}
                                className="text-slate-500 hover:text-slate-700 text-xs font-semibold px-3 py-1"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="bg-slate-950 text-white font-semibold rounded-lg px-4 py-1.5 text-xs hover:bg-slate-900 cursor-pointer"
                              >
                                Post Settle Payment
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDebtsModalOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Unpaid Accounts Modal */}
      {isActiveUnpaidModalOpen && (
        <div id="modal-active-unpaid" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full overflow-hidden border border-slate-100 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-display font-medium text-slate-900 text-base">Active Unpaid Stay Accounts</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Currently checked-in guests with outstanding room folios.</p>
                </div>
              </div>
              <button
                id="btn-close-active-unpaid"
                onClick={() => setIsActiveUnpaidModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer bg-transparent border-none text-2xl"
              >
                &times;
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {activeUnpaidBookings.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm font-semibold">
                  No currently occupied rooms have pending charges. All active stays are fully settled!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200/60 rounded-xl overflow-hidden">
                  {activeUnpaidBookings.map(b => {
                    const totalRoomCharge = b.totalPrice;
                    const extraCharges = b.extraCharges || [];
                    const payments = b.payments || [];
                    const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
                    const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
                    const outstanding = totalRoomCharge + totalExtra - totalPaid;
                    const gstObj = guests.find(g => g.id === b.guestId || g.name === b.guestName);

                    return (
                      <div key={b.id} className="p-4 bg-white hover:bg-slate-50/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">Room {b.roomNumber}</span>
                              <span className="text-slate-300">•</span>
                              <span className="font-semibold text-slate-800">{b.guestName}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              <span>Check-In: {b.checkInDate} <span className="text-slate-300 mx-1">→</span> Checkout: {b.checkOutDate}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 font-semibold flex items-center gap-2">
                              <span>Folio Charges: ₦{(totalRoomCharge + totalExtra).toLocaleString()}</span>
                              <span>|</span>
                              <span>Total Paid: ₦{totalPaid.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Outstanding Due</span>
                              <span className="font-mono text-base font-black text-amber-600">₦{outstanding.toLocaleString()}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setInvoiceBooking(b);
                                  setInvoiceGuest(gstObj || null);
                                  setIsInvoiceOpen(true);
                                }}
                                className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                              >
                                View Folio
                              </button>
                              <button
                                onClick={() => {
                                  setIsActiveUnpaidModalOpen(false);
                                  setPaymentModalBookingId(b.id);
                                  setQuickPayAmount(outstanding.toString());
                                }}
                                className="bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Settle Folio</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsActiveUnpaidModalOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Invoice Modal View */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        booking={invoiceBooking}
        guest={invoiceGuest}
        bookings={bookings}
        rooms={rooms}
      />
    </div>
  );
}

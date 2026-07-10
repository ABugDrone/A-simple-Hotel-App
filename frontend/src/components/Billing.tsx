import React, { useState } from "react";
import { 
  CreditCard, 
  Search, 
  Receipt, 
  User, 
  PlusCircle, 
  CheckCircle, 
  ArrowRightLeft,
  Users,
  DollarSign,
  TrendingDown,
  AlertCircle,
  Printer
} from "lucide-react";
import { Guest, Booking, Room } from "../types";
import InvoiceModal from "./InvoiceModal";

interface BillingProps {
  guests: Guest[];
  bookings: Booking[];
  rooms: Room[];
  onUpdateBooking: (bookingId: string, updatedFields: Partial<Booking>) => void;
  onUpdateGuest: (guestId: string, updatedFields: Partial<Guest>) => void;
  onAddLog: (type: "Booking" | "Housekeeping" | "System" | "Guest", message: string) => void;
  onGuestClick: (guest: Guest) => void;
}

export default function Billing({
  guests,
  bookings,
  rooms,
  onUpdateBooking,
  onUpdateGuest,
  onAddLog,
  onGuestClick
}: BillingProps) {
  const [activeTab, setActiveTab] = useState<"active" | "debt">("active");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // States for Active Stay Payments
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [activePayAmount, setActivePayAmount] = useState<string>("");
  const [activePayMethod, setActivePayMethod] = useState<string>("Card");

  // States for Debt Settle Payments
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [debtPayAmount, setDebtPayAmount] = useState<string>("");
  const [debtPayMethod, setDebtPayMethod] = useState<string>("Card");

  // States to add / adjust manual debt (for flexible ledger management)
  const [adjustGuestId, setAdjustGuestId] = useState<string>("");
  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [adjustReason, setAdjustReason] = useState<string>("");

  // Invoice view states
  const [isInvoiceOpen, setIsInvoiceOpen] = useState<boolean>(false);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);
  const [invoiceGuest, setInvoiceGuest] = useState<Guest | null>(null);

  const handleOpenInvoice = (booking: Booking | null, guest: Guest | null) => {
    setInvoiceBooking(booking);
    setInvoiceGuest(guest);
    setIsInvoiceOpen(true);
  };

  // Get active bookings (Currently Checked In)
  const activeBookings = bookings.filter(b => b.status === "Checked In");

  // Search filter for checked in bookings
  const filteredActiveBookings = activeBookings.filter(b => {
    const q = searchTerm.toLowerCase();
    return b.guestName.toLowerCase().includes(q) || 
           b.roomNumber.includes(q) || 
           b.id.toLowerCase().includes(q);
  });

  // Guests with debt
  const debtors = guests.filter(g => (g.debt || 0) > 0);

  // Search filter for debt ledger
  const filteredGuests = guests.filter(g => {
    const q = searchTerm.toLowerCase();
    return g.name.toLowerCase().includes(q) || 
           g.email.toLowerCase().includes(q) || 
           g.id.toLowerCase().includes(q);
  });

  // Calculate stats
  const totalOutstandingDebt = guests.reduce((sum, g) => sum + (g.debt || 0), 0);
  const activeDebtorsCount = debtors.length;

  const handleActivePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !activePayAmount || Number(activePayAmount) <= 0) return;

    const booking = bookings.find(b => b.id === selectedBookingId);
    if (!booking) return;

    const amount = Number(activePayAmount);
    const newPayment = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      amount,
      method: activePayMethod,
      date: new Date().toISOString().split("T")[0]
    };

    const currentPayments = booking.payments || [];
    onUpdateBooking(booking.id, {
      payments: [...currentPayments, newPayment]
    });

    onAddLog("Guest", `Recorded payment of ₦${amount.toLocaleString()} via ${activePayMethod} for checked-in Guest ${booking.guestName} (Room ${booking.roomNumber}).`);
    
    // Clear form
    setActivePayAmount("");
    setSelectedBookingId("");
  };

  const handleDebtPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuestId || !debtPayAmount || Number(debtPayAmount) <= 0) return;

    const guest = guests.find(g => g.id === selectedGuestId);
    if (!guest) return;

    const amount = Number(debtPayAmount);
    const currentDebt = guest.debt || 0;
    const newDebt = Math.max(0, currentDebt - amount);

    onUpdateGuest(guest.id, {
      debt: newDebt,
      totalSpend: guest.totalSpend + amount
    });

    onAddLog("Guest", `Debt Settle: Recorded debt payment of ₦${amount.toLocaleString()} via ${debtPayMethod} from Guest ${guest.name}. Debt balance reduced from ₦${currentDebt.toLocaleString()} to ₦${newDebt.toLocaleString()}.`);

    // Clear form
    setDebtPayAmount("");
    setSelectedGuestId("");
  };

  const handleAdjustDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustGuestId || !adjustAmount || Number(adjustAmount) <= 0) return;

    const guest = guests.find(g => g.id === adjustGuestId);
    if (!guest) return;

    const amount = Number(adjustAmount);
    const currentDebt = guest.debt || 0;
    const newDebt = currentDebt + amount;

    onUpdateGuest(guest.id, {
      debt: newDebt
    });

    onAddLog("Guest", `Ledger Adjustment: Manually posted additional debt of ₦${amount.toLocaleString()} to Guest ${guest.name} (${adjustReason || "Unspecified charge"}).`);

    // Clear form
    setAdjustAmount("");
    setAdjustReason("");
    setAdjustGuestId("");
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-medium text-3xl tracking-tight text-slate-900">
          Billing & Guest Ledgers
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage guest stay invoicing, record guest payments, track unpaid debts, and manage accounts receivable.
        </p>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Outstanding Debt</span>
            <p className="text-2xl font-mono font-black text-rose-600 mt-0.5">₦{totalOutstandingDebt.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Unpaid Accounts</span>
            <p className="text-2xl font-display font-medium text-slate-800 mt-0.5">{activeDebtorsCount} Guests</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Checked-In Bookings</span>
            <p className="text-2xl font-display font-medium text-emerald-700 mt-0.5">{activeBookings.length} Rooms</p>
          </div>
        </div>
      </div>

      {/* Tabs Selection Bar & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
        <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            id="tab-billing-active"
            onClick={() => {
              setActiveTab("active");
              setSearchTerm("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "active"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Active Stay Payments</span>
          </button>
          <button
            id="tab-billing-debt"
            onClick={() => {
              setActiveTab("debt");
              setSearchTerm("");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "debt"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Guest Debt Ledger</span>
          </button>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative w-full sm:w-80">
          <span className="absolute left-3 inset-y-0 flex items-center">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            id="billing-search"
            type="text"
            placeholder={activeTab === "active" ? "Search room, active guest..." : "Search guest name, email..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
          />
        </div>
      </div>

      {/* WORKSPACE AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT & CENTER GRID: TABLE OF INVOICES OR DEBTORS */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "active" ? (
            /* ACTIVE STAY FOLIOS TAB */
            <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Currently Occupied Folios</span>
                <span className="text-[10px] font-bold bg-slate-100 px-2.5 py-1 rounded-full text-slate-600">
                  {filteredActiveBookings.length} records found
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 font-bold border-b border-slate-100 uppercase text-[9px] tracking-wider">
                      <th className="p-4">Room</th>
                      <th className="p-4">Guest</th>
                      <th className="p-4 text-right">Stay Total</th>
                      <th className="p-4 text-right">Paid So Far</th>
                      <th className="p-4 text-right">Outstanding</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredActiveBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                          No checked-in suites match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredActiveBookings.map((b) => {
                        const totalRoomCharge = b.totalPrice;
                        const extraCharges = b.extraCharges || [];
                        const payments = b.payments || [];
                        const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
                        const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
                        const outstanding = totalRoomCharge + totalExtra - totalPaid;

                        return (
                          <tr key={b.id} className="hover:bg-slate-50/30">
                            <td className="p-4 font-bold text-slate-900">
                              Room {b.roomNumber}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  const guest = guests.find(g => g.id === b.guestId || g.name === b.guestName);
                                  if (guest) onGuestClick(guest);
                                }}
                                className="text-left hover:underline cursor-pointer font-semibold text-slate-800 hover:text-slate-600 transition-colors"
                              >
                                {b.guestName}
                              </button>
                              <span className="block text-[10px] text-slate-400 font-mono">{b.id}</span>
                            </td>
                            <td className="p-4 text-right font-mono font-semibold text-slate-700">
                              ₦{(totalRoomCharge + totalExtra).toLocaleString()}
                            </td>
                            <td className="p-4 text-right font-mono font-bold text-emerald-600">
                              ₦{totalPaid.toLocaleString()}
                            </td>
                            <td className="p-4 text-right font-mono font-black">
                              <span className={outstanding > 0 ? "text-rose-600" : "text-emerald-700"}>
                                ₦{outstanding.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  id={`btn-select-folio-${b.id}`}
                                  onClick={() => {
                                    setSelectedBookingId(b.id);
                                    setActivePayAmount(outstanding.toString());
                                  }}
                                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 py-1.5 rounded text-[10px] cursor-pointer inline-flex items-center gap-1"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  <span>Record Pay</span>
                                </button>
                                <button
                                  id={`btn-print-active-invoice-${b.id}`}
                                  onClick={() => handleOpenInvoice(b, null)}
                                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-2.5 py-1.5 rounded text-[10px] cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Printer className="w-3 h-3 text-slate-500" />
                                  <span>Invoice</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* DEBT LEDGER TAB */
            <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unpaid Previous Stays Directory</span>
                <span className="text-[10px] font-bold bg-rose-50 border border-rose-100 px-2.5 py-1 rounded text-rose-800 font-mono">
                  {debtors.length} Debt Accounts Active
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 font-bold border-b border-slate-100 uppercase text-[9px] tracking-wider">
                      <th className="p-4">Guest Profile</th>
                      <th className="p-4">Contact Detail</th>
                      <th className="p-4 text-right">Total Spent Overall</th>
                      <th className="p-4 text-right">Outstanding Debt</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {debtors.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                          No previous guest debt recorded! High five, all invoices fully paid.
                        </td>
                      </tr>
                    ) : (
                      debtors.map((g) => (
                        <tr key={g.id} className="hover:bg-slate-50/30">
                          <td className="p-4">
                            <button
                              onClick={() => onGuestClick(g)}
                              className="text-left hover:underline cursor-pointer font-bold text-slate-900 hover:text-slate-700 transition-colors"
                            >
                              {g.name}
                            </button>
                            <span className="block text-[10px] text-slate-400 font-mono">{g.id}</span>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-slate-700">{g.email}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{g.phone}</p>
                          </td>
                          <td className="p-4 text-right font-mono font-semibold text-slate-600">
                            ₦{g.totalSpend.toLocaleString()}
                          </td>
                          <td className="p-4 text-right font-mono font-black text-rose-600 bg-rose-50/10">
                            ₦{(g.debt || 0).toLocaleString()}
                          </td>
                           <td className="p-4 text-center">
                             <div className="flex items-center justify-center gap-1.5">
                               <button
                                 id={`btn-select-debtor-${g.id}`}
                                 onClick={() => {
                                   setSelectedGuestId(g.id);
                                   setDebtPayAmount((g.debt || 0).toString());
                                 }}
                                 className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1.5 rounded text-[10px] cursor-pointer inline-flex items-center gap-1"
                               >
                                 <CreditCard className="w-3 h-3" />
                                 <span>Settle Debt</span>
                               </button>
                               <button
                                 id={`btn-print-debtor-invoice-${g.id}`}
                                 onClick={() => handleOpenInvoice(null, g)}
                                 className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-2.5 py-1.5 rounded text-[10px] cursor-pointer inline-flex items-center gap-1"
                               >
                                 <Printer className="w-3 h-3 text-slate-500" />
                                 <span>Invoice</span>
                               </button>
                             </div>
                           </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR PANEL: TRANSACTION & ACTION FORMS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* ACTION 1: ADD PAYMENT TO ACTIVE FOLIO OR SETTLE DEBT */}
          {activeTab === "active" ? (
            /* RECORD ACTIVE PAYMENT FORM */
            <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-slate-700" />
                <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Post Active Folio Payment
                </h3>
              </div>

              <form onSubmit={handleActivePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Occupied Room</label>
                  <select
                    id="billing-select-active-booking"
                    required
                    value={selectedBookingId}
                    onChange={(e) => {
                      setSelectedBookingId(e.target.value);
                      const bk = bookings.find(b => b.id === e.target.value);
                      if (bk) {
                        const totalRoomCharge = bk.totalPrice;
                        const extraCharges = bk.extraCharges || [];
                        const payments = bk.payments || [];
                        const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
                        const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
                        setActivePayAmount((totalRoomCharge + totalExtra - totalPaid).toString());
                      } else {
                        setActivePayAmount("");
                      }
                    }}
                    className="block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">-- Select Active Suite --</option>
                    {activeBookings.map(b => (
                      <option key={b.id} value={b.id}>Room {b.roomNumber} - {b.guestName}</option>
                    ))}
                  </select>
                </div>

                {selectedBookingId && (() => {
                  const bk = bookings.find(b => b.id === selectedBookingId);
                  if (!bk) return null;
                  const totalRoomCharge = bk.totalPrice;
                  const extraCharges = bk.extraCharges || [];
                  const payments = bk.payments || [];
                  const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
                  const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
                  const outstanding = totalRoomCharge + totalExtra - totalPaid;

                  return (
                    <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-lg text-xs space-y-1 text-slate-600">
                      <p className="font-bold text-slate-800">Folio Breakdown:</p>
                      <div className="flex justify-between">
                        <span>Base Rent ({calculateNights(bk.checkInDate, bk.checkOutDate)} nights):</span>
                        <span className="font-mono">₦{totalRoomCharge.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Incidentals/Extras:</span>
                        <span className="font-mono">₦{totalExtra.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-bold border-b border-slate-200 pb-1.5">
                        <span>Payments Logged:</span>
                        <span className="font-mono">-₦{totalPaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-black pt-1.5 text-sm">
                        <span>Outstanding Due:</span>
                        <span className="font-mono">₦{outstanding.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pay Amount</label>
                    <div className="relative">
                      <span className="absolute left-2.5 inset-y-0 flex items-center text-slate-400 text-[11px] font-bold">₦</span>
                      <input
                        id="billing-active-pay-amount"
                        type="number"
                        required
                        placeholder="Amount"
                        value={activePayAmount}
                        onChange={(e) => setActivePayAmount(e.target.value)}
                        className="block w-full border border-slate-200 rounded-lg py-2 pl-6 pr-2 text-xs font-semibold text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pay Method</label>
                    <select
                      id="billing-active-pay-method"
                      value={activePayMethod}
                      onChange={(e) => setActivePayMethod(e.target.value)}
                      className="block w-full text-xs font-semibold rounded-lg border border-slate-200 px-2 py-2 bg-white text-slate-700"
                    >
                      <option value="Card">Visa/MasterCard</option>
                      <option value="Cash">Cash Deposit</option>
                      <option value="Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <button
                  id="btn-submit-active-payment"
                  type="submit"
                  disabled={!selectedBookingId || !activePayAmount || Number(activePayAmount) <= 0}
                  className={`w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    (!selectedBookingId || !activePayAmount || Number(activePayAmount) <= 0) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Post Settle Payment</span>
                </button>
              </form>
            </div>
          ) : (
            /* RECORD DEBT PAYMENT FORM (FOR CHECKED-OUT OR NON-CHECKED-IN GUESTS) */
            <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-700" />
                <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Post Guest Debt Payment
                </h3>
              </div>

              <form onSubmit={handleDebtPaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Debt Account (Any Guest)</label>
                  <select
                    id="billing-select-debt-guest"
                    required
                    value={selectedGuestId}
                    onChange={(e) => {
                      setSelectedGuestId(e.target.value);
                      const g = guests.find(g => g.id === e.target.value);
                      setDebtPayAmount(g ? (g.debt || 0).toString() : "");
                    }}
                    className="block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="">-- Choose Guest Profile --</option>
                    {filteredGuests.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} { (g.debt || 0) > 0 ? `(Owes ₦${g.debt?.toLocaleString()})` : "(No Debt)" }
                      </option>
                    ))}
                  </select>
                </div>

                {selectedGuestId && (() => {
                  const g = guests.find(g => g.id === selectedGuestId);
                  if (!g) return null;
                  return (
                    <div className="bg-rose-50/50 border border-rose-100 p-3 rounded-lg text-xs space-y-1 text-slate-600">
                      <p className="font-bold text-rose-800 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Active Debt Profile:</span>
                      </p>
                      <div className="flex justify-between">
                        <span>Guest Name:</span>
                        <span className="font-semibold text-slate-800">{g.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Debt Balance:</span>
                        <span className="font-mono font-black text-rose-600 text-sm">₦{(g.debt || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Payment Amount</label>
                    <div className="relative">
                      <span className="absolute left-2.5 inset-y-0 flex items-center text-slate-400 text-[11px] font-bold">₦</span>
                      <input
                        id="billing-debt-pay-amount"
                        type="number"
                        required
                        placeholder="Amount"
                        value={debtPayAmount}
                        onChange={(e) => setDebtPayAmount(e.target.value)}
                        className="block w-full border border-slate-200 rounded-lg py-2 pl-6 pr-2 text-xs font-semibold text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pay Method</label>
                    <select
                      id="billing-debt-pay-method"
                      value={debtPayMethod}
                      onChange={(e) => setDebtPayMethod(e.target.value)}
                      className="block w-full text-xs font-semibold rounded-lg border border-slate-200 px-2 py-2 bg-white text-slate-700"
                    >
                      <option value="Card">Visa/MasterCard</option>
                      <option value="Cash">Cash Deposit</option>
                      <option value="Transfer">Bank Wire</option>
                    </select>
                  </div>
                </div>

                <button
                  id="btn-submit-debt-payment"
                  type="submit"
                  disabled={!selectedGuestId || !debtPayAmount || Number(debtPayAmount) <= 0}
                  className={`w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    (!selectedGuestId || !debtPayAmount || Number(debtPayAmount) <= 0) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Settle Debt Ledger</span>
                </button>
              </form>
            </div>
          )}

          {/* ADDITIONAL FORM: POST MANUAL GUEST DEBT (Adjustments Ledger) */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-slate-700" />
              <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">
                Manually Adjust Debt Account
              </h3>
            </div>

            <form onSubmit={handleAdjustDebtSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Debtor Guest</label>
                <select
                  id="billing-select-adjust-guest"
                  required
                  value={adjustGuestId}
                  onChange={(e) => setAdjustGuestId(e.target.value)}
                  className="block w-full text-xs font-semibold rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="">-- Choose Guest Profile --</option>
                  {guests.map(g => (
                    <option key={g.id} value={g.id}>{g.name} (Current Debt: ₦{(g.debt || 0).toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Additional Debt Amount</label>
                  <div className="relative">
                    <span className="absolute left-2.5 inset-y-0 flex items-center text-slate-400 text-[11px] font-bold">₦</span>
                    <input
                      id="billing-adjust-amount"
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="block w-full border border-slate-200 rounded-lg py-2 pl-6 pr-2 text-xs font-semibold text-slate-800 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Reason / Description</label>
                  <input
                    id="billing-adjust-reason"
                    type="text"
                    required
                    placeholder="e.g. Unpaid restaurant charge, damage fee"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800"
                  />
                </div>
              </div>

              <button
                id="btn-submit-adjust-debt"
                type="submit"
                disabled={!adjustGuestId || !adjustAmount || Number(adjustAmount) <= 0 || !adjustReason.trim()}
                className={`w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                  (!adjustGuestId || !adjustAmount || Number(adjustAmount) <= 0 || !adjustReason.trim()) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Custom Outstanding Charge</span>
              </button>
            </form>
          </div>

        </div>
      </div>

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

// Simple internal helper to count nights
function calculateNights(start: string, end: string) {
  const sDate = new Date(start);
  const eDate = new Date(end);
  const diff = eDate.getTime() - sDate.getTime();
  if (diff <= 0) return 1;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

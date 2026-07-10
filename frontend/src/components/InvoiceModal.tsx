import React from "react";
import { 
  Printer, 
  X, 
  Building2, 
  User, 
  CreditCard, 
  Receipt,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { Booking, Guest, Room } from "../types";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  guest: Guest | null;
  bookings: Booking[];
  rooms: Room[];
}

export default function InvoiceModal({
  isOpen,
  onClose,
  booking,
  guest,
  bookings,
  rooms
}: InvoiceModalProps) {
  if (!isOpen) return null;

  // Resolve target guest & target booking details
  let resolvedGuest: Guest | null = guest;
  let resolvedBooking: Booking | null = booking;

  if (resolvedBooking && !resolvedGuest) {
    // If we only have booking, find the guest profile
    // We don't have guests list directly in the modal but we can infer details or just use booking properties
  } else if (resolvedGuest && !resolvedBooking) {
    // If we only have guest, find their most recent outstanding/checked-out booking
    const guestBookings = bookings
      .filter(b => b.guestId === resolvedGuest?.id || b.guestName === resolvedGuest?.name)
      .sort((a, b) => new Date(b.checkOutDate).getTime() - new Date(a.checkOutDate).getTime());
    
    if (guestBookings.length > 0) {
      resolvedBooking = guestBookings[0];
    }
  }

  // Fallback guest info from booking if guest object is not passed
  const guestName = resolvedBooking ? resolvedBooking.guestName : (resolvedGuest ? resolvedGuest.name : "Valued Guest");
  const guestEmail = resolvedGuest ? resolvedGuest.email : "guest@serenegrand.com";
  const guestPhone = resolvedGuest ? resolvedGuest.phone : "+234 803 123 4567";
  const guestId = resolvedGuest ? resolvedGuest.id : (resolvedBooking ? resolvedBooking.guestId : "G-UNKNOWN");

  // Invoice Metadata
  const invoiceNumber = `INV-${resolvedBooking ? resolvedBooking.id.slice(-5) : guestId.slice(-5)}-2026`;
  const invoiceDate = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Calculate nights and financial breakdowns
  let baseRent = 0;
  let extraChargesList: Array<{ description: string; amount: number; date: string }> = [];
  let paymentsList: Array<{ id?: string; amount: number; method: string; date: string }> = [];
  let nightsCount = 1;
  let roomNumber = "N/A";
  let roomType = "Standard Suite";
  let roomPrice = 0;

  if (resolvedBooking) {
    baseRent = resolvedBooking.totalPrice;
    extraChargesList = resolvedBooking.extraCharges || [];
    paymentsList = resolvedBooking.payments || [];
    roomNumber = resolvedBooking.roomNumber;

    // Find room details to list room type
    const r = rooms.find(rm => rm.id === resolvedBooking?.roomId || rm.roomNumber === resolvedBooking?.roomNumber);
    if (r) {
      roomType = r.type;
      roomPrice = r.price;
    }

    // Count nights
    const sDate = new Date(resolvedBooking.checkInDate);
    const eDate = new Date(resolvedBooking.checkOutDate);
    const diff = eDate.getTime() - sDate.getTime();
    nightsCount = diff <= 0 ? 1 : Math.ceil(diff / (1000 * 60 * 60 * 24));
  } else if (resolvedGuest) {
    // If no booking found for this guest, represent outstanding debt balance directly
    const debtAmt = resolvedGuest.debt || 0;
    baseRent = 0;
    extraChargesList = [
      {
        description: "Manually registered ledger charge / previous stay balance",
        amount: debtAmt,
        date: new Date().toISOString().split("T")[0]
      }
    ];
    paymentsList = [];
  }

  const subtotalExtras = extraChargesList.reduce((sum, item) => sum + item.amount, 0);
  const grandTotal = baseRent + subtotalExtras;
  const totalPaid = paymentsList.reduce((sum, item) => sum + item.amount, 0);
  
  // Outstanding Due
  // If it's a specific booking, it is grandTotal - totalPaid
  // If we printed from Guest Debt Ledger, the actual current guest debt might have been adjusted, so respect resolvedGuest.debt if present
  const balanceDue = resolvedGuest && !resolvedBooking 
    ? (resolvedGuest.debt || 0) 
    : (resolvedGuest && resolvedBooking && resolvedBooking.status === "Checked Out" 
        ? (resolvedGuest.debt || 0) 
        : Math.max(0, grandTotal - totalPaid));

  const isFullyPaid = balanceDue <= 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto print:bg-white print:p-0 print:static print:h-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col my-8 print:my-0 print:border-none print:shadow-none print:w-full">
        
        {/* Header Bar - Hidden on Print */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span className="font-display font-medium text-sm">Invoicing & Statement System</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-10 space-y-8 bg-white overflow-y-auto flex-1 print:p-0 print:overflow-visible">
          
          {/* Invoice Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-black font-mono text-sm">
                  SS
                </div>
                <span className="font-display font-black text-slate-900 text-lg tracking-tight uppercase">
                  Serene Suites
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs font-medium">
                Plot 124, Adetokunbo Ademola Crescent,<br />
                Wuse II, Abuja, Nigeria<br />
                <span className="font-semibold text-slate-500">Tel:</span> +234 9 460 3000<br />
                <span className="font-semibold text-slate-500">Email:</span> billing@serenesuites.com
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1.5">
              <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight uppercase">
                {isFullyPaid ? "Invoice Statement" : "Payment Due Invoice"}
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Invoice No: <span className="font-mono text-slate-900 font-bold">{invoiceNumber}</span>
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Date: <span className="text-slate-900 font-semibold">{invoiceDate}</span>
              </p>
              
              {/* Payment Status Badge */}
              <div className="pt-2">
                {isFullyPaid ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Paid in Full</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Pending Balance</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bill To & Stay Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 border border-slate-200/50 p-6 rounded-xl">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Information</span>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="font-black text-slate-900 text-sm">{guestName}</p>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{guestEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{guestPhone}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold font-mono">
                  GUEST PROFILE ID: {guestId}
                </div>
              </div>
            </div>

            {resolvedBooking ? (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stay Information</span>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Accomodation</span>
                    <span className="font-bold text-slate-900">Room {roomNumber}</span>
                    <p className="text-[10px] text-slate-500 font-semibold">{roomType}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Duration</span>
                    <span className="font-bold text-slate-900">{nightsCount} {nightsCount === 1 ? "Night" : "Nights"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Check-In</span>
                    <span className="font-semibold text-slate-800">{resolvedBooking.checkInDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Check-Out</span>
                    <span className="font-semibold text-slate-800">{resolvedBooking.checkOutDate}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stay History Status</span>
                <p className="text-xs text-slate-600 font-medium">
                  Past stay guest account statement. Outstanding previous balances manually compiled in the ledgers.
                </p>
              </div>
            )}
          </div>

          {/* Charges Ledger Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itemized Stay Ledger</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[9px] tracking-wider">
                    <th className="p-4">Description</th>
                    <th className="p-4 text-center">Unit Price</th>
                    <th className="p-4 text-center">Qty / Nights</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Base Rent Charge */}
                  {resolvedBooking && baseRent > 0 && (
                    <tr className="text-slate-700">
                      <td className="p-4">
                        <span className="font-bold text-slate-900">Accomodation Nightly Tariff</span>
                        <p className="text-[10px] text-slate-400">Suite stay at Serene Suites {roomType} category</p>
                      </td>
                      <td className="p-4 text-center font-mono">
                        ₦{(roomPrice || (baseRent / nightsCount)).toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        {nightsCount}
                      </td>
                      <td className="p-4 text-right font-semibold font-mono text-slate-900">
                        ₦{baseRent.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {/* Incidentals / Extras */}
                  {extraChargesList.length > 0 ? (
                    extraChargesList.map((item, index) => (
                      <tr key={index} className="text-slate-700">
                        <td className="p-4">
                          <span className="font-bold text-slate-900">{item.description}</span>
                          <p className="text-[10px] text-slate-400">Incidental posted on {item.date}</p>
                        </td>
                        <td className="p-4 text-center font-mono">
                          ₦{item.amount.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          1
                        </td>
                        <td className="p-4 text-right font-semibold font-mono text-slate-900">
                          ₦{item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    !resolvedBooking && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400 italic">
                          No itemized incidentals found.
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments List */}
          {paymentsList.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payments Logged</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[9px] tracking-wider">
                      <th className="p-4">Payment ID</th>
                      <th className="p-4">Date Logged</th>
                      <th className="p-4">Method</th>
                      <th className="p-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentsList.map((pay, index) => (
                      <tr key={index} className="text-slate-600">
                        <td className="p-4 font-bold text-slate-900 font-mono">
                          {pay.id || `PAY-00${index + 1}`}
                        </td>
                        <td className="p-4">
                          {pay.date}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                            <CreditCard className="w-2.5 h-2.5" />
                            {pay.method}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-600">
                          -₦{pay.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoicing Totals Sheet */}
          <div className="flex justify-end pt-4">
            <div className="w-full sm:w-80 space-y-3 text-xs border-t-2 border-slate-900 pt-4">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal (Tariffs & Extras):</span>
                <span className="font-mono font-semibold text-slate-800">₦{grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Total Received Payments:</span>
                <span className="font-mono font-bold">-₦{totalPaid.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-3">
                <span>Invoice Balance Due:</span>
                <span className="font-mono text-slate-950">₦{balanceDue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="border-t border-slate-200 pt-8 text-center text-[10px] text-slate-400 font-medium leading-relaxed">
            <p>Thank you for choosing Serene Suites. We appreciate your patronage.</p>
            <p>All outstanding amounts are payable upon receipt or checkout. Late settlements incur operational interest charges.</p>
            <p className="font-bold text-slate-500 mt-2 font-mono uppercase tracking-widest text-[9px]">
              Computer Generated Invoice Statement - Official Copy
            </p>
          </div>

        </div>

        {/* Footer actions bar - Hidden on Print */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
          >
            Close Invoice
          </button>
          <button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice Document</span>
          </button>
        </div>

      </div>
    </div>
  );
}

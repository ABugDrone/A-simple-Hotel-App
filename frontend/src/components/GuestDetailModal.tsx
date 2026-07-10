import React from "react";
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  BedDouble, 
  Receipt, 
  Calendar, 
  CreditCard,
  Star,
  MapPin,
  FileText,
  TrendingUp
} from "lucide-react";
import { Guest, Booking, Room } from "../types";

interface GuestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest | null;
  bookings: Booking[];
  rooms: Room[];
}

export default function GuestDetailModal({
  isOpen,
  onClose,
  guest,
  bookings,
  rooms
}: GuestDetailModalProps) {
  if (!isOpen || !guest) return null;

  const guestBookings = bookings
    .filter(b => b.guestId === guest.id || b.guestName === guest.name)
    .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());

  const activeBooking = guestBookings.find(b => b.status === "Checked In");
  const latestBooking = guestBookings[0];

  const getActiveRoom = () => {
    if (!activeBooking) return null;
    return rooms.find(r => r.id === activeBooking.roomId) || null;
  };

  const activeRoom = getActiveRoom();

  const calculateBill = (booking: Booking) => {
    const roomCharge = booking.totalPrice;
    const extraCharges = booking.extraCharges || [];
    const payments = booking.payments || [];
    const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
    const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
    const totalBill = roomCharge + totalExtra;
    const outstanding = totalBill - totalPaid;
    return { roomCharge, totalExtra, totalPaid, totalBill, outstanding, extraCharges, payments };
  };

  const activeBill = activeBooking ? calculateBill(activeBooking) : null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto print:bg-white print:p-0 print:static print:h-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col my-8 print:my-0 print:border-none print:shadow-none print:w-full max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <span className="font-display font-medium text-sm">Guest Profile Details</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Guest Profile Header */}
          <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xl font-display flex-shrink-0">
              {guest.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-xl text-slate-900 leading-tight">
                  {guest.name}
                </h2>
                {guest.vipStatus && (
                  <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">{guest.id}</p>
              
              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{guest.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{guest.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Stay Info */}
          {activeBooking && activeRoom && (
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <BedDouble className="w-4 h-4" />
                <span>Currently Checked In</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Room</span>
                  <span className="text-sm font-bold text-slate-900">{activeRoom.roomNumber}</span>
                  <p className="text-[10px] text-slate-500 font-semibold">{activeRoom.type}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Check-In</span>
                  <span className="text-xs font-semibold text-slate-800">{activeBooking.checkInDate}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Check-Out</span>
                  <span className="text-xs font-semibold text-slate-800">{activeBooking.checkOutDate}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Booking ID</span>
                  <span className="text-xs font-mono font-semibold text-slate-800">{activeBooking.id}</span>
                </div>
              </div>

              {/* Active Bill Breakdown */}
              {activeBill && (
                <div className="mt-3 pt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Current Bill Summary</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">Room Charge</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">₦{activeBill.roomCharge.toLocaleString()}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">Extras</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">₦{activeBill.totalExtra.toLocaleString()}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">Paid</span>
                      <span className="text-xs font-bold text-emerald-600 font-mono">₦{activeBill.totalPaid.toLocaleString()}</span>
                    </div>
                    <div className={`p-2 rounded-lg border ${activeBill.outstanding > 0 ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"}`}>
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">Outstanding</span>
                      <span className={`text-xs font-black font-mono ${activeBill.outstanding > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                        ₦{activeBill.outstanding.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Extra charges list */}
                  {activeBill.extraCharges.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">Itemized Extra Charges</span>
                      {activeBill.extraCharges.map((charge) => (
                        <div key={charge.id} className="flex justify-between text-[10px] text-slate-600 bg-white p-1.5 rounded border border-slate-100">
                          <span className="font-semibold">{charge.description}</span>
                          <span className="font-mono font-bold">₦{charge.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payments list */}
                  {activeBill.payments.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">Payments Received</span>
                      {activeBill.payments.map((pay) => (
                        <div key={pay.id} className="flex justify-between text-[10px] text-emerald-700 bg-emerald-50/30 p-1.5 rounded border border-emerald-100/50">
                          <span className="font-semibold">{pay.method} - {pay.date}</span>
                          <span className="font-mono font-bold">-₦{pay.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* If no active stay */}
          {!activeBooking && (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-5 text-center">
              <BedDouble className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-semibold">No active stay currently checked in.</p>
            </div>
          )}

          {/* Stay History & Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Stay History & Account Summary</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-slate-200/60 p-3 rounded-lg text-center">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Visits</span>
                <span className="text-lg font-bold text-slate-900">{guest.visitCount}</span>
              </div>
              <div className="bg-white border border-slate-200/60 p-3 rounded-lg text-center">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Spend</span>
                <span className="text-lg font-bold text-slate-900">₦{guest.totalSpend.toLocaleString()}</span>
              </div>
              <div className={`border p-3 rounded-lg text-center ${(guest.debt || 0) > 0 ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"}`}>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Outstanding Debt</span>
                <span className={`text-lg font-black ${(guest.debt || 0) > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                  ₦{(guest.debt || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          {guestBookings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Recent Reservations</span>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {guestBookings.slice(0, 5).map((b) => {
                  const bill = calculateBill(b);
                  const statusColor = b.status === "Checked In" 
                    ? "bg-slate-900 text-white" 
                    : b.status === "Checked Out" 
                      ? "bg-slate-100 text-slate-600"
                      : b.status === "Cancelled"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-white text-slate-700 border border-slate-200";
                  
                  return (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-lg text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Room {b.roomNumber}</span>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${statusColor}`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {b.checkInDate} → {b.checkOutDate}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="font-bold text-slate-800 font-mono">₦{b.totalPrice.toLocaleString()}</span>
                        {bill.outstanding > 0 && (
                          <p className="text-[9px] text-rose-500 font-bold">₦{bill.outstanding.toLocaleString()} due</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          {guest.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Guest Notes & Preferences</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-4 text-xs text-slate-600 leading-relaxed">
                {guest.notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-lg text-xs transition-all cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
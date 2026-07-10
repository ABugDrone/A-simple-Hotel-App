import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Award, 
  Star, 
  FileText,
  BadgeDollarSign,
  Briefcase
} from "lucide-react";
import { Guest } from "../types";

interface GuestsProps {
  guests: Guest[];
}

export default function Guests({ guests }: GuestsProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterVip, setFilterVip] = useState<boolean>(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Search/Filter guest profiles
  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          g.phone.includes(searchTerm);
    const matchesFilter = !filterVip || g.vipStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-medium text-3xl tracking-tight text-slate-900">
            Guest Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track stay histories, loyalty statuses, total spend, and custom guest preferences.
          </p>
        </div>

        {/* Quick VIP switch */}
        <button
          id="btn-toggle-vip-filter"
          onClick={() => setFilterVip(!filterVip)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
            filterVip 
              ? "bg-slate-900 text-white border-slate-900" 
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Award className={`w-3.5 h-3.5 ${filterVip ? "text-amber-400" : "text-slate-400"}`} />
          <span>{filterVip ? "Showing VIP Only" : "Filter by VIP Loyalty"}</span>
        </button>
      </div>

      {/* Search Input bar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex items-center">
        <div className="relative flex-1 w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            id="search-guests"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guest names, emails, phones..."
            className="block w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          />
        </div>
      </div>

      {/* Grid: Profiles List & Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LISTINGS GRID */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
          {filteredGuests.length === 0 ? (
            <p className="col-span-2 py-12 text-center text-slate-400 font-medium text-xs">
              No guest profiles found on file.
            </p>
          ) : (
            filteredGuests.map((g) => (
              <div
                id={`guest-card-${g.id}`}
                key={g.id}
                onClick={() => setSelectedGuest(g)}
                className={`bg-white border rounded-xl p-5 hover:border-slate-400 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedGuest?.id === g.id ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"
                }`}
              >
                <div>
                  {/* Header: Name & VIP tag */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-sans font-bold text-base text-slate-900 leading-tight">
                        {g.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5 inline-block">{g.id}</span>
                    </div>
                    {g.vipStatus && (
                      <span className="bg-slate-900 text-white text-[9px] font-bold px-2.5 py-0.5 rounded border border-slate-900 flex items-center gap-1 uppercase tracking-wider">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        <span>VIP</span>
                      </span>
                    )}
                  </div>

                  {/* Contact details */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{g.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{g.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Foot stats */}
                <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  <span>{g.visitCount} visits</span>
                  <span className="font-bold text-slate-800">₦{g.totalSpend} spent</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DETAILS SIDE-DRAWER */}
        <div className="lg:col-span-1">
          {selectedGuest ? (
            <div id="guest-drawer" className="bg-white border border-slate-200 p-6 rounded-xl space-y-6 sticky top-28">
              {/* Profile Brief */}
              <div className="flex flex-col items-center text-center space-y-2 pb-5 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 text-slate-800 font-bold flex items-center justify-center text-2xl shadow-inner font-display">
                  {selectedGuest.name[0]}
                </div>
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-900 leading-tight">
                    {selectedGuest.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedGuest.id}</p>
                </div>

                {selectedGuest.vipStatus && (
                  <span className="bg-slate-900 text-white text-[9px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                    VIP Platinum Tier
                  </span>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200/60">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Stay History</div>
                  <span className="text-base font-bold text-slate-800 mt-1 inline-block">{selectedGuest.visitCount} visits</span>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200/60">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Ledger</div>
                  <span className="text-base font-bold text-slate-800 mt-1 inline-block">₦{selectedGuest.totalSpend}</span>
                </div>
              </div>

              {/* Preferences & Notes */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Concierge Preferences Logs</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/40 p-3 rounded-lg border border-slate-200/60">
                  {selectedGuest.notes || "No special room preferences, allergic concerns, or dietary requests noted on file."}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 border border-dashed border-slate-200 p-8 rounded-xl text-center text-slate-400 flex flex-col items-center justify-center h-80 sticky top-28">
              <Users className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold">Select a guest profile to view preferences and transaction history.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

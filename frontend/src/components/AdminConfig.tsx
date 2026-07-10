import React, { useState } from "react";
import { 
  Plus, 
  Settings, 
  BedDouble, 
  ShieldAlert, 
  Users, 
  Check, 
  DollarSign, 
  CheckSquare, 
  Square,
  AlertCircle,
  Save,
  Grid
} from "lucide-react";
import { Room, Staff } from "../types";

interface AdminConfigProps {
  rooms: Room[];
  onUpdateRoom: (roomId: string, updatedFields: Partial<Room>) => void;
  onAddRoom: (newRoom: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  staffList: Staff[];
  onUpdateStaff: (staffId: string, updatedFields: Partial<Staff>) => void;
  onAddStaff: (newStaff: Staff) => void;
  onAddLog: (type: "Booking" | "Housekeeping" | "System" | "Guest", message: string) => void;
  categories: string[];
  onAddCategory: (name: string) => void;
  onEditCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
}

export default function AdminConfig({
  rooms,
  onUpdateRoom,
  onAddRoom,
  onDeleteRoom,
  staffList,
  onUpdateStaff,
  onAddStaff,
  onAddLog,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory
}: AdminConfigProps) {
  const [activeSubTab, setActiveSubTab] = useState<"rooms" | "staff" | "categories">("rooms");

  // Room creation state
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomType, setNewRoomType] = useState<string>(categories[0] || "Standard");
  const [newRoomPrice, setNewRoomPrice] = useState("");
  const [newRoomFloor, setNewRoomFloor] = useState("1");
  const [newRoomAmenities, setNewRoomAmenities] = useState("");
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomSuccess, setRoomSuccess] = useState<string | null>(null);

  // Staff creation state
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffUsername, setNewStaffUsername] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<Staff["role"]>("Front Desk");
  const [newStaffAllowedTabs, setNewStaffAllowedTabs] = useState<string[]>([
    "overview",
    "rooms",
    "reservations"
  ]);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffSuccess, setStaffSuccess] = useState<string | null>(null);

  // Individual editable states for room prices & room numbers
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [editRoomType, setEditRoomType] = useState("");
  const [editRoomPrice, setEditRoomPrice] = useState("");
  const [editRoomFloor, setEditRoomFloor] = useState("");

  // Local confirmation states (replacing blocked native confirms)
  const [deleteConfirmRoomId, setDeleteConfirmRoomId] = useState<string | null>(null);
  const [deleteConfirmCategoryName, setDeleteConfirmCategoryName] = useState<string | null>(null);

  const tabOptions = [
    { id: "overview", label: "Dashboard" },
    { id: "rooms", label: "Rooms & Suites" },
    { id: "reservations", label: "Front Desk" },
    { id: "housekeeping", label: "Housekeeping" },
    { id: "guests", label: "Guest Directory" },
    { id: "billing", label: "Payments & Debt" },
    { id: "admin_config", label: "Admin Config" }
  ];

  // Category management states
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [editCategoryNewValue, setEditCategoryNewValue] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // Room type default prices for category-wide rate configuration
  const [adjustType, setAdjustType] = useState<string>(categories[0] || "Standard");
  const [adjustRate, setAdjustRate] = useState("");

  const handleApplyCategoryRate = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(adjustRate);
    if (isNaN(rate) || rate <= 0) {
      alert("Please specify a valid numeric price.");
      return;
    }

    rooms.forEach(r => {
      if (r.type === adjustType) {
        onUpdateRoom(r.id, { price: rate });
      }
    });

    onAddLog("System", `Administrator updated nightly rate for all ${adjustType} rooms to ₦${rate.toLocaleString()}`);
    setAdjustRate("");
    alert(`All ${adjustType} room prices have been updated to ₦${rate.toLocaleString()}`);
  };

  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRoomError(null);
    setRoomSuccess(null);

    if (!newRoomNumber.trim() || !newRoomPrice.trim()) {
      setRoomError("Please enter all required fields.");
      return;
    }

    // Check duplicate room number
    if (rooms.some(r => r.roomNumber === newRoomNumber.trim())) {
      setRoomError(`Room number ${newRoomNumber} already exists in the inventory.`);
      return;
    }

    const price = parseFloat(newRoomPrice);
    if (isNaN(price) || price <= 0) {
      setRoomError("Price must be a valid positive number.");
      return;
    }

    const floor = parseInt(newRoomFloor);
    if (isNaN(floor) || floor <= 0) {
      setRoomError("Floor must be a positive integer.");
      return;
    }

    const amenitiesList = newRoomAmenities
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const newRoom: Room = {
      id: Date.now().toString(),
      roomNumber: newRoomNumber.trim(),
      type: newRoomType,
      status: "Available",
      price,
      floor,
      amenities: amenitiesList.length > 0 ? amenitiesList : ["Standard Amenities", "Wi-Fi"]
    };

    onAddRoom(newRoom);
    onAddLog("System", `New Room ${newRoom.roomNumber} (${newRoom.type}) added to inventory on floor ${newRoom.floor}.`);
    setRoomSuccess(`Room ${newRoom.roomNumber} has been added successfully!`);
    
    // Reset fields
    setNewRoomNumber("");
    setNewRoomPrice("");
    setNewRoomAmenities("");
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);
    setStaffSuccess(null);

    if (!newStaffName.trim() || !newStaffUsername.trim()) {
      setStaffError("Please fill in the staff name and username.");
      return;
    }

    const formattedUsername = newStaffUsername.toLowerCase().trim().replace(/\s+/g, ".");

    if (staffList.some(s => s.username === formattedUsername)) {
      setStaffError(`Username '${formattedUsername}' is already taken.`);
      return;
    }

    const newStaff: Staff = {
      id: `S-${Date.now().toString().slice(-4)}`,
      name: newStaffName.trim(),
      username: formattedUsername,
      role: newStaffRole,
      allowedTabs: newStaffAllowedTabs
    };

    onAddStaff(newStaff);
    onAddLog("System", `New staff member ${newStaff.name} (${newStaff.role}) registered in system.`);
    setStaffSuccess(`Staff profile created successfully! Username is: ${newStaff.username}`);

    // Reset
    setNewStaffName("");
    setNewStaffUsername("");
    setNewStaffAllowedTabs(["overview", "rooms", "reservations"]);
  };

  const handleSaveRoomInline = (roomId: string) => {
    const rate = parseFloat(editRoomPrice);
    if (isNaN(rate) || rate <= 0) {
      alert("Invalid price entered.");
      return;
    }

    const floorVal = parseInt(editRoomFloor);
    if (isNaN(floorVal) || floorVal <= 0) {
      alert("Invalid floor entered.");
      return;
    }

    if (!editRoomNumber.trim()) {
      alert("Room number cannot be empty.");
      return;
    }

    // Check duplicate excluding itself
    const duplicate = rooms.some(r => r.id !== roomId && r.roomNumber === editRoomNumber.trim());
    if (duplicate) {
      alert(`Room number ${editRoomNumber} already exists.`);
      return;
    }

    onUpdateRoom(roomId, {
      roomNumber: editRoomNumber.trim(),
      type: editRoomType,
      price: rate,
      floor: floorVal
    });

    onAddLog("System", `Room parameters updated. ID: ${roomId} -> Room Number: ${editRoomNumber.trim()}, Category: ${editRoomType}, Price: ₦${rate.toLocaleString()}`);
    setEditingRoomId(null);
  };

  const handleToggleTabPermission = (staffId: string, tabId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;

    let updatedTabs: string[];
    if (staff.allowedTabs.includes(tabId)) {
      // Must have at least one permission
      if (staff.allowedTabs.length === 1) {
        alert("Each staff member must have access to at least 1 section.");
        return;
      }
      updatedTabs = staff.allowedTabs.filter(t => t !== tabId);
    } else {
      updatedTabs = [...staff.allowedTabs, tabId];
    }

    onUpdateStaff(staffId, { allowedTabs: updatedTabs });
    onAddLog("System", `Permissions adjusted for staff member ${staff.name}. Tab: ${tabId}`);
  };

  const handleUpdateStaffRole = (staffId: string, role: Staff["role"]) => {
    onUpdateStaff(staffId, { role });
    onAddLog("System", `Staff member role updated: ID: ${staffId} set to ${role}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            System Administration
          </span>
          <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-8 h-8 text-slate-800 animate-spin-slow" />
            <span>Admin Configuration Controls</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Configure system pricing variables, register suite layout changes, and manage active staff access levels.
          </p>
        </div>

        {/* View Selection Tab toggles */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab("rooms")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "rooms"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>Rooms & Rates</span>
          </button>
          <button
            onClick={() => setActiveSubTab("categories")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "categories"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Room Categories</span>
          </button>
          <button
            onClick={() => setActiveSubTab("staff")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === "staff"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Permissions</span>
          </button>
        </div>
      </div>

      {activeSubTab === "rooms" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Room Inventory list - taking 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-display font-semibold text-slate-900 text-base">Active Room Catalog</h3>
                  <p className="text-[11px] text-slate-400">Inline editing available for Room Numbers, Rates, and Floors.</p>
                </div>
                <span className="text-xs bg-slate-200/60 text-slate-700 px-2.5 py-1 rounded-full font-bold">
                  {rooms.length} Suites
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[9px] tracking-wider">
                      <th className="p-4">Room No</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-center">Floor</th>
                      <th className="p-4 text-right">Nightly Rate</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rooms.map((room) => {
                      const isEditing = editingRoomId === room.id;
                      return (
                        <tr key={room.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editRoomNumber}
                                onChange={(e) => setEditRoomNumber(e.target.value)}
                                className="w-16 px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900 font-bold"
                              />
                            ) : (
                              <span>Room {room.roomNumber}</span>
                            )}
                          </td>
                          <td className="p-4">
                            {isEditing ? (
                              <select
                                value={editRoomType}
                                onChange={(e) => setEditRoomType(e.target.value)}
                                className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900 font-semibold focus:outline-hidden"
                              >
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            ) : (
                              <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                room.type === "Penthouse" ? "bg-purple-100 text-purple-800" :
                                room.type === "Suite" ? "bg-amber-100 text-amber-800" :
                                room.type === "Deluxe" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"
                              }`}>
                                {room.type}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center font-semibold text-slate-600">
                            {isEditing ? (
                              <input
                                type="number"
                                min="1"
                                value={editRoomFloor}
                                onChange={(e) => setEditRoomFloor(e.target.value)}
                                className="w-12 px-2 py-1 border border-slate-300 rounded text-xs text-center"
                              />
                            ) : (
                              <span>Flr {room.floor}</span>
                            )}
                          </td>
                          <td className="p-4 text-right font-mono font-bold text-slate-900">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-slate-400">₦</span>
                                <input
                                  type="number"
                                  value={editRoomPrice}
                                  onChange={(e) => setEditRoomPrice(e.target.value)}
                                  className="w-24 px-2 py-1 border border-slate-300 rounded text-xs text-right font-mono"
                                />
                              </div>
                            ) : (
                              <span>₦{room.price.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleSaveRoomInline(room.id)}
                                  className="p-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded cursor-pointer transition-colors"
                                  title="Save Changes"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingRoomId(null)}
                                  className="p-1 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded cursor-pointer transition-colors text-[10px] px-1.5 font-bold"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingRoomId(room.id);
                                    setEditRoomNumber(room.roomNumber);
                                    setEditRoomType(room.type);
                                    setEditRoomPrice(room.price.toString());
                                    setEditRoomFloor(room.floor.toString());
                                  }}
                                  className="text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer hover:underline text-[10px]"
                                >
                                  Edit
                                </button>
                                <span className="text-slate-300 font-semibold">|</span>
                                {deleteConfirmRoomId === room.id ? (
                                  <div className="flex items-center gap-1.5 justify-center">
                                    <span className="text-[9px] text-slate-500 font-bold">Sure?</span>
                                    <button
                                      onClick={() => {
                                        onDeleteRoom(room.id);
                                        onAddLog("System", `Administrator deleted Room ${room.roomNumber} from the catalog.`);
                                        setDeleteConfirmRoomId(null);
                                      }}
                                      className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded px-1.5 py-0.5 text-[9px] cursor-pointer"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmRoomId(null)}
                                      className="border border-slate-300 hover:bg-slate-100 text-slate-500 font-extrabold rounded px-1.5 py-0.5 text-[9px] cursor-pointer"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmRoomId(room.id)}
                                    className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer hover:underline text-[10px]"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Configuration Right Forms panel */}
          <div className="space-y-6">
            
            {/* 1. Global Room category adjuster */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <h3 className="font-display font-bold text-slate-900 text-sm">Strategic Category Rates</h3>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed mb-4">
                Apply a dynamic rate adjustment to all rooms under a selected hospitality category simultaneously.
              </p>

              <form onSubmit={handleApplyCategoryRate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Room Category
                  </label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat} Suite/Room</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    New Rate (₦ per night)
                  </label>
                  <input
                    type="number"
                    value={adjustRate}
                    onChange={(e) => setAdjustRate(e.target.value)}
                    placeholder="e.g. 150000"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-colors uppercase tracking-wider"
                >
                  Apply Category Price Update
                </button>
              </form>
            </div>

            {/* 2. Add New Suite to Inventory */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-emerald-500" />
                <h3 className="font-display font-bold text-slate-900 text-sm">Register New Suite</h3>
              </div>

              {roomError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] p-3 rounded-lg mb-4 flex gap-1.5 items-start">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                  <span>{roomError}</span>
                </div>
              )}

              {roomSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-3 rounded-lg mb-4 flex gap-1.5 items-start">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                  <span>{roomSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddRoomSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      placeholder="e.g. 105"
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Suite Floor
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newRoomFloor}
                      onChange={(e) => setNewRoomFloor(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      value={newRoomType}
                      onChange={(e) => setNewRoomType(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Price Rate *
                    </label>
                    <input
                      type="number"
                      value={newRoomPrice}
                      onChange={(e) => setNewRoomPrice(e.target.value)}
                      placeholder="e.g. 125"
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Amenities (Comma separated)
                  </label>
                  <textarea
                    rows={2}
                    value={newRoomAmenities}
                    onChange={(e) => setNewRoomAmenities(e.target.value)}
                    placeholder="e.g. King Bed, Mini Bar, Ocean View Balcony"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-colors uppercase tracking-wider shadow-sm"
                >
                  Register New Room
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {activeSubTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Category Inventory - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-display font-semibold text-slate-900 text-base">Room Categories Catalog</h3>
                  <p className="text-[11px] text-slate-400">Manage available hospitality suites categories. Renaming a category updates all assigned rooms.</p>
                </div>
                <span className="text-xs bg-slate-200/60 text-slate-700 px-2.5 py-1 rounded-full font-bold">
                  {categories.length} Categories
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[9px] tracking-wider">
                      <th className="p-4">Category Name</th>
                      <th className="p-4 text-center">Assigned Rooms</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((cat) => {
                      const isEditing = editingCategoryName === cat;
                      const assignedRoomsCount = rooms.filter(r => r.type === cat).length;

                      return (
                        <tr key={cat} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editCategoryNewValue}
                                onChange={(e) => setEditCategoryNewValue(e.target.value)}
                                className="px-3 py-1 border border-slate-300 rounded text-xs bg-white text-slate-950 font-bold focus:outline-hidden"
                              />
                            ) : (
                              <span className="font-semibold text-slate-800 text-sm">{cat}</span>
                            )}
                          </td>
                          <td className="p-4 text-center font-semibold text-slate-600">
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-bold text-xs">
                              {assignedRoomsCount} {assignedRoomsCount === 1 ? "room" : "rooms"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    const val = editCategoryNewValue.trim();
                                    if (!val) {
                                      alert("Category name cannot be empty.");
                                      return;
                                    }
                                    if (categories.includes(val) && val !== cat) {
                                      alert("Category already exists.");
                                      return;
                                    }
                                    onEditCategory(cat, val);
                                    onAddLog("System", `Administrator renamed category "${cat}" to "${val}".`);
                                    setEditingCategoryName(null);
                                  }}
                                  className="p-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded cursor-pointer transition-colors"
                                  title="Save Rename"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingCategoryName(null)}
                                  className="p-1 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded cursor-pointer transition-colors text-[10px] px-1.5 font-bold"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => {
                                    setEditingCategoryName(cat);
                                    setEditCategoryNewValue(cat);
                                  }}
                                  className="text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer hover:underline text-[10px]"
                                >
                                  Rename
                                </button>
                                <span className="text-slate-300 font-semibold">|</span>
                                {deleteConfirmCategoryName === cat ? (
                                  <div className="flex items-center gap-1.5 justify-center">
                                    <span className="text-[9px] text-slate-500 font-bold">Sure?</span>
                                    <button
                                      onClick={() => {
                                        onDeleteCategory(cat);
                                        onAddLog("System", `Administrator deleted category "${cat}".`);
                                        setDeleteConfirmCategoryName(null);
                                      }}
                                      className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded px-1.5 py-0.5 text-[9px] cursor-pointer"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmCategoryName(null)}
                                      className="border border-slate-300 hover:bg-slate-100 text-slate-500 font-extrabold rounded px-1.5 py-0.5 text-[9px] cursor-pointer"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmCategoryName(cat)}
                                    className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer hover:underline text-[10px]"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Add Category Right Form */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-emerald-500" />
                <h3 className="font-display font-bold text-slate-900 text-sm">Create New Category</h3>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed mb-4">
                Define a new room/suite tier to customize inventory segmentation and default rate structures.
              </p>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = newCategoryInput.trim();
                  if (!val) return;
                  if (categories.some(c => c.toLowerCase() === val.toLowerCase())) {
                    alert("A category with this name already exists.");
                    return;
                  }
                  onAddCategory(val);
                  onAddLog("System", `Administrator created new room category: "${val}"`);
                  setNewCategoryInput("");
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="e.g. Executive, Cabana"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-colors uppercase tracking-wider"
                >
                  Create Category
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "staff" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Staff Access control grid layout - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-display font-semibold text-slate-900 text-base">Active Registered Staff Profiles</h3>
                  <p className="text-[11px] text-slate-400">Enable or restrict view panels directly for specific security logins.</p>
                </div>
                <span className="text-xs bg-slate-200/60 text-slate-700 px-2.5 py-1 rounded-full font-bold">
                  {staffList.length} Accounts
                </span>
              </div>

              <div className="p-6 divide-y divide-slate-100 space-y-6">
                {staffList.map((staff) => (
                  <div key={staff.id} className="pt-6 first:pt-0 flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{staff.name}</span>
                        <span className="text-[9px] font-mono bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                          @{staff.username}
                        </span>
                      </div>
                      
                      {/* Staff Role Selector */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span>Role:</span>
                        <select
                          value={staff.role}
                          onChange={(e) => handleUpdateStaffRole(staff.id, e.target.value as Staff["role"])}
                          className="bg-transparent border-none text-slate-800 font-bold p-0 pr-6 text-xs cursor-pointer hover:underline focus:ring-0"
                        >
                          <option value="Admin">Administrator</option>
                          <option value="Front Desk">Front Desk Agent</option>
                          <option value="Housekeeping">Housekeeping Supervisor</option>
                          <option value="Billing">Audit / Billing Accounts</option>
                        </select>
                      </div>

                      <div className="text-[10px] text-slate-400 font-bold">
                        STAFF SECURITY IDENTIFIER: {staff.id}
                      </div>
                    </div>

                    {/* Permission checkboxes layout */}
                    <div className="space-y-2 max-w-sm w-full">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Permitted Access Panels
                      </span>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/50 p-3 rounded-xl">
                        {tabOptions.map((opt) => {
                          const hasAccess = staff.allowedTabs.includes(opt.id);
                          return (
                            <button
                              id={`perm-toggle-${staff.id}-${opt.id}`}
                              key={opt.id}
                              onClick={() => handleToggleTabPermission(staff.id, opt.id)}
                              className="flex items-center gap-2 text-left cursor-pointer hover:text-slate-950 transition-colors py-1 group"
                            >
                              {hasAccess ? (
                                <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
                              )}
                              <span className={`text-[11px] font-medium ${
                                hasAccess ? "text-slate-900 font-semibold" : "text-slate-400"
                              }`}>
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Create Staff Form Panel */}
          <div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-emerald-500" />
                <h3 className="font-display font-bold text-slate-900 text-sm">Register Staff User</h3>
              </div>

              {staffError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] p-3 rounded-lg mb-4 flex gap-1.5 items-start">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                  <span>{staffError}</span>
                </div>
              )}

              {staffSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-3 rounded-lg mb-4 flex gap-1.5 items-start">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
                  <span>{staffSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddStaffSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    User Login Alias *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs">@</span>
                    <input
                      type="text"
                      value={newStaffUsername}
                      onChange={(e) => setNewStaffUsername(e.target.value)}
                      placeholder="elena.rostova"
                      className="block w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden text-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Default Profile Role
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as Staff["role"])}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden text-slate-900"
                  >
                    <option value="Admin">Administrator</option>
                    <option value="Front Desk">Front Desk Agent</option>
                    <option value="Housekeeping">Housekeeping Supervisor</option>
                    <option value="Billing">Audit / Billing Accounts</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Initial Panel Access Setup
                  </span>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/50 p-3 rounded-lg">
                    {tabOptions.map((opt) => {
                      const isPermitted = newStaffAllowedTabs.includes(opt.id);
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => {
                            if (isPermitted) {
                              setNewStaffAllowedTabs(newStaffAllowedTabs.filter(t => t !== opt.id));
                            } else {
                              setNewStaffAllowedTabs([...newStaffAllowedTabs, opt.id]);
                            }
                          }}
                          className="flex items-center gap-1.5 text-left text-xs cursor-pointer"
                        >
                          {isPermitted ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-300" />
                          )}
                          <span className={`text-[10px] ${isPermitted ? "text-slate-800 font-bold" : "text-slate-400"}`}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs cursor-pointer transition-colors uppercase tracking-wider"
                >
                  Create Staff Account
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

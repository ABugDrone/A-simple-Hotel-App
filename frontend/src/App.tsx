import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import Rooms from "./components/Rooms";
import FrontDesk from "./components/FrontDesk";
import Housekeeping from "./components/Housekeeping";
import Guests from "./components/Guests";
import Billing from "./components/Billing";
import AdminConfig from "./components/AdminConfig";
import Login from "./components/Login";
import SplashScreen from "./components/SplashScreen";

import { Room, Booking, Guest, OperationLog, Staff } from "./types";
import { INITIAL_ROOMS, INITIAL_BOOKINGS, INITIAL_GUESTS, INITIAL_LOGS } from "./data";
import { api, setToken, getToken } from "./api";

const INITIAL_STAFF: Staff[] = [
  {
    id: "S-101",
    username: "julian.marx",
    name: "Julian Marx",
    role: "Admin",
    allowedTabs: ["overview", "rooms", "reservations", "housekeeping", "guests", "billing", "admin_config"]
  },
  {
    id: "S-102",
    username: "robert.chen",
    name: "Robert Chen",
    role: "Front Desk",
    allowedTabs: ["overview", "rooms", "reservations", "guests", "billing"]
  },
  {
    id: "S-103",
    username: "sarah.jenkins",
    name: "Sarah Jenkins",
    role: "Housekeeping",
    allowedTabs: ["rooms", "housekeeping"]
  }
];

export default function App() {
  // Splash / Connection state
  const [splashStatus, setSplashStatus] = useState<"connecting" | "error" | "offline" | "done">("connecting");
  const [splashMessage, setSplashMessage] = useState<string>();
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const [currentView, setCurrentView] = useState<string>("overview");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<string[]>(["Standard", "Deluxe", "Suite", "Penthouse"]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);

  // PWA install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Restore auth token on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      api.verify().then((res: any) => {
        if (res.valid && res.staff) {
          setCurrentUser(res.staff);
          localStorage.setItem("gview_currentUser", JSON.stringify(res.staff));
        }
      }).catch(() => setToken(null));
    }
  }, []);

  // Connection check
  const checkConnection = useCallback(async () => {
    setSplashStatus("connecting");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await api.health();
      clearTimeout(timeout);
      if (res.status === "ok") {
        setIsBackendConnected(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Fetch all data from API
  const fetchAllData = useCallback(async () => {
    try {
      const [roomsData, bookingsData, guestsData, logsData, categoriesData, staffData] = await Promise.all([
        api.getRooms(),
        api.getBookings(),
        api.getGuests(),
        api.getLogs(),
        api.getCategories(),
        api.getStaff()
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
      setGuests(guestsData);
      setLogs(logsData);
      setCategories(categoriesData);
      setStaffList(staffData);

      localStorage.setItem("gview_rooms", JSON.stringify(roomsData));
      localStorage.setItem("gview_bookings", JSON.stringify(bookingsData));
      localStorage.setItem("gview_guests", JSON.stringify(guestsData));
      localStorage.setItem("gview_logs", JSON.stringify(logsData));
      localStorage.setItem("gview_categories", JSON.stringify(categoriesData));
      localStorage.setItem("gview_staff", JSON.stringify(staffData));
      return true;
    } catch {
      return false;
    }
  }, []);

  // Initial connection attempt
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const connected = await checkConnection();
      if (cancelled) return;
      if (connected) {
        const fetched = await fetchAllData();
        if (cancelled) return;
        if (fetched) {
          setSplashStatus("done");
          return;
        }
      }
      // Fallback to localStorage
      const storedRooms = localStorage.getItem("gview_rooms");
      const storedBookings = localStorage.getItem("gview_bookings");
      const storedGuests = localStorage.getItem("gview_guests");
      const storedLogs = localStorage.getItem("gview_logs");
      const storedStaff = localStorage.getItem("gview_staff");
      const storedCategories = localStorage.getItem("gview_categories");
      const storedCurrentUser = localStorage.getItem("gview_currentUser");

      if (storedRooms && storedBookings && storedGuests && storedLogs) {
        setRooms(JSON.parse(storedRooms));
        setBookings(JSON.parse(storedBookings));
        setGuests(JSON.parse(storedGuests));
        setLogs(JSON.parse(storedLogs));
        if (storedCategories) setCategories(JSON.parse(storedCategories));
        if (storedStaff) setStaffList(JSON.parse(storedStaff));
        if (storedCurrentUser) setCurrentUser(JSON.parse(storedCurrentUser));
        setSplashStatus(connected ? "done" : "offline");
      } else {
        setRooms(INITIAL_ROOMS);
        setBookings(INITIAL_BOOKINGS);
        setGuests(INITIAL_GUESTS);
        setLogs(INITIAL_LOGS);
        setStaffList(INITIAL_STAFF);
        localStorage.setItem("gview_rooms", JSON.stringify(INITIAL_ROOMS));
        localStorage.setItem("gview_bookings", JSON.stringify(INITIAL_BOOKINGS));
        localStorage.setItem("gview_guests", JSON.stringify(INITIAL_GUESTS));
        localStorage.setItem("gview_logs", JSON.stringify(INITIAL_LOGS));
        localStorage.setItem("gview_staff", JSON.stringify(INITIAL_STAFF));
        setSplashStatus(connected ? "done" : "offline");
      }
    }
    init();
    return () => { cancelled = true; };
  }, [checkConnection, fetchAllData]);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      });
    }
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
  };

  // Sync route safety
  useEffect(() => {
    if (currentUser && !currentUser.allowedTabs.includes(currentView)) {
      setCurrentView(currentUser.allowedTabs[0] || "overview");
    }
  }, [currentUser, currentView]);

  // Persistence helpers with API sync
  const persistRooms = useCallback((updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    localStorage.setItem("gview_rooms", JSON.stringify(updatedRooms));
  }, []);

  const persistBookings = useCallback((updatedBookings: Booking[]) => {
    setBookings(updatedBookings);
    localStorage.setItem("gview_bookings", JSON.stringify(updatedBookings));
  }, []);

  const persistGuests = useCallback((updatedGuests: Guest[]) => {
    setGuests(updatedGuests);
    localStorage.setItem("gview_guests", JSON.stringify(updatedGuests));
  }, []);

  const persistLogs = useCallback((updatedLogs: OperationLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem("gview_logs", JSON.stringify(updatedLogs));
  }, []);

  const persistCategories = useCallback((updatedCategories: string[]) => {
    setCategories(updatedCategories);
    localStorage.setItem("gview_categories", JSON.stringify(updatedCategories));
  }, []);

  // Central operational actions
  const handleAddLog = useCallback((type: OperationLog["type"], message: string) => {
    const newLog: OperationLog = {
      id: `L-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      staffMember: currentUser ? currentUser.name : "System"
    };
    setLogs(prev => [newLog, ...prev]);
    localStorage.setItem("gview_logs", JSON.stringify([newLog, ...logs]));
    if (isBackendConnected) {
      api.createLog(newLog).catch(() => {});
    }
  }, [currentUser, logs, isBackendConnected]);

  const handleUpdateStaff = useCallback((staffId: string, updatedFields: Partial<Staff>) => {
    setStaffList(prev => {
      const updated = prev.map(s => s.id === staffId ? { ...s, ...updatedFields } : s);
      localStorage.setItem("gview_staff", JSON.stringify(updated));
      if (isBackendConnected) api.updateStaff(staffId, updatedFields).catch(() => {});
      return updated;
    });
    if (currentUser && currentUser.id === staffId) {
      const updatedSelf = { ...currentUser, ...updatedFields };
      setCurrentUser(updatedSelf);
      localStorage.setItem("gview_currentUser", JSON.stringify(updatedSelf));
    }
  }, [currentUser, isBackendConnected]);

  const handleAddStaff = useCallback((newStaff: Staff) => {
    setStaffList(prev => {
      const updated = [...prev, newStaff];
      localStorage.setItem("gview_staff", JSON.stringify(updated));
      if (isBackendConnected) api.createStaff(newStaff).catch(() => {});
      return updated;
    });
  }, [isBackendConnected]);

  const handleAddRoom = useCallback((newRoom: Room) => {
    setRooms(prev => {
      const updated = [...prev, newRoom];
      localStorage.setItem("gview_rooms", JSON.stringify(updated));
      if (isBackendConnected) api.createRoom(newRoom).catch(() => {});
      return updated;
    });
  }, [isBackendConnected]);

  const handleDeleteRoom = useCallback((roomId: string) => {
    setRooms(prev => {
      const updated = prev.filter(r => r.id !== roomId);
      localStorage.setItem("gview_rooms", JSON.stringify(updated));
      if (isBackendConnected) api.deleteRoom(roomId).catch(() => {});
      return updated;
    });
  }, [isBackendConnected]);

  const handleAddCategory = useCallback((name: string) => {
    setCategories(prev => {
      if (prev.includes(name)) return prev;
      const updated = [...prev, name];
      localStorage.setItem("gview_categories", JSON.stringify(updated));
      if (isBackendConnected) api.createCategory(name).catch(() => {});
      return updated;
    });
  }, [isBackendConnected]);

  const handleEditCategory = useCallback((oldName: string, newName: string) => {
    setCategories(prev => {
      const updated = prev.map(c => c === oldName ? newName : c);
      localStorage.setItem("gview_categories", JSON.stringify(updated));
      if (isBackendConnected) api.updateCategory(oldName, newName).catch(() => {});
      return updated;
    });
    setRooms(prev => {
      const updated = prev.map(r => r.type === oldName ? { ...r, type: newName } : r);
      localStorage.setItem("gview_rooms", JSON.stringify(updated));
      return updated;
    });
  }, [isBackendConnected]);

  const handleDeleteCategory = useCallback((name: string) => {
    setCategories(prev => {
      const filtered = prev.filter(c => c !== name);
      const updated = filtered.length > 0 ? filtered : ["Standard"];
      localStorage.setItem("gview_categories", JSON.stringify(updated));
      if (isBackendConnected) api.deleteCategory(name).catch(() => {});
      return updated;
    });
    setCategories(prev => {
      const fallback = prev[0] || "Standard";
      setRooms(rooms => {
        const updated = rooms.map(r => r.type === name ? { ...r, type: fallback } : r);
        localStorage.setItem("gview_rooms", JSON.stringify(updated));
        return updated;
      });
      return prev;
    });
  }, [isBackendConnected]);

  const handleLogin = useCallback((staff: Staff) => {
    setCurrentUser(staff);
    localStorage.setItem("gview_currentUser", JSON.stringify(staff));
    const newLog: OperationLog = {
      id: `L-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      type: "System",
      message: `Staff member ${staff.name} (${staff.role}) successfully authenticated. Portal session initiated.`,
      staffMember: staff.name
    };
    setLogs(prev => [newLog, ...prev]);
    if (isBackendConnected) api.createLog(newLog).catch(() => {});
    const target = staff.allowedTabs.includes("overview") ? "overview" : staff.allowedTabs[0] || "rooms";
    setCurrentView(target);
  }, [isBackendConnected]);

  const handleLogout = useCallback(() => {
    if (currentUser) {
      const newLog: OperationLog = {
        id: `L-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        type: "System",
        message: `Staff member ${currentUser.name} signed out. Portal session terminated safely.`,
        staffMember: currentUser.name
      };
      setLogs(prev => [newLog, ...prev]);
      if (isBackendConnected) api.createLog(newLog).catch(() => {});
    }
    setCurrentUser(null);
    localStorage.removeItem("gview_currentUser");
    setToken(null);
  }, [currentUser, isBackendConnected]);

  const handleUpdateRoom = useCallback((roomId: string, updatedFields: Partial<Room>) => {
    setRooms(prev => {
      const updated = prev.map(room => room.id === roomId ? { ...room, ...updatedFields } : room);
      localStorage.setItem("gview_rooms", JSON.stringify(updated));
      if (isBackendConnected) api.updateRoom(roomId, updatedFields).catch(() => {});
      return updated;
    });
  }, [isBackendConnected]);

  const handleUpdateRoomStatus = useCallback((roomId: string, status: Room["status"]) => {
    handleUpdateRoom(roomId, { status });
  }, [handleUpdateRoom]);

  const handleAddBooking = useCallback((newBooking: Booking) => {
    setBookings(prev => {
      const updated = [newBooking, ...prev];
      localStorage.setItem("gview_bookings", JSON.stringify(updated));
      if (isBackendConnected) api.createBooking(newBooking).catch(() => {});
      return updated;
    });
  }, [isBackendConnected]);

  const handleAddGuest = useCallback((newGuest: Guest) => {
    setGuests(prev => {
      const updated = [newGuest, ...prev];
      localStorage.setItem("gview_guests", JSON.stringify(updated));
      if (isBackendConnected) api.createGuest(newGuest).catch(() => {});
      return updated;
    });
  }, [isBackendConnected]);

  const handleUpdateBookingStatus = useCallback((bookingId: string, status: Booking["status"]) => {
    setBookings(prev => {
      const updated = prev.map(b => b.id === bookingId ? { ...b, status } : b);
      localStorage.setItem("gview_bookings", JSON.stringify(updated));
      if (isBackendConnected) api.updateBooking(bookingId, { status }).catch(() => {});
      return updated;
    });
  }, [isBackendConnected]);

  const handleUpdateBooking = useCallback((bookingId: string, updatedFields: Partial<Booking>) => {
    setBookings(prev => {
      const updated = prev.map(b => b.id === bookingId ? { ...b, ...updatedFields } : b);
      localStorage.setItem("gview_bookings", JSON.stringify(updated));
      if (isBackendConnected) api.updateBooking(bookingId, updatedFields).catch(() => {});
      return updated;
    });
  }, [isBackendConnected]);

  const handleUpdateGuest = useCallback((guestId: string, updatedFields: Partial<Guest>) => {
    setGuests(prev => {
      const updated = prev.map(g => g.id === guestId ? { ...g, ...updatedFields } : g);
      localStorage.setItem("gview_guests", JSON.stringify(updated));
      if (isBackendConnected) api.updateGuest(guestId, updatedFields).catch(() => {});
      return updated;
    });
  }, [isBackendConnected]);

  const handleCheckOutBooking = useCallback((bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const updatedBookings = bookings.map(b =>
      b.id === bookingId ? { ...b, status: "Checked Out" as const } : b
    );
    persistBookings(updatedBookings);
    handleUpdateRoomStatus(booking.roomId, "Cleaning");

    const roomCharge = booking.totalPrice;
    const extraCharges = booking.extraCharges || [];
    const payments = booking.payments || [];
    const totalExtra = extraCharges.reduce((sum, item) => sum + item.amount, 0);
    const totalPaid = payments.reduce((sum, item) => sum + item.amount, 0);
    const totalStayCost = roomCharge + totalExtra;
    const balance = totalStayCost - totalPaid;

    const updatedGuests = guests.map(g => {
      if (g.id === booking.guestId || g.name === booking.guestName) {
        const currentDebt = g.debt || 0;
        const newDebt = balance > 0 ? currentDebt + balance : currentDebt;
        return { ...g, debt: newDebt, totalSpend: (g.totalSpend || 0) + totalPaid };
      }
      return g;
    });
    persistGuests(updatedGuests);

    if (isBackendConnected) {
      api.updateBooking(bookingId, { status: "Checked Out" }).catch(() => {});
      api.updateRoom(booking.roomId, { status: "Cleaning" }).catch(() => {});
      const updatedGuest = updatedGuests.find(g => g.id === booking.guestId);
      if (updatedGuest) api.updateGuest(booking.guestId, { debt: updatedGuest.debt, totalSpend: updatedGuest.totalSpend }).catch(() => {});
    }

    if (balance > 0) {
      handleAddLog("Booking",
        `Guest ${booking.guestName} checked out of Room ${booking.roomNumber} with unpaid balance of N${balance.toLocaleString()}. Outstanding balance registered to Guest Debt Account (New total debt: N${(updatedGuests.find(g => g.name === booking.guestName)?.debt || 0).toLocaleString()}). Room marked for Housekeeping.`
      );
    } else {
      handleAddLog("Booking",
        `Guest ${booking.guestName} checked out of Room ${booking.roomNumber} fully settled. Room marked for Housekeeping.`
      );
    }
  }, [bookings, guests, persistBookings, persistGuests, handleUpdateRoomStatus, handleAddLog, isBackendConnected]);

  const handleApplyNewRate = useCallback((roomType: string, newRate: number) => {
    setRooms(prev => {
      const updated = prev.map(r => r.type === roomType ? { ...r, price: newRate } : r);
      localStorage.setItem("gview_rooms", JSON.stringify(updated));
      return updated;
    });
    handleAddLog("System",
      `Dynamic rate adjustment applied: All ${roomType} category suites standard price set to N${newRate}.`
    );
  }, [handleAddLog]);

  // Occupancy
  const totalRoomsCount = rooms.length;
  const occupiedRoomsCount = rooms.filter(r => r.status === "Occupied").length;
  const occupancyPercent = totalRoomsCount > 0 ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) : 0;

  const renderView = () => {
    switch (currentView) {
      case "overview":
        return <Overview rooms={rooms} bookings={bookings} logs={logs} onViewChange={setCurrentView} />;
      case "rooms":
        return (
          <Rooms
            rooms={rooms}
            bookings={bookings}
            guests={guests}
            onUpdateRoom={handleUpdateRoom}
            onUpdateBooking={handleUpdateBooking}
            onUpdateGuest={handleUpdateGuest}
            onAddLog={handleAddLog}
          />
        );
      case "reservations":
        return (
          <FrontDesk
            bookings={bookings}
            rooms={rooms}
            guests={guests}
            onAddBooking={handleAddBooking}
            onAddGuest={handleAddGuest}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onUpdateBooking={handleUpdateBooking}
            onUpdateRoomStatus={handleUpdateRoomStatus}
            onAddLog={handleAddLog}
            onCheckOutBooking={handleCheckOutBooking}
            onUpdateGuest={handleUpdateGuest}
          />
        );
      case "housekeeping":
        return <Housekeeping rooms={rooms} onUpdateRoomStatus={handleUpdateRoomStatus} onAddLog={handleAddLog} />;
      case "guests":
        return <Guests guests={guests} />;
      case "billing":
        return (
          <Billing
            guests={guests}
            bookings={bookings}
            rooms={rooms}
            onUpdateBooking={handleUpdateBooking}
            onUpdateGuest={handleUpdateGuest}
            onAddLog={handleAddLog}
          />
        );
      case "admin_config":
        return (
          <AdminConfig
            rooms={rooms}
            onUpdateRoom={handleUpdateRoom}
            onAddRoom={handleAddRoom}
            onDeleteRoom={handleDeleteRoom}
            staffList={staffList}
            onUpdateStaff={handleUpdateStaff}
            onAddStaff={handleAddStaff}
            onAddLog={handleAddLog}
            categories={categories}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      default:
        return <div className="p-8 text-slate-500 font-semibold text-center">View loading...</div>;
    }
  };

  // Show splash while connecting
  if (splashStatus !== "done") {
    return (
      <SplashScreen
        status={splashStatus}
        message={splashMessage}
        onRetry={() => {
          setSplashStatus("connecting");
          checkConnection().then(connected => {
            if (connected) {
              fetchAllData().then(fetched => {
                setSplashStatus(fetched ? "done" : "offline");
              });
            } else {
              setSplashStatus("error");
              setSplashMessage("Server not reachable. Make sure the backend is running.");
            }
          });
        }}
        onContinueOffline={() => {
          setSplashStatus("done");
        }}
      />
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} staffList={staffList} isBackendConnected={isBackendConnected} />;
  }

  return (
    <div className="flex bg-slate-50 text-slate-800 min-h-screen">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        occupancyPercent={occupancyPercent}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {renderView()}
      </main>

      {/* PWA Install Banner */}
      <div className={`pwa-install-banner ${showInstallBanner ? "show" : ""}`}>
        <span>Install Hotel Manager for offline access</span>
        <div className="flex gap-2">
          <button className="dismiss" onClick={dismissInstallBanner}>Not now</button>
          <button onClick={handleInstallPWA}>Install</button>
        </div>
      </div>
    </div>
  );
}

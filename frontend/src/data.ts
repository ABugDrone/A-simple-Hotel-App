import { Room, Guest, Booking, OperationLog } from "./types";

export const INITIAL_ROOMS: Room[] = [
  {
    id: "101",
    roomNumber: "101",
    type: "Standard",
    status: "Occupied",
    price: 120,
    floor: 1,
    amenities: ["Queen Bed", "High-speed Wi-Fi", "Work Desk", "Smart TV"]
  },
  {
    id: "102",
    roomNumber: "102",
    type: "Standard",
    status: "Available",
    price: 120,
    floor: 1,
    amenities: ["Queen Bed", "High-speed Wi-Fi", "Work Desk", "Smart TV"]
  },
  {
    id: "103",
    roomNumber: "103",
    type: "Standard",
    status: "Cleaning",
    price: 125,
    floor: 1,
    amenities: ["Double Queen Beds", "High-speed Wi-Fi", "Coffee Maker", "Smart TV"]
  },
  {
    id: "104",
    roomNumber: "104",
    type: "Standard",
    status: "Maintenance",
    price: 120,
    floor: 1,
    amenities: ["Queen Bed", "High-speed Wi-Fi", "Work Desk", "Smart TV"]
  },
  {
    id: "201",
    roomNumber: "201",
    type: "Deluxe",
    status: "Occupied",
    price: 180,
    floor: 2,
    amenities: ["King Bed", "Ocean View Balcony", "Mini Bar", "Coffee Maker", "Luxury Robes"]
  },
  {
    id: "202",
    roomNumber: "202",
    type: "Deluxe",
    status: "Available",
    price: 180,
    floor: 2,
    amenities: ["King Bed", "Ocean View Balcony", "Mini Bar", "Coffee Maker", "Luxury Robes"]
  },
  {
    id: "203",
    roomNumber: "203",
    type: "Deluxe",
    status: "Cleaning",
    price: 185,
    floor: 2,
    amenities: ["Double Queen Beds", "Ocean View", "Mini Bar", "Espresso Machine"]
  },
  {
    id: "204",
    roomNumber: "204",
    type: "Deluxe",
    status: "Available",
    price: 180,
    floor: 2,
    amenities: ["King Bed", "Ocean View Balcony", "Mini Bar", "Coffee Maker", "Luxury Robes"]
  },
  {
    id: "301",
    roomNumber: "301",
    type: "Suite",
    status: "Occupied",
    price: 320,
    floor: 3,
    amenities: ["Separate Living Room", "Jacuzzi Tub", "Private Balcony", "Espresso Machine", "Butler Service"]
  },
  {
    id: "302",
    roomNumber: "302",
    type: "Suite",
    status: "Available",
    price: 320,
    floor: 3,
    amenities: ["Separate Living Room", "Jacuzzi Tub", "Private Balcony", "Espresso Machine", "In-room Safe"]
  },
  {
    id: "303",
    roomNumber: "303",
    type: "Suite",
    status: "Available",
    price: 320,
    floor: 3,
    amenities: ["Separate Living Room", "Jacuzzi Tub", "Private Balcony", "Espresso Machine", "In-room Safe"]
  },
  {
    id: "304",
    roomNumber: "304",
    type: "Penthouse",
    status: "Occupied",
    price: 650,
    floor: 3,
    amenities: ["360 Panoramic View", "Private Rooftop Pool", "Personal Chef Space", "Full Kitchen", "Dedicated Concierge"]
  }
];

export const INITIAL_GUESTS: Guest[] = [
  {
    id: "G-101",
    name: "Eleanor Vance",
    email: "eleanor.v@domain.com",
    phone: "+1 (555) 234-5678",
    vipStatus: true,
    notes: "Prefers high floors, allergic to feather pillows. Always orders sparkling water.",
    visitCount: 5,
    totalSpend: 2450,
    debt: 4500
  },
  {
    id: "G-102",
    name: "Marcus Aurelius",
    email: "marcus.a@stoic.org",
    phone: "+1 (555) 876-5432",
    vipStatus: false,
    notes: "Requires late checkout when possible. Very quiet guest.",
    visitCount: 2,
    totalSpend: 720,
    debt: 0
  },
  {
    id: "G-103",
    name: "Samantha Sterling",
    email: "samantha@sterling-co.com",
    phone: "+1 (555) 901-2345",
    vipStatus: true,
    notes: "Corporate partner. Requires ultra high-speed internet. Bill to company account.",
    visitCount: 12,
    totalSpend: 6200,
    debt: 0
  },
  {
    id: "G-104",
    name: "Julian Barnes",
    email: "julian.b@author.net",
    phone: "+1 (555) 432-1098",
    vipStatus: false,
    notes: "Travel writer. Wants quiet corner rooms. Prefers printed bill.",
    visitCount: 1,
    totalSpend: 360,
    debt: 1200
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "B-1001",
    roomId: "101",
    roomNumber: "101",
    guestId: "G-102",
    guestName: "Marcus Aurelius",
    checkInDate: "2026-07-04",
    checkOutDate: "2026-07-08",
    status: "Checked In",
    totalPrice: 480,
    notes: "Requested a quiet study desk"
  },
  {
    id: "B-1002",
    roomId: "201",
    roomNumber: "201",
    guestId: "G-101",
    guestName: "Eleanor Vance",
    checkInDate: "2026-07-05",
    checkOutDate: "2026-07-10",
    status: "Checked In",
    totalPrice: 900,
    notes: "Feather-free pillows confirmed."
  },
  {
    id: "B-1003",
    roomId: "301",
    roomNumber: "301",
    guestId: "G-103",
    guestName: "Samantha Sterling",
    checkInDate: "2026-07-06",
    checkOutDate: "2026-07-12",
    status: "Checked In",
    totalPrice: 1920,
    notes: "Welcome gift basket delivered."
  },
  {
    id: "B-1004",
    roomId: "304",
    roomNumber: "304",
    guestId: "G-104",
    guestName: "Julian Barnes",
    checkInDate: "2026-07-01",
    checkOutDate: "2026-07-05",
    status: "Checked Out",
    totalPrice: 2600,
    notes: "Left a great feedback note."
  },
  {
    id: "B-1005",
    roomId: "102",
    roomNumber: "102",
    guestId: "G-104",
    guestName: "Julian Barnes",
    checkInDate: "2026-07-08",
    checkOutDate: "2026-07-11",
    status: "Upcoming",
    totalPrice: 360
  }
];

export const INITIAL_LOGS: OperationLog[] = [
  {
    id: "L-201",
    timestamp: "2026-07-06T08:15:00-07:00",
    type: "Booking",
    message: "New booking B-1005 created for Guest Julian Barnes in Room 102.",
    staffMember: "Robert Chen"
  },
  {
    id: "L-202",
    timestamp: "2026-07-06T09:00:00-07:00",
    type: "Housekeeping",
    message: "Room 103 status changed to Cleaning.",
    staffMember: "Elena Rostova"
  },
  {
    id: "L-203",
    timestamp: "2026-07-06T10:30:00-07:00",
    type: "Guest",
    message: "Checked out booking B-1004 for Julian Barnes (Room 304). Total invoice: ₦2,600.",
    staffMember: "Robert Chen"
  },
  {
    id: "L-204",
    timestamp: "2026-07-06T11:15:00-07:00",
    type: "Housekeeping",
    message: "Room 203 status changed to Cleaning after Guest checkout.",
    staffMember: "Elena Rostova"
  },
  {
    id: "L-205",
    timestamp: "2026-07-06T12:00:00-07:00",
    type: "Booking",
    message: "Checked in booking B-1003 for Samantha Sterling in Suite 301.",
    staffMember: "Sarah Jenkins"
  }
];

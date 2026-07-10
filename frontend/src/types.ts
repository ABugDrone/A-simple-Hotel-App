export interface Room {
  id: string;
  roomNumber: string;
  type: string;
  status: "Available" | "Occupied" | "Cleaning" | "Maintenance";
  price: number;
  floor: number;
  amenities: string[];
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  vipStatus: boolean;
  notes: string;
  visitCount: number;
  totalSpend: number;
  debt?: number; // Optional debt balance
}

export interface Booking {
  id: string;
  roomId: string;
  roomNumber: string;
  guestId: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: "Upcoming" | "Checked In" | "Checked Out" | "Cancelled";
  totalPrice: number;
  notes?: string;
  extraCharges?: Array<{ id: string; description: string; amount: number; date: string }>;
  payments?: Array<{ id: string; amount: number; method: string; date: string }>;
}

export interface OperationLog {
  id: string;
  timestamp: string;
  type: "Booking" | "Housekeeping" | "System" | "Guest";
  message: string;
  staffMember: string;
}

export interface Staff {
  id: string;
  username: string;
  name: string;
  role: "Admin" | "Front Desk" | "Housekeeping" | "Billing";
  allowedTabs: string[]; // List of tab IDs this staff member can access
}


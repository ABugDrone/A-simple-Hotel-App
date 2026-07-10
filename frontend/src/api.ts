const API_BASE = "/api";

let authToken: string | null = localStorage.getItem("hotel_auth_token");

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem("hotel_auth_token", token);
  else localStorage.removeItem("hotel_auth_token");
}

export function getToken() {
  return authToken;
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    setToken(null);
    throw new Error("Session expired");
  }
  return res.json();
}

export const api = {
  health: () => fetch(`${API_BASE}/health`).then(r => r.json()),

  login: (username: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  verify: () => request("/auth/verify"),

  getRooms: () => request("/rooms"),
  updateRoom: (id: string, data: any) => request(`/rooms/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  createRoom: (data: any) => request("/rooms", { method: "POST", body: JSON.stringify(data) }),
  deleteRoom: (id: string) => request(`/rooms/${id}`, { method: "DELETE" }),

  getGuests: () => request("/guests"),
  updateGuest: (id: string, data: any) => request(`/guests/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  createGuest: (data: any) => request("/guests", { method: "POST", body: JSON.stringify(data) }),

  getBookings: () => request("/bookings"),
  updateBooking: (id: string, data: any) => request(`/bookings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  createBooking: (data: any) => request("/bookings", { method: "POST", body: JSON.stringify(data) }),

  getLogs: () => request("/logs"),
  createLog: (data: any) => request("/logs", { method: "POST", body: JSON.stringify(data) }),

  getCategories: () => request("/categories"),
  createCategory: (name: string) => request("/categories", { method: "POST", body: JSON.stringify({ name }) }),
  updateCategory: (oldName: string, newName: string) => request(`/categories/${encodeURIComponent(oldName)}`, { method: "PUT", body: JSON.stringify({ newName }) }),
  deleteCategory: (name: string) => request(`/categories/${encodeURIComponent(name)}`, { method: "DELETE" }),

  getStaff: () => request("/staff"),
  updateStaff: (id: string, data: any) => request(`/staff/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  createStaff: (data: any) => request("/staff", { method: "POST", body: JSON.stringify(data) })
};

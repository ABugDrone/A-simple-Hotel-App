import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import { getDb, dbRun, dbAll, dbGet, closeDb } from "./db.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const JWT_SECRET = process.env.JWT_SECRET || "hotel-secret-key-change-in-production";

app.use(cors());
app.use(express.json());

function authenticate(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ─── Health ──────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Auth ────────────────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    const d = await getDb();
    const staff = dbGet<any>(d, "SELECT * FROM staff WHERE username = ?", [username]);
    if (!staff || !bcrypt.compareSync(password, staff.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const payload = {
      id: staff.id, username: staff.username, name: staff.name,
      role: staff.role, allowedTabs: JSON.parse(staff.allowedTabs),
      passwordChanged: !!staff.passwordChanged
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, staff: payload });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/auth/verify", authenticate, (req, res) => {
  res.json({ valid: true, staff: req.user });
});

app.put("/api/auth/change-password", authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new passwords required" });
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ error: "New password must be at least 4 characters" });
    }
    const d = await getDb();
    const staff = dbGet<any>(d, "SELECT * FROM staff WHERE id = ?", [req.user.id]);
    if (!staff || !bcrypt.compareSync(oldPassword, staff.password)) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    const hashed = bcrypt.hashSync(newPassword, 10);
    dbRun(d, "UPDATE staff SET password = ?, passwordChanged = 1 WHERE id = ?", [hashed, req.user.id]);
    const payload = {
      id: staff.id, username: staff.username, name: staff.name,
      role: staff.role, allowedTabs: JSON.parse(staff.allowedTabs),
      passwordChanged: true
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, staff: payload });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Rooms ───────────────────────────────────────────────
app.get("/api/rooms", async (_req, res) => {
  try {
    const d = await getDb();
    const rooms = dbAll<any>(d, "SELECT * FROM rooms");
    res.json(rooms.map(r => ({ ...r, amenities: JSON.parse(r.amenities) })));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/rooms/:id", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    const fields = req.body;
    const sets: string[] = [];
    const vals: any[] = [];
    if (fields.status !== undefined) { sets.push("status = ?"); vals.push(fields.status); }
    if (fields.price !== undefined) { sets.push("price = ?"); vals.push(fields.price); }
    if (fields.type !== undefined) { sets.push("type = ?"); vals.push(fields.type); }
    if (fields.amenities !== undefined) { sets.push("amenities = ?"); vals.push(JSON.stringify(fields.amenities)); }
    if (fields.roomNumber !== undefined) { sets.push("roomNumber = ?"); vals.push(fields.roomNumber); }
    if (fields.floor !== undefined) { sets.push("floor = ?"); vals.push(fields.floor); }
    if (sets.length === 0) return res.json({ updated: false });
    vals.push(req.params.id);
    dbRun(d, `UPDATE rooms SET ${sets.join(", ")} WHERE id = ?`, vals);
    const room = dbGet<any>(d, "SELECT * FROM rooms WHERE id = ?", [req.params.id]);
    res.json({ ...room, amenities: JSON.parse(room.amenities) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/rooms", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    const { id, roomNumber, type, floor, price, status, amenities } = req.body;
    dbRun(d, "INSERT INTO rooms VALUES (?,?,?,?,?,?,?)", [id, roomNumber, type, floor, price, status || "Available", JSON.stringify(amenities || [])]);
    const room = dbGet<any>(d, "SELECT * FROM rooms WHERE id = ?", [id]);
    res.json({ ...room, amenities: JSON.parse(room.amenities) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/rooms/:id", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    dbRun(d, "DELETE FROM rooms WHERE id = ?", [req.params.id]);
    res.json({ deleted: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Categories ──────────────────────────────────────────
app.get("/api/categories", async (_req, res) => {
  try {
    const d = await getDb();
    const rows = dbAll<any>(d, "SELECT name FROM categories");
    res.json(rows.map(r => r.name));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/categories", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    const { name } = req.body;
    dbRun(d, "INSERT OR IGNORE INTO categories VALUES (?)", [name]);
    const rows = dbAll<any>(d, "SELECT name FROM categories");
    res.json(rows.map(r => r.name));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/categories/:name", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    const { newName } = req.body;
    dbRun(d, "UPDATE categories SET name = ? WHERE name = ?", [newName, req.params.name]);
    const rows = dbAll<any>(d, "SELECT name FROM categories");
    res.json(rows.map(r => r.name));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/categories/:name", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    dbRun(d, "DELETE FROM categories WHERE name = ?", [req.params.name]);
    const rows = dbAll<any>(d, "SELECT name FROM categories");
    res.json(rows.map(r => r.name));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Guests ──────────────────────────────────────────────
app.get("/api/guests", async (_req, res) => {
  try {
    const d = await getDb();
    const guests = dbAll<any>(d, "SELECT * FROM guests");
    res.json(guests.map(g => ({ ...g, vipStatus: !!g.vipStatus })));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/guests/:id", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    const fields = req.body;
    const sets: string[] = [];
    const vals: any[] = [];
    for (const key of ["name","email","phone","notes","visitCount","totalSpend","debt"]) {
      if (fields[key] !== undefined) { sets.push(`${key} = ?`); vals.push(fields[key]); }
    }
    if (fields.vipStatus !== undefined) { sets.push("vipStatus = ?"); vals.push(fields.vipStatus ? 1 : 0); }
    if (sets.length === 0) return res.json({ updated: false });
    vals.push(req.params.id);
    dbRun(d, `UPDATE guests SET ${sets.join(", ")} WHERE id = ?`, vals);
    const guest = dbGet<any>(d, "SELECT * FROM guests WHERE id = ?", [req.params.id]);
    res.json({ ...guest, vipStatus: !!guest.vipStatus });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/guests", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    const { id, name, email, phone, vipStatus, notes, visitCount, totalSpend, debt } = req.body;
    dbRun(d, "INSERT INTO guests VALUES (?,?,?,?,?,?,?,?,?)", [id, name, email, phone, vipStatus ? 1 : 0, notes || "", visitCount || 1, totalSpend || 0, debt || 0]);
    const guest = dbGet<any>(d, "SELECT * FROM guests WHERE id = ?", [id]);
    res.json({ ...guest, vipStatus: !!guest.vipStatus });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Bookings ────────────────────────────────────────────
app.get("/api/bookings", async (_req, res) => {
  try {
    const d = await getDb();
    const bookings = dbAll<any>(d, "SELECT * FROM bookings");
    res.json(bookings.map(b => ({ ...b, extraCharges: JSON.parse(b.extraCharges || "[]"), payments: JSON.parse(b.payments || "[]") })));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/bookings/:id", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    const fields = req.body;
    const sets: string[] = [];
    const vals: any[] = [];
    for (const key of ["status","totalPrice","notes","guestName","checkInDate","checkOutDate","roomNumber","roomId","guestId"]) {
      if (fields[key] !== undefined) { sets.push(`${key} = ?`); vals.push(fields[key]); }
    }
    if (fields.extraCharges !== undefined) { sets.push("extraCharges = ?"); vals.push(JSON.stringify(fields.extraCharges)); }
    if (fields.payments !== undefined) { sets.push("payments = ?"); vals.push(JSON.stringify(fields.payments)); }
    if (sets.length === 0) return res.json({ updated: false });
    vals.push(req.params.id);
    dbRun(d, `UPDATE bookings SET ${sets.join(", ")} WHERE id = ?`, vals);
    const b = dbGet<any>(d, "SELECT * FROM bookings WHERE id = ?", [req.params.id]);
    res.json({ ...b, extraCharges: JSON.parse(b.extraCharges || "[]"), payments: JSON.parse(b.payments || "[]") });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/bookings", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    const b = req.body;
    dbRun(d, "INSERT INTO bookings VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [b.id, b.roomId, b.roomNumber, b.guestId, b.guestName, b.checkInDate, b.checkOutDate, b.status || "Upcoming", b.totalPrice, b.notes || "", JSON.stringify(b.extraCharges || []), JSON.stringify(b.payments || [])]);
    const booking = dbGet<any>(d, "SELECT * FROM bookings WHERE id = ?", [b.id]);
    res.json({ ...booking, extraCharges: JSON.parse(booking.extraCharges || "[]"), payments: JSON.parse(booking.payments || "[]") });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Logs ────────────────────────────────────────────────
app.get("/api/logs", async (_req, res) => {
  try {
    const d = await getDb();
    const logs = dbAll(d, "SELECT * FROM logs ORDER BY timestamp DESC");
    res.json(logs);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/logs", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    const { id, timestamp, type, message, staffMember } = req.body;
    dbRun(d, "INSERT INTO logs VALUES (?,?,?,?,?)", [id, timestamp, type, message, staffMember || "System"]);
    const log = dbGet(d, "SELECT * FROM logs WHERE id = ?", [id]);
    res.json(log);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Staff ───────────────────────────────────────────────
app.get("/api/staff", authenticate, async (_req, res) => {
  try {
    const d = await getDb();
    const rows = dbAll<any>(d, "SELECT id, username, name, role, allowedTabs, passwordChanged FROM staff");
    res.json(rows.map(s => ({ ...s, allowedTabs: JSON.parse(s.allowedTabs), passwordChanged: !!s.passwordChanged })));
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/staff/:id", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    const fields = req.body;
    const sets: string[] = [];
    const vals: any[] = [];
    if (fields.name !== undefined) { sets.push("name = ?"); vals.push(fields.name); }
    if (fields.role !== undefined) { sets.push("role = ?"); vals.push(fields.role); }
    if (fields.allowedTabs !== undefined) { sets.push("allowedTabs = ?"); vals.push(JSON.stringify(fields.allowedTabs)); }
    if (fields.username !== undefined) { sets.push("username = ?"); vals.push(fields.username); }
    if (fields.password !== undefined) {
      const hashed = bcrypt.hashSync(fields.password, 10);
      sets.push("password = ?");
      vals.push(hashed);
      sets.push("passwordChanged = ?");
      vals.push(0);
    }
    if (sets.length === 0) return res.json({ updated: false });
    vals.push(req.params.id);
    dbRun(d, `UPDATE staff SET ${sets.join(", ")} WHERE id = ?`, vals);
    const s = dbGet<any>(d, "SELECT id, username, name, role, allowedTabs, passwordChanged FROM staff WHERE id = ?", [req.params.id]);
    res.json({ ...s, allowedTabs: JSON.parse(s.allowedTabs), passwordChanged: !!s.passwordChanged });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/staff", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    const { id, username, name, role, password, allowedTabs } = req.body;
    if (!password) return res.status(400).json({ error: "Password is required" });
    const hashed = bcrypt.hashSync(password, 10);
    dbRun(d, "INSERT INTO staff VALUES (?,?,?,?,?,?,?)", [id, username, name, role, hashed, JSON.stringify(allowedTabs || []), 0]);
    const s = dbGet<any>(d, "SELECT id, username, name, role, allowedTabs, passwordChanged FROM staff WHERE id = ?", [id]);
    res.json({ ...s, allowedTabs: JSON.parse(s.allowedTabs), passwordChanged: !!s.passwordChanged });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/staff/:id", authenticate, async (req, res) => {
  try {
    const d = await getDb();
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }
    dbRun(d, "DELETE FROM staff WHERE id = ?", [req.params.id]);
    res.json({ deleted: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Backup & Restore ──────────────────────────────────
app.get("/api/backup", authenticate, async (req: any, res: any) => {
  try {
    if (req.user.role !== "Admin") return res.status(403).json({ error: "Only admins can perform backup" });
    const dbPath = path.join(process.cwd(), "data", "hotel.db");
    if (!fs.existsSync(dbPath)) return res.status(404).json({ error: "Database file not found" });
    const date = new Date().toISOString().split("T")[0];
    res.download(dbPath, `hotel-backup-${date}.db`);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/restore", authenticate, async (req: any, res: any) => {
  try {
    if (req.user.role !== "Admin") return res.status(403).json({ error: "Only admins can perform restore" });
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: "No database data provided" });
    const buffer = Buffer.from(data, "base64");
    const dbPath = path.join(process.cwd(), "data", "hotel.db");
    const backupPath = dbPath + ".backup";
    if (fs.existsSync(dbPath)) fs.copyFileSync(dbPath, backupPath);
    fs.writeFileSync(dbPath, buffer);
    // Re-initialise database from new file
    closeDb();
    await getDb();
    res.json({ success: true, message: "Database restored successfully" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Serve frontend ─────────────────────────────────────
const frontendDist = path.join(process.cwd(), "..", "frontend", "dist");
const frontendPublic = path.join(process.cwd(), "..", "frontend", "public");

app.use(express.static(frontendDist));
app.use("/icons", express.static(path.join(frontendPublic, "icons")));
app.use("/manifest.json", express.static(path.join(frontendPublic, "manifest.json")));
app.use("/sw.js", express.static(path.join(frontendPublic, "sw.js")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// ─── Start ──────────────────────────────────────────────
async function start() {
  await getDb();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n  Hotel Management Suite`);
    console.log(`  ─────────────────────`);
    console.log(`  Local:   http://localhost:${PORT}`);
    console.log(`  Network: http://0.0.0.0:${PORT}`);
    console.log(`  DB:      SQLite (data/hotel.db)\n`);
  });
}

start().catch(console.error);

process.on("SIGINT", () => { closeDb(); process.exit(); });
process.on("SIGTERM", () => { closeDb(); process.exit(); });

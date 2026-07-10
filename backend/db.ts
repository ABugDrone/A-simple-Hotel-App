import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "data", "hotel.db");
let db: SqlJsDatabase | null = null;

export async function getDb(): Promise<SqlJsDatabase> {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON");
  initSchema(db);
  seedIfEmpty(db);
  saveDb(db);
  return db;
}

function initSchema(d: SqlJsDatabase) {
  d.run(`
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      password TEXT NOT NULL,
      allowedTabs TEXT NOT NULL DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      roomNumber TEXT NOT NULL,
      type TEXT NOT NULL,
      floor INTEGER NOT NULL,
      price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Available',
      amenities TEXT NOT NULL DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      vipStatus INTEGER NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      visitCount INTEGER NOT NULL DEFAULT 1,
      totalSpend REAL NOT NULL DEFAULT 0,
      debt REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      roomId TEXT NOT NULL,
      roomNumber TEXT NOT NULL,
      guestId TEXT NOT NULL,
      guestName TEXT NOT NULL,
      checkInDate TEXT NOT NULL,
      checkOutDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Upcoming',
      totalPrice REAL NOT NULL,
      notes TEXT DEFAULT '',
      extraCharges TEXT DEFAULT '[]',
      payments TEXT DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      staffMember TEXT NOT NULL DEFAULT 'System'
    );
    CREATE TABLE IF NOT EXISTS categories (
      name TEXT PRIMARY KEY
    );
  `);
}

function saveDb(d: SqlJsDatabase) {
  const data = d.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Helper to run queries with auto-save
export function dbRun(d: SqlJsDatabase, sql: string, params?: any[]) {
  if (params) {
    d.run(sql, params);
  } else {
    d.run(sql);
  }
  saveDb(d);
}

export function dbAll<T = any>(d: SqlJsDatabase, sql: string, params?: any[]): T[] {
  if (params) {
    return d.exec(sql, params).flatMap(r => {
      // sql.js returns {columns, values}
      const cols = r.columns;
      return r.values.map((v: any[]) => {
        const obj: any = {};
        cols.forEach((c, i) => { obj[c] = v[i]; });
        return obj;
      });
    }) as T[];
  }
  const stmt = d.prepare(sql);
  const results: any[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }
  stmt.free();
  return results as T[];
}

export function dbGet<T = any>(d: SqlJsDatabase, sql: string, params?: any[]): T | undefined {
  if (params) {
    const rows = dbAll<T>(d, sql, params);
    return rows[0];
  }
  const stmt = d.prepare(sql);
  let result: any = undefined;
  if (stmt.step()) {
    result = stmt.getAsObject() as T;
  }
  stmt.free();
  return result;
}

function seedIfEmpty(d: SqlJsDatabase) {
  const count = dbGet<{ c: number }>(d, "SELECT COUNT(*) as c FROM staff");
  if (count && count.c > 0) return;

  const hash = bcrypt.hashSync("password123", 10);

  dbRun(d, "INSERT INTO staff VALUES (?,?,?,?,?,?)", ["S-101", "julian.marx", "Julian Marx", "Admin", hash, JSON.stringify(["overview","rooms","reservations","housekeeping","guests","billing","admin_config"])]);
  dbRun(d, "INSERT INTO staff VALUES (?,?,?,?,?,?)", ["S-102", "robert.chen", "Robert Chen", "Front Desk", hash, JSON.stringify(["overview","rooms","reservations","guests","billing"])]);
  dbRun(d, "INSERT INTO staff VALUES (?,?,?,?,?,?)", ["S-103", "sarah.jenkins", "Sarah Jenkins", "Housekeeping", hash, JSON.stringify(["rooms","housekeeping"])]);

  const rooms = [
    ["101","101","Standard",1,120,"Occupied",JSON.stringify(["Queen Bed","High-speed Wi-Fi","Work Desk","Smart TV"])],
    ["102","102","Standard",1,120,"Available",JSON.stringify(["Queen Bed","High-speed Wi-Fi","Work Desk","Smart TV"])],
    ["103","103","Standard",1,125,"Cleaning",JSON.stringify(["Double Queen Beds","High-speed Wi-Fi","Coffee Maker","Smart TV"])],
    ["104","104","Standard",1,120,"Maintenance",JSON.stringify(["Queen Bed","High-speed Wi-Fi","Work Desk","Smart TV"])],
    ["201","201","Deluxe",2,180,"Occupied",JSON.stringify(["King Bed","Ocean View Balcony","Mini Bar","Coffee Maker","Luxury Robes"])],
    ["202","202","Deluxe",2,180,"Available",JSON.stringify(["King Bed","Ocean View Balcony","Mini Bar","Coffee Maker","Luxury Robes"])],
    ["203","203","Deluxe",2,185,"Cleaning",JSON.stringify(["Double Queen Beds","Ocean View","Mini Bar","Espresso Machine"])],
    ["204","204","Deluxe",2,180,"Available",JSON.stringify(["King Bed","Ocean View Balcony","Mini Bar","Coffee Maker","Luxury Robes"])],
    ["301","301","Suite",3,320,"Occupied",JSON.stringify(["Separate Living Room","Jacuzzi Tub","Private Balcony","Espresso Machine","Butler Service"])],
    ["302","302","Suite",3,320,"Available",JSON.stringify(["Separate Living Room","Jacuzzi Tub","Private Balcony","Espresso Machine","In-room Safe"])],
    ["303","303","Suite",3,320,"Available",JSON.stringify(["Separate Living Room","Jacuzzi Tub","Private Balcony","Espresso Machine","In-room Safe"])],
    ["304","304","Penthouse",3,650,"Occupied",JSON.stringify(["360 Panoramic View","Private Rooftop Pool","Personal Chef Space","Full Kitchen","Dedicated Concierge"])]
  ];
  for (const r of rooms) {
    dbRun(d, "INSERT INTO rooms VALUES (?,?,?,?,?,?,?)", r);
  }

  dbRun(d, "INSERT INTO guests VALUES (?,?,?,?,?,?,?,?,?)", ["G-101","Eleanor Vance","eleanor.v@domain.com","+1 (555) 234-5678",1,"Prefers high floors, allergic to feather pillows.",5,2450,4500]);
  dbRun(d, "INSERT INTO guests VALUES (?,?,?,?,?,?,?,?,?)", ["G-102","Marcus Aurelius","marcus.a@stoic.org","+1 (555) 876-5432",0,"Requires late checkout when possible.",2,720,0]);
  dbRun(d, "INSERT INTO guests VALUES (?,?,?,?,?,?,?,?,?)", ["G-103","Samantha Sterling","samantha@sterling-co.com","+1 (555) 901-2345",1,"Corporate partner. Requires ultra high-speed internet.",12,6200,0]);
  dbRun(d, "INSERT INTO guests VALUES (?,?,?,?,?,?,?,?,?)", ["G-104","Julian Barnes","julian.b@author.net","+1 (555) 432-1098",0,"Travel writer. Wants quiet corner rooms.",1,360,1200]);

  dbRun(d, "INSERT INTO bookings VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["B-1001","101","101","G-102","Marcus Aurelius","2026-07-04","2026-07-08","Checked In",480,"Requested a quiet study desk","[]","[]"]);
  dbRun(d, "INSERT INTO bookings VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["B-1002","201","201","G-101","Eleanor Vance","2026-07-05","2026-07-10","Checked In",900,"Feather-free pillows confirmed.","[]","[]"]);
  dbRun(d, "INSERT INTO bookings VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["B-1003","301","301","G-103","Samantha Sterling","2026-07-06","2026-07-12","Checked In",1920,"Welcome gift basket delivered.","[]","[]"]);
  dbRun(d, "INSERT INTO bookings VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["B-1004","304","304","G-104","Julian Barnes","2026-07-01","2026-07-05","Checked Out",2600,"Left a great feedback note.","[]","[]"]);
  dbRun(d, "INSERT INTO bookings VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", ["B-1005","102","102","G-104","Julian Barnes","2026-07-08","2026-07-11","Upcoming",360,"","[]","[]"]);

  dbRun(d, "INSERT INTO logs VALUES (?,?,?,?,?)", ["L-201","2026-07-06T08:15:00-07:00","Booking","New booking B-1005 created for Guest Julian Barnes in Room 102.","Robert Chen"]);
  dbRun(d, "INSERT INTO logs VALUES (?,?,?,?,?)", ["L-202","2026-07-06T09:00:00-07:00","Housekeeping","Room 103 status changed to Cleaning.","Elena Rostova"]);
  dbRun(d, "INSERT INTO logs VALUES (?,?,?,?,?)", ["L-203","2026-07-06T10:30:00-07:00","Guest","Checked out booking B-1004 for Julian Barnes (Room 304). Total invoice: N2,600.","Robert Chen"]);
  dbRun(d, "INSERT INTO logs VALUES (?,?,?,?,?)", ["L-204","2026-07-06T11:15:00-07:00","Housekeeping","Room 203 status changed to Cleaning after Guest checkout.","Elena Rostova"]);
  dbRun(d, "INSERT INTO logs VALUES (?,?,?,?,?)", ["L-205","2026-07-06T12:00:00-07:00","Booking","Checked in booking B-1003 for Samantha Sterling in Suite 301.","Sarah Jenkins"]);

  for (const c of ["Standard","Deluxe","Suite","Penthouse"]) {
    dbRun(d, "INSERT INTO categories VALUES (?)", [c]);
  }
}

export function closeDb() {
  if (db) {
    saveDb(db);
    db.close();
    db = null;
  }
}

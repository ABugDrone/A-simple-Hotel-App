# Hotel Management Suite

Boutique hotel management platform with interactive front-desk booking, visual room status directories, real-time housekeeping logs, and guest lists.

## Architecture

```
backend/     Express + SQLite REST API
frontend/    React + Vite PWA
start.bat    One-click launcher
```

## Quick Start

### Option 1: One-click (Windows)
Double-click `start.bat` — installs deps, builds frontend, starts server, and opens browser.

### Option 2: Manual
```bash
npm run setup     # Install all dependencies
npm run build     # Build frontend
npm start         # Build frontend + start server
```

Then open `http://localhost:3000`

### Development
```bash
npm run dev       # Concurrent backend + frontend dev servers
```

## Features

- **Full offline** — SQLite database runs locally, zero cloud dependencies
- **PWA installable** — Install as an app on any device that connects
- **LAN access** — Other devices on your network can access via `http://192.168.x.x:3000`
- **JWT authentication** — Secure login for staff roles (Admin, Front Desk, Housekeeping)
- **Auto-seeded data** — Demo data on first run with 12 rooms, 4 guests, sample bookings

## Default Logins

| Username       | Password      | Role         |
|---------------|---------------|-------------|
| julian.marx   | password123   | Admin       |
| robert.chen   | password123   | Front Desk  |
| sarah.jenkins | password123   | Housekeeping|

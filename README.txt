╔══════════════════════════════════════════════════════════════╗
║              HOTEL MANAGEMENT SUITE                         ║
║        The Reserve - Amirable Suite                         ║
║                                                            ║
║     Full offline PWA - Local SQLite Database                ║
╚══════════════════════════════════════════════════════════════╝


WHAT THIS IS
=============
A complete hotel management platform that runs ENTIRELY on your
local machine (no internet required once installed). It uses:

  - SQLite database (stored locally on your PC)
  - Express.js backend API
  - React frontend with PWA (installable as an app)
  - JWT authentication for staff logins


SYSTEM REQUIREMENTS
====================
- Windows 7 or newer
- Node.js 18.x (install from: https://nodejs.org)
- Chrome 109+, Firefox, or Edge

Windows 7 users: Install Node.js 18.x (the last version that
supports Windows 7). Get it here:
  https://nodejs.org/dist/latest-v18.x/


QUICK START (First Time)
=========================
  1. Double-click  start.bat
  2. At the menu, press  3  (Install / Repair Dependencies)
  3. Wait for it to finish (may take 2-5 minutes)
  4. Once done, press  1  (Start Server & Open Browser)
  5. The app opens in your browser at http://localhost:3000


STARTING THE APP (After First Install)
=======================================
  Just double-click  start.bat  and press  1

  A server terminal window opens in the background.
  Your browser opens to the app automatically.


INSTALLING AS A STANDALONE APP (PWA)
=====================================
Once the app is open in your browser:

  CHROME / EDGE:
  ---------------
  1. Look for the install icon in the address bar (right side)
     OR look for the install banner at the bottom of the page
  2. Click "Install" (or the + icon)
  3. The app installs as a standalone window
  4. A shortcut appears on your Desktop / Start Menu

  FIREFOX:
  ---------
  1. Open http://localhost:3000 in Firefox
  2. Look for the install icon in the address bar
  3. Click to install as a PWA

After installing, you can launch the app from the shortcut
ANYTIME — even when the server is off. It remembers your
last session. The server needs to be running for fresh data.


DEFAULT LOGINS
===============
  Username            Password         Role
  ───────────────────────────────────────────
  julian.marx         password123      Admin (full access)
  robert.chen         password123      Front Desk
  sarah.jenkins       password123      Housekeeping


ACCESS FROM OTHER DEVICES (Same Network)
==========================================
Other phones, tablets, or PCs on the same Wi-Fi/network can
access the app at:

  http://192.168.x.x:3000

(The exact IP is shown when you start the server.)

They can also install the PWA on their device by visiting
that URL in their browser.


THE SPLASH SCREEN
==================
When you open the app, a full-screen splash appears:

  "Connecting to local server..."

This is normal — it's waiting for the backend to start up.
After 1-3 seconds it connects and you see the login page.

If you see a "Connection Error" screen:

  - Click "Retry Connection" to try again
  - Click "Continue Offline" to use local storage instead
    (changes won't sync to the database until you reconnect)


TROUBLESHOOTING
================
"Node.js is not installed"
  Download and install from https://nodejs.org
  Windows 7 users must use Node.js 18.x

"Backend dependencies failed"
  - Make sure you have internet access for first install
  - Try option [3] in the launcher menu to reinstall
  - Check your antivirus isn't blocking npm

"Frontend build failed"
  - Try option [3] in the launcher menu
  - Make sure you have Node.js 18+ installed

"Port 3000 already in use"
  - Close any other programs using port 3000
  - The launcher automatically tries to free the port

"Can't connect from another device"
  - Make sure both devices are on the same network
  - Check Windows Firewall isn't blocking port 3000
  - Use the exact IP shown when the server starts


FILE STRUCTURE
===============
  HotelManagementSuite.zip
  ├── start.bat              ★ START HERE - One-click launcher
  ├── README.txt             This file
  ├── package.json           Root scripts
  ├── backend/
  │   ├── server.ts          Express API server
  │   ├── db.ts              SQLite database
  │   ├── data/hotel.db      Your data file (created on first run)
  │   └── package.json
  ├── frontend/
  │   ├── src/               React source code
  │   ├── dist/              Built app (ready to serve)
  │   ├── public/            PWA manifest, icons, service worker
  │   └── package.json
  └── assets/


NEED HELP?
===========
If you encounter issues:

  1. Try option [3] "Install / Repair Dependencies" in the
     launcher — this fixes most setup problems.
  2. Make sure Node.js 18.x is installed and shows up when
     you open a command prompt and type:  node -v
  3. Restart your computer and try again


Enjoy your Hotel Management Suite!
Have a productive work day.

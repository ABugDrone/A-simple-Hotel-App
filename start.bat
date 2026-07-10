@echo off
title Hotel Management Suite
cd /d "%~dp0"

:MENU
cls
echo.
echo   ============================================
echo     HOTEL MANAGEMENT SUITE - LAUNCHER
echo   ============================================
echo.
echo   [1] Start Server ^& Open Browser
echo   [2] Update Dependencies ^& Start
echo   [3] Install / Repair Dependencies
echo   [4] Exit
echo.
set /p choice=Select option (1-4): 

if "%choice%"=="1" goto START
if "%choice%"=="2" goto UPDATE
if "%choice%"=="3" goto INSTALL
if "%choice%"=="4" exit /b

goto MENU

:INSTALL
cls
echo.
echo   ============================================
echo     INSTALLING / REPAIRING DEPENDENCIES
echo   ============================================
echo.

:: 1. Check Node.js
echo   [1/4] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo   [ERROR] Node.js is not installed!
    echo.
    echo   This app requires Node.js 18+ (works on Windows 7).
    echo   Download from: https://nodejs.org/dist/latest-v18.x/
    echo.
    echo   Choose the .msi installer for your system
    echo   (node-v18.x.x-x64.msi or node-v18.x.x-x86.msi).
    echo.
    pause
    exit /b 1
)

:: Show Node.js version
for /f "tokens=1" %%v in ('node -v') do set NODE_VER=%%v
echo   Node.js %NODE_VER% detected
echo.

:: 2. Backend dependencies
echo   [2/4] Installing backend dependencies...
echo.
cd backend
call npm install --no-fund --no-audit
if %ERRORLEVEL% neq 0 (
    echo.
    echo   [ERROR] Backend dependencies failed to install.
    pause
    exit /b 1
)
cd ..
echo.

:: 3. Frontend dependencies
echo   [3/4] Installing frontend dependencies...
echo.
cd frontend
call npm install --no-fund --no-audit
if %ERRORLEVEL% neq 0 (
    echo.
    echo   [ERROR] Frontend dependencies failed to install.
    pause
    exit /b 1
)
cd ..
echo.

:: 4. Build frontend
echo   [4/4] Building frontend...
echo.
cd frontend
call npx vite build
if %ERRORLEVEL% neq 0 (
    echo.
    echo   [ERROR] Frontend build failed.
    pause
    exit /b 1
)
cd ..
echo.
echo   All dependencies installed and built successfully!
echo.
pause
goto MENU

:UPDATE
cls
echo.
echo   ============================================
echo     UPDATING DEPENDENCIES
echo   ============================================
echo.

cd backend
call npm update --no-fund --no-audit
cd ..
cd frontend
call npm update --no-fund --no-audit
cd ..

echo.
echo   Dependencies updated.
echo.
pause
goto START

:START
cls
echo.
echo   ============================================
echo     STARTING HOTEL MANAGEMENT SUITE
echo   ============================================
echo.

:: Check Node.js
echo   [CHECK] Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo   [ERROR] Node.js is not installed! Run option [3] first.
    pause
    goto MENU
)
for /f "tokens=1" %%v in ('node -v') do set NODE_VER=%%v
echo   Node.js %NODE_VER%

:: Verify dependencies exist, install if missing
if not exist "backend\node_modules" (
    echo   [SETUP] Backend deps missing - installing...
    cd backend
    call npm install --no-fund --no-audit
    cd ..
)
if not exist "frontend\node_modules" (
    echo   [SETUP] Frontend deps missing - installing...
    cd frontend
    call npm install --no-fund --no-audit
    cd ..
)

:: Build frontend if dist missing
if not exist "frontend\dist\index.html" (
    echo   [BUILD] Building frontend...
    cd frontend
    call npx vite build
    cd ..
)

:: Kill any existing server on port 3000
echo   [CLEAN] Stopping any existing server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if %%a gtr 0 (
        taskkill /f /pid %%a >nul 2>nul
    )
)
timeout /t 1 /nobreak >nul

:: Start the server in a new window
echo   [START] Launching server...
start "Hotel Suite Server" cmd /k "cd /d "%~dp0backend" && title Hotel Suite Server && echo. && echo   Server starting on http://localhost:3000 && echo   Press Ctrl+C to stop && echo. && npx tsx server.ts"

:: Wait a moment for the server to start
timeout /t 4 /nobreak >nul

:: Open browser
echo   [OPEN] Opening browser...
start http://localhost:3000

:: Show network URL
echo.
echo   ============================================
echo     SERVER IS RUNNING
echo   ============================================
echo.
echo   Local:   http://localhost:3000
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4.*:"') do (
    set ip=%%a
    goto :showip
)
:showip
set ip=%ip: =%
if defined ip (
    echo   Network: http://%ip%:3000
)
echo.
echo   To install the PWA:
echo   1. Open http://localhost:3000 in Chrome/Firefox/Edge
echo   2. Click the install icon in the address bar
echo      (or the install banner at the bottom of the page)
echo   3. The app will be installed as a standalone app
echo.
echo   After install, you can launch it from your
echo   Start Menu or Desktop shortcut even when
echo   offline (data syncs when server is running).
echo.
echo   Close this window to show the menu again.
echo.

:WAIT
timeout /t 2 /nobreak >nul
tasklist /fi "WindowTitle eq Hotel Suite Server" 2>nul | find /i "cmd.exe" >nul
if %ERRORLEVEL% equ 0 goto WAIT

echo.
echo   Server window was closed.
echo.
pause
goto MENU

@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install it from https://nodejs.org and run this again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing Wheel of Paradise...
  call npm install
)
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8787/host"
node server.js
if errorlevel 1 pause

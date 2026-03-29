@echo off
echo Stopping any existing Node processes...
taskkill /IM node.exe /F >nul 2>&1
echo Starting Buy Wise Server...
cd server
node index.js
pause

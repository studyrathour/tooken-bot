@echo off
echo Stopping Telegram Bot...
echo.

echo Finding Node.js processes...
tasklist | findstr node
echo.

echo Terminating Node.js processes...
taskkill /f /im node.exe
echo.

echo Telegram Bot stopped.
pause
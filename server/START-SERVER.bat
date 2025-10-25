@echo off
echo.
echo ========================================
echo   Starting Webinar Game Server
echo ========================================
echo.

REM Change to the directory where this batch file is located
cd /d "%~dp0"

REM Start the server directly (no port checking)
echo Starting server...
echo.
node server.js

REM If server exits, show error and pause
echo.
echo ========================================
echo Server stopped!
echo ========================================
echo.
pause

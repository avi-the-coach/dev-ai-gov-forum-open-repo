@echo off
REM Webinar Game Server Setup - Windows Wrapper
REM Runs setup.js from server folder using Node.js

echo.
echo ====================================
echo   Webinar Game Server Setup
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Run setup script from server folder (go up one level from docs, then into server)
node ..\server\setup.js

echo.
echo ====================================
echo.
pause

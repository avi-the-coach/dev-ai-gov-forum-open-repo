@echo off
echo Stopping Webinar Game Server...
echo.

REM Find and kill Node.js process running the server
FOR /F "tokens=2" %%i IN ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST ^| findstr "PID"') DO (
    echo Checking PID: %%i
    netstat -ano | findstr ":3000" | findstr "%%i" >nul
    IF NOT ERRORLEVEL 1 (
        echo Stopping server process %%i running on port 3000...
        taskkill /PID %%i /F
        echo Server stopped successfully!
        goto :done
    )
)

echo No server found running on port 3000
:done
echo.
pause

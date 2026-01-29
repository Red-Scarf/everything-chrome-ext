@echo off
REM Everything Chrome Extension - Quick Start Script

setlocal enabledelayedexpansion

echo.
echo ========================================
echo  Everything Chrome Extension
echo  Quick Start Script
echo ========================================
echo.

REM Check npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [Error] npm not found!
    echo Please install Node.js and npm first.
    pause
    exit /b 1
)

echo [OK] npm found
echo.

REM Check node_modules
if not exist "node_modules" (
    echo [*] Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [Error] npm install failed!
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies exist
)

echo.
echo [*] Starting dev server...
echo.
echo Next Steps:
echo.
echo 1. Wait for "Listening on" message
echo 2. Open chrome://extensions
echo 3. Enable "Developer mode"
echo 4. Click "Load unpacked"
echo 5. Select the ".plasmo" folder in this project
echo.
echo Press any key to start server...
pause >nul

echo.
echo [*] Running command: npm run dev
call npm run dev

pause

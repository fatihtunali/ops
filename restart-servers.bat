@echo off
REM ============================================
REM Funny Tourism - Safe Server Restart Script
REM ============================================
REM Kills processes on specific ports (5000, 5173) and restarts servers
REM
REM IMPORTANT: This script only kills processes on ports 5000 and 5173
REM It will NOT kill all node.exe processes (which would kill Claude Code!)
REM ============================================

setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0
set ERROR_COUNT=0

echo ============================================
echo Funny Tourism - Server Restart Script
echo ============================================
echo.

REM ============================================
REM Step 1: Kill Backend Server on Port 5000
REM ============================================
echo [1/6] Stopping backend server (port 5000)...
set BACKEND_KILLED=0

REM Get all PIDs listening on port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
    set PID=%%a
    echo   ^> Found process PID: !PID!
    taskkill /PID !PID! /F >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo   ^> Successfully killed PID: !PID!
        set BACKEND_KILLED=1
    ) else (
        echo   ^> WARNING: Could not kill PID: !PID!
        set /a ERROR_COUNT+=1
    )
)

if !BACKEND_KILLED! EQU 0 (
    echo   ^> No backend process found on port 5000
)

echo.

REM ============================================
REM Step 2: Kill Frontend Server on Port 5173
REM ============================================
echo [2/6] Stopping frontend server (port 5173)...
set FRONTEND_KILLED=0

REM Get all PIDs listening on port 5173
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    set PID=%%a
    echo   ^> Found process PID: !PID!
    taskkill /PID !PID! /F >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo   ^> Successfully killed PID: !PID!
        set FRONTEND_KILLED=1
    ) else (
        echo   ^> WARNING: Could not kill PID: !PID!
        set /a ERROR_COUNT+=1
    )
)

if !FRONTEND_KILLED! EQU 0 (
    echo   ^> No frontend process found on port 5173
)

echo.

REM ============================================
REM Step 3: Wait for Ports to Clear
REM ============================================
echo [3/6] Waiting for ports to clear...
timeout /t 3 /nobreak >nul
echo   ^> Ports cleared
echo.

REM ============================================
REM Step 4: Verify Ports Are Free
REM ============================================
echo [4/6] Verifying ports are available...

netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo   ^> ERROR: Port 5000 is still in use!
    set /a ERROR_COUNT+=1
) else (
    echo   ^> Port 5000 is free
)

netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo   ^> ERROR: Port 5173 is still in use!
    set /a ERROR_COUNT+=1
) else (
    echo   ^> Port 5173 is free
)

echo.

REM ============================================
REM Step 5: Start Backend Server
REM ============================================
echo [5/6] Starting backend server...
cd "%SCRIPT_DIR%backend"
if !ERRORLEVEL! NEQ 0 (
    echo   ^> ERROR: Could not navigate to backend directory!
    set /a ERROR_COUNT+=1
    goto :end
)

start "Funny Tourism Backend (Port 5000)" cmd /k "npm start"
echo   ^> Backend starting at http://localhost:5000
echo   ^> Backend window opened (check taskbar)
echo.

REM Wait for backend to initialize
echo   ^> Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

REM ============================================
REM Step 6: Start Frontend Server
REM ============================================
echo [6/6] Starting frontend server...
cd "%SCRIPT_DIR%frontend"
if !ERRORLEVEL! NEQ 0 (
    echo   ^> ERROR: Could not navigate to frontend directory!
    set /a ERROR_COUNT+=1
    goto :end
)

start "Funny Tourism Frontend (Port 5173)" cmd /k "npm run dev"
echo   ^> Frontend starting at http://localhost:5173
echo   ^> Frontend window opened (check taskbar)
echo.

:end
REM ============================================
REM Summary
REM ============================================
echo ============================================
echo Server Restart Complete!
echo ============================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.

if !ERROR_COUNT! GTR 0 (
    echo WARNING: !ERROR_COUNT! error(s) occurred during restart
    echo Please check the output above for details
) else (
    echo Status: All operations completed successfully
)

echo.
echo Press any key to close this window...
pause >nul

REM Return to original directory
cd "%SCRIPT_DIR%"
endlocal

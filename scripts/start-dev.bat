@echo off
echo Starting development server with automatic port conflict resolution...

REM Check if port 3009 is in use
netstat -ano | findstr :3009 >nul
if %errorlevel% == 0 (
    echo Port 3009 is in use. Killing conflicting processes...
    
    REM Find and kill all processes using port 3009
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3009') do (
        echo Killing process %%a
        taskkill /PID %%a /F >nul 2>&1
    )
    
    REM Wait a moment for processes to terminate
    timeout /t 2 /nobreak >nul
    echo Port cleared. Starting development server...
) else (
    echo Port 3009 is available. Starting development server...
)

REM Start the development server
npm run dev

#!/usr/bin/env pwsh

Write-Host "Starting development server with automatic port conflict resolution..." -ForegroundColor Green

# Check if port 3009 is in use
$portInUse = Get-NetTCPConnection -LocalPort 3009 -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "Port 3009 is in use. Killing conflicting processes..." -ForegroundColor Yellow
    
    # Get all processes using port 3009
    $processes = Get-NetTCPConnection -LocalPort 3009 | Select-Object -ExpandProperty OwningProcess | Sort-Object | Get-Unique
    
    foreach ($pid in $processes) {
        try {
            $process = Get-Process -Id $pid -ErrorAction Stop
            Write-Host "Killing process: $($process.ProcessName) (PID: $pid)" -ForegroundColor Yellow
            Stop-Process -Id $pid -Force
        }
        catch {
            Write-Host "Process $pid already terminated" -ForegroundColor Gray
        }
    }
    
    # Wait for processes to terminate
    Start-Sleep -Seconds 2
    Write-Host "Port cleared. Starting development server..." -ForegroundColor Green
} else {
    Write-Host "Port 3009 is available. Starting development server..." -ForegroundColor Green
}

# Start the development server
npm run dev

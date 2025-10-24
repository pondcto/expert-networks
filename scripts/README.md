# Development Server Scripts

This directory contains scripts to prevent port conflicts when starting the development server.

## Problem
The development server sometimes fails to start because port 3009 is already in use by a previous process that didn't terminate properly.

## Solution
Use the `dev:safe` script instead of `dev` to automatically resolve port conflicts.

## Usage

### Option 1: Use the safe development script (Recommended)
```bash
npm run dev:safe
```

### Option 2: Use platform-specific scripts
```bash
# Windows (Batch)
scripts/start-dev.bat

# Windows (PowerShell)
scripts/start-dev.ps1

# Cross-platform (Node.js)
node scripts/start-dev.js
```

## What it does
1. **Checks if port 3009 is in use**
2. **Automatically kills conflicting processes** if found
3. **Waits for processes to terminate**
4. **Starts the development server** normally

## Benefits
- ✅ **No more port conflicts** - Automatically resolves issues
- ✅ **Cross-platform** - Works on Windows, macOS, and Linux
- ✅ **Safe** - Only kills processes using port 3009
- ✅ **Fast** - Minimal delay (2 seconds max)
- ✅ **Reliable** - Consistent startup experience

## Troubleshooting
If you still encounter issues:
1. Make sure no other applications are using port 3009
2. Try running the script with administrator privileges
3. Check if any antivirus software is blocking the process termination

## Alternative: Change Port
If you prefer to use a different port, you can modify the scripts or use:
```bash
npm run dev -- -p 3008
```

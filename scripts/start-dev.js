#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const os = require('os');

console.log('🚀 Starting development server with automatic port conflict resolution...\n');

// Function to kill processes on port 3009
function killProcessesOnPort(port) {
    return new Promise((resolve) => {
        const platform = os.platform();
        let command;
        
        if (platform === 'win32') {
            // Windows
            command = `netstat -ano | findstr :${port}`;
        } else {
            // Unix-like systems (macOS, Linux)
            command = `lsof -ti:${port}`;
        }
        
        exec(command, (error, stdout) => {
            if (error || !stdout.trim()) {
                console.log(`✅ Port ${port} is available`);
                resolve();
                return;
            }
            
            console.log(`⚠️  Port ${port} is in use. Killing conflicting processes...`);
            
            const lines = stdout.trim().split('\n');
            const pids = new Set();
            
            lines.forEach(line => {
                if (platform === 'win32') {
                    // Windows: extract PID from the last column
                    const parts = line.trim().split(/\s+/);
                    if (parts.length > 4) {
                        pids.add(parts[parts.length - 1]);
                    }
                } else {
                    // Unix-like: each line is a PID
                    pids.add(line.trim());
                }
            });
            
            if (pids.size === 0) {
                resolve();
                return;
            }
            
            let killCommand;
            if (platform === 'win32') {
                // Windows
                killCommand = `taskkill /F ${Array.from(pids).map(pid => `/PID ${pid}`).join(' ')}`;
            } else {
                // Unix-like
                killCommand = `kill -9 ${Array.from(pids).join(' ')}`;
            }
            
            exec(killCommand, (killError) => {
                if (killError) {
                    console.log(`❌ Error killing processes: ${killError.message}`);
                } else {
                    console.log(`✅ Killed ${pids.size} process(es) on port ${port}`);
                }
                
                // Wait a moment for processes to terminate
                setTimeout(resolve, 2000);
            });
        });
    });
}

// Function to start the development server
function startDevServer() {
    console.log('🎯 Starting Next.js development server...\n');
    
    const devProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true
    });
    
    devProcess.on('close', (code) => {
        console.log(`\n📝 Development server exited with code ${code}`);
    });
    
    devProcess.on('error', (error) => {
        console.error(`❌ Error starting development server: ${error.message}`);
    });
}

// Main execution
async function main() {
    try {
        await killProcessesOnPort(3009);
        startDevServer();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

main();

Write-Host "Stopping existing servers (Python & Node)..."
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Waiting for ports to clear..."
Start-Sleep -Seconds 2

$backendCommand = "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Write-Host "Starting Backend ($backendCommand)..."
# Start backend in a new window so it persists
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "$backendCommand"

Write-Host "Waiting for backend to initialize..."
Start-Sleep -Seconds 3

$frontendCommand = "npm run dev"
Write-Host "Starting Frontend ($frontendCommand)..."
# Start frontend in a new window
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd frontend; $frontendCommand"

Write-Host "---------------------------------------------------"
Write-Host "✅ Servers have been restarted in new windows."
Write-Host "👉 Backend: http://localhost:8000"
Write-Host "👉 Frontend: http://localhost:3000"
Write-Host "---------------------------------------------------"

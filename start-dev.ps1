$repoRoot = $PSScriptRoot
$backendPath = Join-Path $repoRoot 'backend'
$frontendPath = Join-Path $repoRoot 'frontend'

if (-not (Test-Path $backendPath)) { Write-Error "Backend path '$backendPath' not found."; exit 1 }
if (-not (Test-Path $frontendPath)) { Write-Error "Frontend path '$frontendPath' not found."; exit 1 }

function Wait-ForUrl {
    param([string] $Url, [int] $TimeoutSec = 120)
    $start = Get-Date
    while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSec) {
        try { Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop | Out-Null; return $true } catch { Start-Sleep -Seconds 1 }
    }
    return $false
}

function Get-ListenerPid {
    param([int] $Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($connection) {
        return [int]$connection.OwningProcess
    }
    return $null
}

function Stop-ListenerOnPort {
    param([int] $Port, [string] $Name)
    $listenerPid = Get-ListenerPid -Port $Port
    if ($listenerPid) {
        Write-Output "Found existing $Name process on port $Port (PID $listenerPid). Stopping it..."
        Stop-Process -Id $listenerPid -Force
        Start-Sleep -Seconds 2
        return $true
    }
    return $false
}

$backendUrl = 'http://localhost:8080/api/health'
$frontendUrl = 'http://localhost:5173'

if (Wait-ForUrl -Url $backendUrl -TimeoutSec 5) {
    Write-Output "Backend is already available at $backendUrl."
} else {
    Stop-ListenerOnPort -Port 8080 -Name 'backend'
    Write-Output "Starting backend..."
    $backendArgs = @('-NoExit','-Command', "Set-Location -LiteralPath '$backendPath'; mvn spring-boot:run '-Dspring-boot.run.jvmArguments=--add-opens java.base/java.lang=ALL-UNNAMED'")
    Start-Process -FilePath 'powershell.exe' -ArgumentList $backendArgs
}

Write-Output "Waiting for backend at $backendUrl (timeout 180s)..."
if (-not (Wait-ForUrl -Url $backendUrl -TimeoutSec 180)) {
    Write-Error "Backend did not become available within timeout. Aborting."
    exit 1
}

if (Wait-ForUrl -Url $frontendUrl -TimeoutSec 5) {
    Write-Output "Frontend is already available at $frontendUrl."
} else {
    Stop-ListenerOnPort -Port 5173 -Name 'frontend'
    Write-Output "Backend is up. Starting frontend..."
    $frontendArgs = @('-NoExit','-Command', "Set-Location -LiteralPath '$frontendPath'; npm run dev")
    Start-Process -FilePath 'powershell.exe' -ArgumentList $frontendArgs
}

Write-Output "Waiting for frontend at $frontendUrl (timeout 90s)..."
if (Wait-ForUrl -Url $frontendUrl -TimeoutSec 90) {
    Write-Output "Opening frontend $frontendUrl in default browser..."
    Start-Process $frontendUrl
} else {
    Write-Warning "Frontend did not become available within timeout. Opening frontend URL anyway."
    Start-Process $frontendUrl
}

Write-Output "Done."


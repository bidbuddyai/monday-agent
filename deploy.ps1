# Monday Code Deployment Script
Write-Host "Starting Monday Code deployment..." -ForegroundColor Green

# Step 1: Clean old builds
Write-Host "`n[1/3] Cleaning old builds..." -ForegroundColor Yellow
if (Test-Path "build/client") {
    Remove-Item -Recurse -Force "build/client"
}

# Step 2: Build client
Write-Host "`n[2/3] Building client..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Deploy to Monday Code
Write-Host "`n[3/3] Deploying to Monday Code..." -ForegroundColor Yellow
Write-Host "You will be prompted to select your app and version..." -ForegroundColor Cyan
Write-Host ""

npx @mondaycom/apps-cli code:push

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeployment complete! ✓" -ForegroundColor Green
} else {
    Write-Host "`nDeployment failed!" -ForegroundColor Red
    exit 1
}

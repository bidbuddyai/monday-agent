# Set POE_API_KEY for Monday Code
# This script will prompt you to enter your API key securely

Write-Host "Setting POE_API_KEY for Monday Code..." -ForegroundColor Green
Write-Host ""
Write-Host "Please enter your Poe API key (from https://poe.com/api_key):" -ForegroundColor Yellow
$apiKey = Read-Host -AsSecureString
$apiKeyPlainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiKey))

Write-Host ""
Write-Host "Setting environment variable..." -ForegroundColor Cyan

# Run the command with flags
# App Version ID: 11406704 (v3)
$output = npx @mondaycom/apps-cli code:env -m set -i 11406704 -k POE_API_KEY -v "$apiKeyPlainText" -z us 2>&1
Write-Host $output

# Clear the variable from memory
$apiKeyPlainText = $null

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Environment variable set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now redeploy with: .\deploy.ps1" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Failed to set environment variable (exit code: $LASTEXITCODE)" -ForegroundColor Red
    Write-Host "Error output: $output" -ForegroundColor Red
}

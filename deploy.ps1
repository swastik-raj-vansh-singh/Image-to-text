# Image to Text Deployment Script (PowerShell)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Image to Text Converter Deployment Tool   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = $null
try {
    $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
} catch {
    # Command not found
}

if ($null -eq $vercelInstalled) {
    Write-Host "Vercel CLI is not installed. Installing now..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "Vercel CLI installed successfully." -ForegroundColor Green
} else {
    Write-Host "Vercel CLI is already installed." -ForegroundColor Green
}

Write-Host ""
Write-Host "Preparing deployment..." -ForegroundColor Cyan

# Run ESLint to check for errors
Write-Host "Running linter..." -ForegroundColor Cyan
npm run lint

if ($LASTEXITCODE -eq 0) {
    Write-Host "Linting completed successfully." -ForegroundColor Green
} else {
    Write-Host "Linting found errors. Please fix them before deploying." -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host ""
Write-Host "Building application..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build completed successfully." -ForegroundColor Green
} else {
    Write-Host "Build failed. Please fix the errors and try again." -ForegroundColor Red
    exit 1
}

# Deploy to Vercel
Write-Host ""
Write-Host "Deploying to Vercel..." -ForegroundColor Cyan
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "   Deployment completed successfully!   " -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app is now live on Vercel." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Deployment failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}

exit 0 
#!/bin/bash

# Image to Text Deployment Script

echo "============================================="
echo "   Image to Text Converter Deployment Tool   "
echo "============================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed. Installing now..."
    npm install -g vercel
    echo "Vercel CLI installed successfully."
else
    echo "Vercel CLI is already installed."
fi

echo ""
echo "Preparing deployment..."

# Run ESLint to check for errors
echo "Running linter..."
npm run lint

if [ $? -eq 0 ]; then
    echo "Linting completed successfully."
else
    echo "Linting found errors. Please fix them before deploying."
    exit 1
fi

# Build the application
echo ""
echo "Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "Build completed successfully."
else
    echo "Build failed. Please fix the errors and try again."
    exit 1
fi

# Deploy to Vercel
echo ""
echo "Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================="
    echo "   Deployment completed successfully!   "
    echo "============================================="
    echo ""
    echo "Your app is now live on Vercel."
else
    echo ""
    echo "Deployment failed. Please check the error messages above."
    exit 1
fi

exit 0 
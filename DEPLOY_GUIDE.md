# Image to Text Converter - Deployment Guide

This guide walks you through deploying the Image to Text Converter application to Vercel.

## Prerequisites

- GitHub account (recommended)
- Vercel account (free tier available)
- Node.js installed on your local machine (if deploying from local)

## Option 1: Deploy from GitHub (Recommended)

### Step 1: Fork or Push to GitHub
1. If you don't have the code in a GitHub repository, create one and push your code
2. Make sure your repository includes all the necessary files:
   - `package.json` with all dependencies
   - `next.config.js`
   - `tsconfig.json` 
   - `vercel.json` (optional but recommended)

### Step 2: Connect with Vercel
1. Go to [Vercel](https://vercel.com/)
2. Sign up or log in (you can use your GitHub account for easier integration)
3. Click on "Add New..." → "Project"
4. Select the GitHub repository containing your Image to Text Converter code
5. Vercel will automatically detect it's a Next.js project

### Step 3: Configure the Project
1. Configure your project:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)
2. Under "Environment Variables", add any needed variables (if applicable)
3. Click "Deploy"

### Step 4: Wait for Deployment
Vercel will build and deploy your application. This process usually takes 1-2 minutes.

### Step 5: Access Your Deployed App
Once deployment is complete, Vercel will provide you with a URL (e.g., `https://your-project-name.vercel.app`). Click on the URL to view your live application.

## Option 2: Deploy Using Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
Navigate to your project directory and run:
```bash
vercel
```

Follow the interactive prompts, and your project will be deployed.

### Step 4: Deploy to Production
When ready to deploy to production:
```bash
vercel --prod
```

## Option 3: Use the Deployment Scripts

We've included convenient deployment scripts:

### For Windows:
1. Open PowerShell
2. Navigate to your project directory
3. Run:
```powershell
.\deploy.ps1
```

### For macOS/Linux:
1. Open Terminal
2. Navigate to your project directory
3. Make the script executable:
```bash
chmod +x deploy.sh
```
4. Run the script:
```bash
./deploy.sh
```

## Troubleshooting

### Build Errors
If you encounter build errors during deployment:
1. Check the Vercel build logs
2. Ensure all dependencies are properly listed in `package.json`
3. Verify that your code compiles locally with `npm run build`
4. Check for TypeScript errors with `npm run lint`

### Runtime Errors
If your application deploys but doesn't function correctly:
1. Check the browser console for errors
2. Ensure environment variables are properly set
3. Verify that API endpoints and external services are accessible from Vercel

### Performance Issues
If your application is slow:
1. Enable Vercel's performance analytics
2. Consider adding caching headers for static assets
3. Implement image optimization if handling many images

## Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository:
- Each push to the main branch will trigger a production deployment
- Each pull request will generate a preview deployment

## Need Help?

If you encounter issues during deployment, you can:
1. Check the [Vercel documentation](https://vercel.com/docs)
2. Contact the developers of this application
   - Swastik Raj
   - Vansh Singh
3. Open an issue in the GitHub repository

Happy deploying! 
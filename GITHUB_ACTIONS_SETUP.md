# Setting Up GitHub Actions for Automated Deployment

This guide will help you set up GitHub Actions to automatically deploy your Image to Text Converter application to Vercel whenever you push changes to your repository.

## Prerequisites

1. Your code pushed to a GitHub repository
2. A Vercel account
3. Your project already set up on Vercel

## Step 1: Get Vercel Deployment Tokens

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Get your Vercel tokens**:
   ```bash
   vercel project ls
   ```
   Note the Project ID of your Image to Text Converter project.

4. **Get your Organization ID and Project ID**:
   ```bash
   vercel project list
   ```

5. **Get your Vercel Token**:
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Click "Create" to create a new token
   - Give it a name like "GitHub Actions Deploy"
   - Copy the token value

## Step 2: Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" > "Actions" in the left sidebar
4. Click "New repository secret" and add the following secrets:
   
   - Name: `VERCEL_TOKEN`
     Value: (Your Vercel token)
   
   - Name: `VERCEL_ORG_ID`
     Value: (Your Vercel Organization ID)
   
   - Name: `VERCEL_PROJECT_ID`
     Value: (Your Vercel Project ID)

## Step 3: GitHub Actions Workflow

The GitHub Actions workflow file has already been created at `.github/workflows/deploy.yml`. It will:

1. Run on pushes to the main branch and on pull requests
2. Check out your code
3. Set up Node.js
4. Install dependencies
5. Run linting
6. Build the project
7. Deploy to Vercel (production for main branch, preview for pull requests)

## Step 4: Commit and Push

Make sure to commit the workflow file and push it to your repository:

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow for Vercel deployment"
git push
```

## Step 5: Verify Deployment

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. You should see a workflow run that was triggered by your push
4. Click on it to see the details of the deployment
5. If everything is set up correctly, your app will be deployed to Vercel

## Troubleshooting

### Error: "Vercel CLI Error: Could not find vercel token."

- Make sure you've added the `VERCEL_TOKEN` secret to your GitHub repository.
- Verify that the token is still valid in your Vercel account settings.

### Error: "Vercel CLI Error: Could not find project or organization."

- Make sure you've added the `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` secrets.
- Verify that these IDs are correct using the Vercel CLI.

### Build Errors

- Check the GitHub Actions run logs to see what went wrong.
- Try building locally using `npm run build` to catch errors before pushing.

## Additional Configuration

### Branch Protection Rules

Consider setting up branch protection rules to ensure code quality:

1. Go to your GitHub repository
2. Click on "Settings" > "Branches"
3. Click "Add rule"
4. Enter "main" as the branch name pattern
5. Enable "Require status checks to pass before merging"
6. Select the "build" check
7. Click "Create"

This ensures that changes can only be merged into the main branch if they pass the build process.

## Need Help?

If you encounter issues with GitHub Actions deployment:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Check the [Vercel documentation](https://vercel.com/docs)
3. Contact the developers of this application for support 
---
description: Deploy Instagram Saver to Netlify
---

# Deploy to Netlify

This workflow will guide you through deploying your Instagram Saver app to Netlify for free commercial use.

## Prerequisites

1. ✅ GitHub account
2. ✅ Your project pushed to GitHub
3. ✅ Environment variables from `.env.local` ready

## Step 1: Create Netlify Account

1. Go to [netlify.com](https://netlify.com)
2. Click "Sign up" → "Sign up with GitHub"
3. Authorize Netlify to access your GitHub account

## Step 2: Import Your Project

1. From Netlify dashboard, click **"Add new site"**
2. Click **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Authorize Netlify if prompted
5. Select your `insta_saver` repository from the list

## Step 3: Configure Build Settings

Netlify should auto-detect Next.js. Verify these settings:

- **Framework preset**: Next.js (should be auto-detected)
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 20.x (recommended)

If you need to set Node version manually:
- Click "Show advanced"
- Add environment variable: `NODE_VERSION` = `20`

## Step 4: Add Environment Variables

Before deploying, you need to add your environment variables:

1. Click **"Add environment variables"** or **"Advanced build settings"**
2. Add each variable from your `.env.local` file:
   - Click "New variable"
   - Enter key and value
   - Repeat for all variables

**Important**: Do NOT include `NEXT_PUBLIC_` variables if they contain sensitive data. Only include what's necessary for your API routes.

## Step 5: Deploy

1. Click **"Deploy [your-site-name]"**
2. Wait for the build to complete (usually 1-3 minutes)
3. You'll see a live URL like: `https://[random-name].netlify.app`

## Step 6: Verify Deployment

Visit your deployed site and test:
1. ✅ Homepage loads correctly
2. ✅ Try downloading a post
3. ✅ Check that API routes work
4. ✅ Test carousel downloads
5. ✅ Verify responsive design on mobile

## Step 7: Set Up Custom Domain (Optional)

If you have a custom domain:

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the DNS configuration instructions
4. Wait for SSL certificate to be provisioned (automatic)

## Step 8: Configure Continuous Deployment

Good news! This is already set up automatically:
- Every push to your `main` branch will trigger a new deployment
- Pull requests get preview deployments

**Tip**: To avoid hitting the 300 build minute limit, avoid pushing trivial changes. Batch your commits or use feature branches.

## Post-Deployment Tasks

### Monitor Your Usage

1. Go to your Netlify dashboard
2. Check **"Team settings"** → **"Billing"**
3. Monitor:
   - Build minutes used (max 300/month on free tier)
   - Bandwidth used (max 100 GB/month)

### Set Up Notifications

1. Go to **Site settings** → **Notifications**
2. Enable build failure notifications
3. Set up bandwidth usage alerts (optional)

## Troubleshooting

### Build Fails

If your build fails:
1. Check the build logs in Netlify dashboard
2. Common issues:
   - Missing environment variables
   - Node version mismatch
   - Dependency installation errors

### API Routes Not Working

If API routes return 404:
1. Verify your Next.js version supports API routes
2. Check that routes are in `src/app/api/*/route.ts` format
3. Review Netlify function logs in dashboard

### Out of Build Minutes

If you hit the 300 minute limit:
1. Wait until next month (limit resets)
2. Or upgrade to Netlify Pro ($19/month)
3. Or migrate to Vercel Pro ($20/month)

## Migration to Vercel Pro (Future)

When you're ready to upgrade (making $20+/month from ads):

1. Go to [vercel.com](https://vercel.com)
2. Import the same GitHub repo
3. Configure environment variables
4. Deploy
5. Update your domain DNS to point to Vercel
6. Delete Netlify site when ready

## Useful Netlify Features

### Preview Deployments
- Every PR gets a unique preview URL
- Test changes before merging to main

### Rollbacks
- Go to **Deploys** tab
- Click on any previous deploy
- Click **"Publish deploy"** to rollback

### Deploy Hooks
- Create webhook URLs to trigger deploys
- Useful for CMS integrations or scheduled rebuilds

### Analytics (Paid)
- Netlify Analytics costs $9/month
- Alternative: Use Google Analytics for free

---

## Cost Monitoring Strategy

To stay within free tier:

1. **Build Minutes** (300/month):
   - ~10 builds/day if each takes 1 minute
   - Batch your commits
   - Use local testing before deploying

2. **Bandwidth** (100 GB/month):
   - With images/videos, monitor usage
   - If you hit limits, consider:
     - Cloudflare CDN in front
     - Image optimization
     - Upgrading to Pro

3. **When to Upgrade**:
   - Ad revenue > $20/month → Upgrade
   - Need more builds → Upgrade
   - Need more bandwidth → Upgrade

---

**Congratulations!** Your Instagram Saver app is now live on Netlify! 🎉

Share your deployed URL and start earning from those Google Ads! 💰

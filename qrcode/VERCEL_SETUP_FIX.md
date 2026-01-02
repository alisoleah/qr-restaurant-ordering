# Vercel Database Connection Fix

## Problem
Error: "FATAL: Tenant or user not found" - Vercel cannot connect to Supabase database

## Solution

### Step 1: Get Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Click "Project Settings" (gear icon in sidebar)
3. Click "Database" tab
4. Scroll to "Connection string" section
5. **IMPORTANT:** Select "Connection pooling" mode (NOT "Session mode")
6. Copy the connection string - it should look like:
   ```
   postgresql://postgres.xxxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### Step 2: Update Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project (qr-restaurant-ordering or splytro)
3. Go to "Settings" tab
4. Click "Environment Variables" in left sidebar
5. Find `DATABASE_URL` variable
6. Click "Edit" or add new if missing
7. **Paste your connection pooling URL** (the one with `:6543` port and `?pgbouncer=true`)
8. Make sure it's enabled for all environments (Production, Preview, Development)
9. Click "Save"

### Step 3: Redeploy

After updating the environment variable:
1. Go to "Deployments" tab
2. Find the latest deployment
3. Click "..." menu → "Redeploy"
4. OR push a small commit to trigger new deployment

### Step 4: Reset Admin Password

Since you don't have the admin password, let's create a script to reset it:

Run this locally (make sure you have the correct DATABASE_URL in your .env file):

```bash
cd qrcode
node scripts/reset-admin-password.js
```

This will set admin password to: `Admin123!`

## Common Mistakes to Avoid

❌ **Don't use** the direct connection string (port 5432)
✅ **Do use** the connection pooling string (port 6543 with pgbouncer=true)

❌ Wrong: `postgresql://...@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
✅ Correct: `postgresql://...@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

## Verification

After redeployment, check:
1. Visit https://splytro.com/table/12
2. Should load without errors
3. Menu items should appear
4. Login at https://splytro.com/admin/login with `Admin123!`

## If Still Not Working

Check Vercel runtime logs:
1. Go to Vercel dashboard → Deployments
2. Click on latest deployment
3. Go to "Functions" tab
4. Look for any new errors

The error should change from "Tenant or user not found" to actual data loading.

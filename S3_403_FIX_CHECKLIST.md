# S3 403 Forbidden - Complete Fix Checklist

## Current Error
"Failed to upload to S3: 403 Forbidden"

This means the presigned URL is generated, but S3 rejects the PUT request.

## ✅ Step-by-Step Fix

### Step 1: Configure CORS (REQUIRED)

1. **Go to AWS Console** → **S3** → Click bucket **`konnecthere`**
2. **Click "Permissions" tab**
3. **Scroll to "Cross-origin resource sharing (CORS)"**
4. **Click "Edit"**
5. **Delete any existing CORS configuration**
6. **Paste this EXACT configuration:**

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": [
      "https://konnecthere.com",
      "https://www.konnecthere.com",
      "http://localhost:3000"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

7. **Click "Save changes"**
8. **Wait 1-2 minutes** for changes to propagate

### Step 2: Check Block Public Access Settings

1. **Go to AWS Console** → **S3** → Click bucket **`konnecthere`**
2. **Click "Permissions" tab**
3. **Scroll to "Block Public Access settings for this bucket"**
4. **Click "Edit"**
5. **Uncheck ALL of these:**
   - ❌ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ❌ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ❌ Block public access to buckets and objects granted through new public bucket or access point policies
   - ❌ Block public and cross-account access to buckets and objects through any public bucket or access point policies

6. **Click "Save changes"**
7. **Type "confirm"** when prompted

**Why this is safe:** We're using presigned URLs, not making the bucket public. Presigned URLs work even with these settings off.

### Step 3: Verify IAM User Permissions

1. **Go to AWS Console** → **IAM** → **Users**
2. **Click on `konnecthere-s3-user`**
3. **Click "Permissions" tab**
4. **Verify `AmazonS3FullAccess` is listed**
5. **If NOT, add it:**
   - Click **"Add permissions"**
   - Select **"Attach policies directly"**
   - Search for **`AmazonS3FullAccess`**
   - Check the box next to it
   - Click **"Next"** → **"Add permissions"**

### Step 4: Verify Environment Variables in Vercel

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **Verify these 4 variables exist:**
   - `AWS_REGION` = `eu-north-1`
   - `AWS_ACCESS_KEY_ID` = (your access key)
   - `AWS_SECRET_ACCESS_KEY` = (your secret key)
   - `AWS_S3_BUCKET_NAME` = `konnecthere`
3. **Make sure they're enabled for Production, Preview, AND Development**
4. **If you just added/changed them, REDEPLOY:**
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

### Step 5: Test the Configuration

1. **After completing Steps 1-4, wait 2-3 minutes**
2. **Go to:** `https://konnecthere.com/api/test-upload`
   - This will show if AWS is configured correctly
3. **Try uploading a resume again**

## Common Mistakes

❌ **CORS not configured** - This is the #1 cause of 403 errors
❌ **Block Public Access still enabled** - Blocks presigned URL uploads
❌ **Wrong region** - Bucket in `eu-north-1` but env var says `us-east-1`
❌ **Wrong bucket name** - Using `konnecthere-resumes` instead of `konnecthere`
❌ **Didn't redeploy** - Environment variables only take effect after redeploy

## Verification Checklist

- [ ] CORS configured with PUT method allowed
- [ ] Block Public Access settings disabled (all unchecked)
- [ ] IAM user has `AmazonS3FullAccess` policy
- [ ] All 4 environment variables set in Vercel
- [ ] Environment variables enabled for all environments
- [ ] Vercel project redeployed after adding variables
- [ ] Region matches: `eu-north-1`
- [ ] Bucket name matches: `konnecthere`

## Still Not Working?

1. **Check browser console (F12)** - Look for CORS errors
2. **Check Vercel logs** - Look for S3 errors
3. **Test endpoint:** `https://konnecthere.com/api/test-upload` - See what it says
4. **Try a different file** - Sometimes specific files cause issues

## Quick Test

After fixing CORS and Block Public Access:

1. Wait 2-3 minutes for AWS changes to propagate
2. Try uploading again
3. If still 403, check the browser console (F12) for the exact error


# AWS S3 Quick Setup Guide

## Why You Need This

AWS S3 is required for resume uploads. Without it, users cannot upload resumes when applying to jobs.

## ⚡ Quick Setup (10 minutes)

### Step 1: Create AWS Account (if you don't have one)

1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the signup process (requires credit card, but you get free tier)

### Step 2: Create S3 Bucket

1. Go to AWS Console → **S3** (search for "S3" in the top search bar)
2. Click **"Create bucket"**
3. Fill in:
   - **Bucket name**: `konnecthere-resumes` (or your preferred name)
   - **AWS Region**: Choose `us-east-1` (or your preferred region)
   - **Object Ownership**: ACLs disabled (recommended)
   - **Block Public Access**: **Uncheck** "Block all public access" (or configure CORS properly)
   - Click **"Create bucket"**

### Step 3: Configure CORS (Important!)

1. Click on your bucket name
2. Go to **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)**
4. Click **Edit**
5. Paste this configuration:

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

6. Click **Save changes**

### Step 4: Create IAM User for S3 Access

1. Go to AWS Console → **IAM** (search for "IAM")
2. Click **Users** in the left sidebar
3. Click **"Create user"**
4. **User name**: `konnecthere-s3-user`
5. Click **Next**
6. Select **"Attach policies directly"**
7. Search for and select: **`AmazonS3FullAccess`**
   - (Or create a custom policy with only PutObject, GetObject permissions for better security)
8. Click **Next** → **Create user**

### Step 5: Get Access Keys

1. Click on the user you just created (`konnecthere-s3-user`)
2. Go to **Security credentials** tab
3. Scroll to **Access keys**
4. Click **"Create access key"**
5. Select **"Application running outside AWS"**
6. Click **Next** → **Create access key**
7. **IMPORTANT**: Copy both:
   - **Access key ID** (starts with `AKIA...`)
   - **Secret access key** (click "Show" to reveal it)
   - ⚠️ **You won't be able to see the secret key again!** Save it somewhere safe.

### Step 6: Add to Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project (`konnecthere`)
2. Click **Settings** → **Environment Variables**
3. Add these 4 variables:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=paste-your-access-key-id-here
AWS_SECRET_ACCESS_KEY=paste-your-secret-access-key-here
AWS_S3_BUCKET_NAME=konnecthere-resumes
```

4. Make sure to select **Production**, **Preview**, and **Development** environments
5. Click **Save**

### Step 7: Redeploy

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
   - OR push a new commit to trigger a new deployment

### Step 8: Test

1. Go to `https://konnecthere.com/dashboard/resumes`
2. Try uploading a resume
3. It should work now! ✅

## 💰 Cost

- **AWS Free Tier**: 5 GB storage, 20,000 GET requests, 2,000 PUT requests per month
- **After free tier**: ~$0.023 per GB storage, $0.0004 per 1,000 requests
- For a job portal, you'll likely stay within free tier for a while

## 🔒 Security Tips

1. **Don't commit credentials to Git** - Always use environment variables
2. **Use IAM policies** - Only give S3 permissions, not full AWS access
3. **Rotate keys regularly** - Change access keys every 90 days
4. **Monitor usage** - Check AWS billing dashboard regularly

## ❌ Troubleshooting

### "Failed to upload resume"
- Check Vercel logs for errors
- Verify environment variables are set correctly
- Make sure you redeployed after adding variables

### "CORS error"
- Check S3 bucket CORS configuration
- Make sure your domain is in the AllowedOrigins list
- Redeploy after changing CORS

### "Access Denied"
- Check IAM user has S3 permissions
- Verify bucket name matches `AWS_S3_BUCKET_NAME`
- Check bucket region matches `AWS_REGION`

## 📞 Need Help?

Check `RESUME_UPLOAD_TROUBLESHOOTING.md` for more detailed troubleshooting.


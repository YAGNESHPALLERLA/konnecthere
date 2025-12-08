# Resume Upload Troubleshooting Guide

## Common Error: "Failed to upload resume"

This error usually means AWS S3 is not configured. Here's how to fix it:

## ✅ Solution: Configure AWS S3

### Step 1: Set Up AWS S3

1. **Create an AWS Account** (if you don't have one)
   - Go to https://aws.amazon.com/
   - Sign up for a free account

2. **Create an S3 Bucket**
   - Go to AWS Console → S3
   - Click "Create bucket"
   - Name: `konnecthere-resumes` (or your preferred name)
   - Region: Choose a region (e.g., `us-east-1`)
   - Uncheck "Block all public access" (or configure CORS properly)
   - Click "Create bucket"

3. **Create IAM User for S3 Access**
   - Go to AWS Console → IAM → Users
   - Click "Add users"
   - Username: `konnecthere-s3-user`
   - Select "Programmatic access"
   - Click "Next: Permissions"
   - Click "Attach policies directly"
   - Search for and select: `AmazonS3FullAccess` (or create a custom policy with only PutObject, GetObject permissions)
   - Click "Next" → "Create user"
   - **IMPORTANT**: Copy the **Access Key ID** and **Secret Access Key** (you won't see them again!)

4. **Configure CORS (Important!)**
   - Go to your S3 bucket → Permissions → CORS
   - Add this CORS configuration:
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

### Step 2: Add Environment Variables to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add these variables:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
AWS_S3_BUCKET_NAME=konnecthere-resumes
```

3. **Redeploy** your application after adding the variables

### Step 3: Verify Configuration

After adding the environment variables and redeploying:

1. Go to `/dashboard/resumes`
2. Try uploading a resume
3. If it still fails, check the browser console (F12) for detailed error messages

## 🔍 Debugging Steps

### Check if AWS Credentials are Set

The error message will now tell you if:
- AWS credentials are missing
- AWS credentials are invalid
- S3 bucket doesn't exist
- CORS is not configured

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try uploading a resume
4. Look for error messages that will tell you exactly what's wrong

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Look for errors related to:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3`
   - `generateUploadUrl`

## 🚨 Common Issues

### Issue 1: "AWS S3 credentials are not configured"
**Solution**: Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to Vercel environment variables

### Issue 2: "Invalid AWS credentials"
**Solution**: 
- Double-check your Access Key ID and Secret Access Key
- Make sure there are no extra spaces
- Regenerate keys if needed

### Issue 3: "S3 bucket does not exist"
**Solution**: 
- Check that `AWS_S3_BUCKET_NAME` matches your actual bucket name
- Make sure the bucket exists in the correct region

### Issue 4: CORS Error
**Solution**: 
- Add your domain to S3 bucket CORS configuration
- Make sure CORS allows `PUT` method
- Redeploy after changing CORS

### Issue 5: "Failed to upload to S3: 403"
**Solution**: 
- Check IAM user has S3 permissions
- Verify bucket policy allows uploads
- Check bucket region matches `AWS_REGION`

## 📝 Quick Checklist

- [ ] AWS account created
- [ ] S3 bucket created
- [ ] IAM user created with S3 permissions
- [ ] Access Key ID and Secret Access Key copied
- [ ] CORS configured on S3 bucket
- [ ] Environment variables added to Vercel:
  - [ ] `AWS_REGION`
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_S3_BUCKET_NAME`
- [ ] Vercel project redeployed after adding variables
- [ ] Tested resume upload

## 💡 Alternative: Use Local Storage (Development Only)

For local development without AWS, you could modify the code to store files locally, but this won't work in production on Vercel (which is serverless).

## 📞 Still Having Issues?

1. Check Vercel logs for detailed error messages
2. Check browser console for client-side errors
3. Verify all environment variables are set correctly
4. Make sure you redeployed after adding environment variables


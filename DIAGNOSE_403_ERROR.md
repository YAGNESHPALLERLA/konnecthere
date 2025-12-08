# Diagnose 403 Forbidden Error

## ✅ What You've Done Correctly

1. ✅ CORS configured correctly
2. ✅ Block Public Access is OFF
3. ✅ IAM user created

## 🔍 Let's Find the Exact Issue

### Step 1: Test AWS Configuration

Go to: `https://konnecthere.com/api/test-upload`

This will show you:
- If environment variables are loaded
- If S3 client can be initialized
- What the exact configuration is

### Step 2: Check IAM User Permissions

1. Go to **AWS Console** → **IAM** → **Users** → **`konnecthere-s3-user`**
2. Click **"Permissions"** tab
3. **Verify these policies are attached:**
   - `AmazonS3FullAccess` (should be there)

4. **If `AmazonS3FullAccess` is NOT there:**
   - Click **"Add permissions"**
   - Select **"Attach policies directly"**
   - Search for **`AmazonS3FullAccess`**
   - Check the box and click **"Add permissions"**

### Step 3: Check Bucket Policy

1. Go to **AWS Console** → **S3** → **`konnecthere`** bucket
2. Click **"Permissions"** tab
3. Scroll to **"Bucket policy"**
4. **If there's a bucket policy**, it might be blocking uploads
5. **If there's NO bucket policy**, that's fine - we don't need one

### Step 4: Verify Environment Variables Match

Make sure in Vercel:
- `AWS_REGION` = `eu-north-1` (NOT `us-east-1`)
- `AWS_S3_BUCKET_NAME` = `konnecthere` (NOT `konnecthere-resumes`)

### Step 5: Check Vercel Logs

1. Go to **Vercel Dashboard** → Your Project → **Logs** tab
2. Try uploading a resume
3. Look for errors mentioning:
   - "403"
   - "Forbidden"
   - "AccessDenied"
   - "SignatureDoesNotMatch"

### Step 6: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try uploading a resume
4. Look for:
   - CORS errors
   - Network errors
   - Any error messages

## Common Issues Even After CORS

### Issue 1: IAM User Missing Permissions
**Check:** Does `konnecthere-s3-user` have `AmazonS3FullAccess`?
**Fix:** Attach the policy if missing

### Issue 2: Wrong Region
**Check:** Is `AWS_REGION` in Vercel set to `eu-north-1`?
**Fix:** Update to `eu-north-1` and redeploy

### Issue 3: Wrong Bucket Name
**Check:** Is `AWS_S3_BUCKET_NAME` in Vercel set to `konnecthere`?
**Fix:** Update to `konnecthere` and redeploy

### Issue 4: Bucket Policy Blocking
**Check:** Is there a bucket policy that might be blocking?
**Fix:** Remove or modify the bucket policy

### Issue 5: Presigned URL Issue
**Check:** The presigned URL might be malformed
**Fix:** Check Vercel logs for S3 errors

## Quick Test

After checking all above:

1. **Redeploy Vercel** (even if you didn't change env vars, this refreshes them)
2. **Wait 2-3 minutes**
3. **Try uploading again**

## Still Not Working?

Share the output from:
- `https://konnecthere.com/api/test-upload` (what does it show?)
- Browser console errors (F12 → Console tab)
- Vercel logs (any S3-related errors?)

This will help identify the exact issue.


# S3 Upload Test Checklist

## ✅ CORS Configuration - VERIFIED
Your CORS test passed! The response shows:
- `Access-Control-Allow-Origin: https://konnecthere.com` ✅
- All required methods are allowed ✅

## Remaining Checks

### 1. Verify Environment Variables
Check your `.env` file has:
```bash
AWS_REGION="eu-north-1"
AWS_S3_BUCKET_NAME="konnecthere"
AWS_ACCESS_KEY_ID="AKIAYMAFFMINJKRDVH5W"  # Your actual key
AWS_SECRET_ACCESS_KEY="your-secret-key"
```

### 2. Test Public Read (if using public access)
```bash
# This will fail if bucket policy isn't set, but that's OK if using presigned URLs
curl -I https://konnecthere.s3.eu-north-1.amazonaws.com/profile-pictures/test
```

### 3. Test Actual Upload in Browser
1. Go to https://konnecthere.com (or http://localhost:3000)
2. Sign in to your account
3. Navigate to "My Profile" or click your name in navbar
4. Click the camera icon on your profile picture
5. Select an image file
6. Check browser console (F12) for errors
7. Verify image appears after upload

### 4. Check Server Logs
After attempting upload, check your server logs for:
- `[S3] Error uploading profile picture:` - indicates S3 upload issue
- `[PROFILE] Profile picture updated successfully:` - indicates success
- `[AUTH]` messages - indicates auth issues

## Expected Behavior

### If Using Public Read (Bucket Policy):
- Upload should work
- Image URL should be directly accessible: `https://konnecthere.s3.eu-north-1.amazonaws.com/profile-pictures/...`
- Image should load in browser without authentication

### If Using Presigned URLs (Private Bucket):
- Upload should work
- Image URL will be presigned (temporary, expires after 1 hour)
- Direct access to S3 URL will return 403 (this is expected)

## Troubleshooting

### If upload still fails with 403:
1. Check bucket policy allows `s3:GetObject` for `profile-pictures/*`
2. Check "Block public access" is disabled (if using public read)
3. Verify IAM user has `s3:PutObject` permission

### If upload fails with 500:
1. Check IAM user permissions (should have `s3:PutObject`)
2. Check access key matches what's in `.env`
3. Check server logs for specific error message

### If image uploads but doesn't display:
1. Check browser console for CORS errors
2. Verify image URL is correct in database
3. Check Next.js image configuration in `next.config.ts`


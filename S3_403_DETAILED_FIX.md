# Detailed Fix for S3 403 Forbidden Error

## Root Cause

When generating a presigned URL with `ContentType` specified in the `PutObjectCommand`, AWS includes that Content-Type in the signature. The PUT request **MUST** include the **exact same** Content-Type header, otherwise AWS rejects it with a 403 Forbidden error.

## The Problem

1. Browser might add charset to Content-Type (e.g., `application/pdf; charset=utf-8`)
2. The presigned URL was generated with just `application/pdf`
3. Mismatch causes signature validation to fail → 403 error

## The Fix

1. **Normalize Content-Type** in both places:
   - When generating presigned URL: Remove any charset/parameters
   - When uploading: Use the same normalized value

2. **Code Changes:**
   - `lib/s3.ts`: Normalize `fileType` before using in `PutObjectCommand`
   - `app/dashboard/resumes/page.tsx`: Normalize `file.type` before sending in PUT request
   - `app/jobs/[slug]/apply/page.tsx`: Same normalization

## Additional Checks

If 403 still persists after this fix, verify:

1. **IAM Permissions**: User has `AmazonS3FullAccess` or equivalent
2. **Bucket Policy**: No bucket policy blocking the IAM user
3. **CORS**: Correctly configured (already done)
4. **Block Public Access**: Disabled (already done)
5. **Environment Variables**: 
   - `AWS_REGION` = `eu-north-1`
   - `AWS_S3_BUCKET_NAME` = `konnecthere`
   - `AWS_ACCESS_KEY_ID` = (correct key)
   - `AWS_SECRET_ACCESS_KEY` = (correct secret)
6. **Redeploy**: After any env var changes, redeploy Vercel

## Testing

After redeploy:
1. Go to `/dashboard/resumes`
2. Select a PDF file
3. Click "Upload Resume"
4. Should succeed without 403 error


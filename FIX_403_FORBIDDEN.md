# Fix 403 Forbidden Error on S3 Upload

## Error: "Failed to upload to S3: 403 Forbidden"

This means the presigned URL is being generated, but S3 is rejecting the upload due to permissions.

## ✅ Solutions (Try in Order)

### Solution 1: Configure CORS on S3 Bucket (MOST COMMON FIX)

1. Go to **AWS Console** → **S3** → Click on your bucket **`konnecthere`**
2. Click **"Permissions"** tab
3. Scroll to **"Cross-origin resource sharing (CORS)"**
4. Click **"Edit"**
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

6. Click **"Save changes"**

### Solution 2: Check IAM User Permissions

1. Go to **AWS Console** → **IAM** → **Users**
2. Click on **`konnecthere-s3-user`**
3. Go to **"Permissions"** tab
4. Make sure **`AmazonS3FullAccess`** policy is attached
5. If not, click **"Add permissions"** → **"Attach policies directly"**
6. Search for and select **`AmazonS3FullAccess`**
7. Click **"Add permissions"**

### Solution 3: Check Bucket Policy

1. Go to **AWS Console** → **S3** → Click on bucket **`konnecthere`**
2. Click **"Permissions"** tab
3. Scroll to **"Bucket policy"**
4. If there's a bucket policy, make sure it allows your IAM user to upload

If you need a bucket policy, here's a basic one (replace `YOUR_ACCOUNT_ID` and `YOUR_IAM_USER_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPutObject",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/konnecthere-s3-user"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::konnecthere/*"
    }
  ]
}
```

### Solution 4: Check Block Public Access Settings

1. Go to **AWS Console** → **S3** → Click on bucket **`konnecthere`**
2. Click **"Permissions"** tab
3. Scroll to **"Block Public Access settings"**
4. Click **"Edit"**
5. **Uncheck** "Block all public access" (or at least uncheck "Block public access to buckets and objects granted through new public bucket or access point policies")
6. Click **"Save changes"**
7. Type **"confirm"** when prompted

**Note:** This is safe because we're using presigned URLs, not making the bucket public.

### Solution 5: Verify Region Matches

Make sure:
- Your S3 bucket is in region: **`eu-north-1`** (Europe Stockholm)
- Your Vercel environment variable `AWS_REGION` is set to: **`eu-north-1`**

## Quick Checklist

- [ ] CORS configured on S3 bucket
- [ ] IAM user has `AmazonS3FullAccess` policy
- [ ] Bucket policy allows uploads (if present)
- [ ] Block Public Access settings allow presigned URLs
- [ ] Region matches (`eu-north-1`)
- [ ] Vercel project redeployed after adding environment variables

## Test After Fixing

1. Configure CORS (Solution 1) - This fixes 90% of 403 errors
2. Try uploading again
3. If still failing, check IAM permissions (Solution 2)

## Why 403 Happens

- **CORS not configured**: Browser blocks the PUT request
- **IAM permissions**: User doesn't have S3 write permissions
- **Bucket policy**: Policy is blocking the upload
- **Block Public Access**: Settings are too restrictive

The most common cause is **missing CORS configuration** - fix that first!


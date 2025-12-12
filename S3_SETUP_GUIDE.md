# S3 Bucket Setup Guide

## Current Configuration

Based on the error logs, your S3 bucket is:
- **Bucket Name:** `konnecthere`
- **Region:** `eu-north-1`

## Required Setup Steps

### 1. Update Environment Variables

Ensure your `.env` file has:

```bash
AWS_REGION="eu-north-1"
AWS_S3_BUCKET_NAME="konnecthere"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
```

### 2. Configure S3 CORS Policy

Go to AWS S3 Console → Your bucket (`konnecthere`) → Permissions → CORS

Paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD", "DELETE"],
    "AllowedOrigins": [
      "https://konnecthere.com",
      "https://www.konnecthere.com",
      "http://localhost:3000",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": ["ETag", "x-amz-request-id"],
    "MaxAgeSeconds": 3000
  }
]
```

### 3. Configure Bucket Policy (Option A: Public Read)

If you want profile pictures to be publicly accessible, add this bucket policy:

Go to AWS S3 Console → Your bucket → Permissions → Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicReadProfilePictures",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": [
        "arn:aws:s3:::konnecthere/profile-pictures/*",
        "arn:aws:s3:::konnecthere/resumes/*"
      ]
    }
  ]
}
```

**Important:** Replace `konnecthere` with your actual bucket name if different.

### 4. Disable Block Public Access (If Using Public Read)

If you use the public read policy above, you need to:

1. Go to AWS S3 Console → Your bucket → Permissions
2. Click "Edit" on "Block public access"
3. Uncheck "Block all public access" (or at least uncheck "Block public access to buckets and objects granted through new access control lists (ACLs)")
4. Save changes

**Warning:** Only do this if you want profile pictures and resumes to be publicly accessible. For better security, use presigned URLs instead (see Option B).

### 5. Option B: Use Presigned URLs (More Secure)

If you prefer not to make objects public, the code now supports presigned URLs:

1. Keep bucket private (Block public access enabled)
2. Don't add the public read bucket policy
3. The app will generate presigned GET URLs when needed

The upload flow will use presigned PUT URLs, and you can generate presigned GET URLs for viewing.

## Testing

### Test CORS Configuration

```bash
curl -X OPTIONS https://konnecthere.s3.eu-north-1.amazonaws.com/profile-pictures/test \
  -H "Origin: https://konnecthere.com" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

You should see `Access-Control-Allow-Origin` in the response headers.

### Test Public Read (if using Option A)

```bash
curl -I https://konnecthere.s3.eu-north-1.amazonaws.com/profile-pictures/test
```

Should return `200 OK` if public read is working.

### Test Upload

1. Sign in to the app
2. Go to "My Profile"
3. Click the camera icon on your profile picture
4. Select an image
5. Check browser console for errors
6. Verify image appears after upload

## Troubleshooting

### 403 Forbidden Errors

**Cause:** Bucket policy or ACL doesn't allow public read, or CORS is misconfigured.

**Fix:**
1. Check bucket policy allows `s3:GetObject` for the path
2. Check CORS configuration includes your domain
3. Verify Block Public Access settings
4. Check IAM user has `s3:PutObject` and `s3:PutObjectAcl` permissions

### 500 Upload Errors

**Cause:** IAM user doesn't have upload permissions, or ACL is not supported.

**Fix:**
1. Ensure IAM user has these permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:PutObjectAcl",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::konnecthere/*"
       }
     ]
   }
   ```
2. The code now handles ACL errors gracefully - if ACL is disabled, it uploads without ACL

### Region Mismatch

**Cause:** Environment variable `AWS_REGION` doesn't match bucket region.

**Fix:** Set `AWS_REGION="eu-north-1"` in your `.env` file.

## IAM User Permissions

Your IAM user needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::konnecthere",
        "arn:aws:s3:::konnecthere/*"
      ]
    }
  ]
}
```

## Security Best Practices

1. **Use Presigned URLs** for better security (objects stay private)
2. **Restrict CORS** to only your domains
3. **Use IAM roles** instead of access keys when possible (e.g., on EC2/ECS)
4. **Rotate access keys** regularly
5. **Enable S3 access logging** to monitor usage
6. **Use bucket versioning** to recover from accidental deletions


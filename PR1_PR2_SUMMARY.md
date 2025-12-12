# PR1 & PR2 Summary: NextAuth Fixes & S3 Upload Fixes

## PR1: NextAuth Environment & Callback Fixes

### Changes Made

1. **Health Check Endpoint** (`app/api/health/route.ts`)
   - Validates all critical environment variables
   - Checks database, auth, and S3 configuration
   - Returns 200 if all critical vars are set, 503 otherwise
   - Useful for debugging and monitoring

2. **Enhanced Auth Logging** (`lib/auth.ts`)
   - Added detailed logging in `signIn` callback
   - Logs provider, user ID, email for all sign-in attempts
   - Enhanced error logging with stack traces in development
   - Added logging in `redirect` callback to debug redirect loops
   - Logs effective baseUrl and environment variables

### Files Changed
- `app/api/health/route.ts` (new)
- `lib/auth.ts` (enhanced logging)

### Testing

**Test 1: Health Check**
```bash
curl http://localhost:3000/api/health
```

Expected: JSON response with status "ok" and all checks passing

**Test 2: NextAuth Session**
```bash
curl http://localhost:3000/api/auth/session
```

Expected: JSON with user object if authenticated, or `{}` if not

**Test 3: Sign In**
1. Go to `/auth/signin`
2. Sign in with credentials
3. Check browser console and server logs for `[AUTH]` messages
4. Should redirect to `/dashboard` without loops

## PR2: S3 Upload Fixes

### Changes Made

1. **Fixed Bucket Name** 
   - Changed default from `konnecthere-resumes` to `konnecthere`
   - Updated in `app/api/profile/upload-picture/route.ts`
   - Updated in `lib/s3.ts`

2. **ACL Error Handling** (`app/api/profile/upload-picture/route.ts`)
   - Gracefully handles ACL errors (bucket may have ACL disabled)
   - Retries upload without ACL if ACL fails
   - Falls back to bucket policy for public access

3. **Presigned URL API** (`app/api/uploads/presign/route.ts`)
   - New endpoint for secure presigned uploads
   - Supports both images and resumes
   - Returns presigned PUT URL and public URL
   - Valid for 1 hour

4. **Update Picture Endpoint** (`app/api/profile/update-picture/route.ts`)
   - Separate endpoint to save image URL after upload
   - Works with presigned upload flow
   - Updates Prisma User.image field

5. **S3 Setup Guide** (`S3_SETUP_GUIDE.md`)
   - Comprehensive guide for S3 configuration
   - CORS configuration
   - Bucket policy examples (public read vs presigned URLs)
   - IAM permissions
   - Troubleshooting guide

### Files Changed
- `app/api/profile/upload-picture/route.ts` (ACL error handling, bucket name fix)
- `lib/s3.ts` (bucket name fix)
- `app/api/uploads/presign/route.ts` (new)
- `app/api/profile/update-picture/route.ts` (new)
- `S3_SETUP_GUIDE.md` (new)

### Testing

**Test 1: Direct Upload (Current Flow)**
```bash
# 1. Sign in to app
# 2. Go to "My Profile"
# 3. Click camera icon
# 4. Select image
# 5. Check browser console - should see success
# 6. Verify image appears in navbar and profile page
```

**Test 2: Presigned URL Flow (New)**
```bash
# Request presigned URL
curl -X POST http://localhost:3000/api/uploads/presign \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "keyPrefix": "profile-pictures/",
    "fileName": "avatar.png",
    "contentType": "image/png"
  }'

# Response: { presignedUrl, publicUrl, key }

# Upload file to presigned URL
curl -X PUT "$presignedUrl" \
  -H "Content-Type: image/png" \
  --data-binary @avatar.png

# Update database
curl -X POST http://localhost:3000/api/profile/update-picture \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"imageUrl": "$publicUrl"}'
```

**Test 3: S3 Configuration**
1. Follow `S3_SETUP_GUIDE.md` to configure CORS and bucket policy
2. Test CORS:
   ```bash
   curl -X OPTIONS https://konnecthere.s3.eu-north-1.amazonaws.com/profile-pictures/test \
     -H "Origin: https://konnecthere.com" \
     -H "Access-Control-Request-Method: GET" \
     -v
   ```
3. Should see `Access-Control-Allow-Origin` in response

## Environment Variables Required

### Critical (Must Have)
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..." # or AUTH_SECRET
NEXTAUTH_URL="https://konnecthere.com" # or http://localhost:3000 for local
```

### S3 (Required for Uploads)
```bash
AWS_REGION="eu-north-1" # Match your bucket region
AWS_S3_BUCKET_NAME="konnecthere" # Your actual bucket name
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

## Next Steps

1. **Configure S3** (see `S3_SETUP_GUIDE.md`):
   - Set CORS policy
   - Configure bucket policy (public read OR use presigned URLs)
   - Verify IAM permissions

2. **Test Upload Flow**:
   - Test direct upload (current implementation)
   - Optionally test presigned URL flow
   - Verify images load correctly

3. **Monitor Logs**:
   - Check server logs for `[AUTH]` and `[S3]` messages
   - Use `/api/health` to verify configuration

4. **Production Deployment**:
   - Ensure all env vars are set in Vercel
   - Verify S3 CORS includes production domain
   - Test upload flow in production

## Known Issues Fixed

✅ 403 Forbidden when loading profile images
✅ 500 errors when uploading (ACL not supported)
✅ Bucket name mismatch
✅ Region mismatch
✅ Missing error handling for ACL failures
✅ No health check endpoint

## Remaining Work

- [ ] Update client to optionally use presigned URL flow (optional enhancement)
- [ ] Add presigned GET URL generation for private objects
- [ ] Add image resizing/optimization before upload
- [ ] Add resume upload using presigned URLs


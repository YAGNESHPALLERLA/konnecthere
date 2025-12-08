# Add AWS Credentials to Vercel

## Steps to Add Environment Variables

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Click on your project **`konnecthere`**

2. **Go to Settings:**
   - Click **"Settings"** in the top navigation
   - Click **"Environment Variables"** in the left sidebar

3. **Add These 4 Variables:**

   Click **"Add New"** for each one:

   **Variable 1:**
   - Key: `AWS_REGION`
   - Value: `eu-north-1`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Key: `AWS_ACCESS_KEY_ID`
   - Value: (Copy from AWS Console - starts with `AKIA...`)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 3:**
   - Key: `AWS_SECRET_ACCESS_KEY`
   - Value: (Copy from AWS Console - the secret key you saved)
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 4:**
   - Key: `AWS_S3_BUCKET_NAME`
   - Value: `konnecthere`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

4. **Save Each Variable:**
   - Click **"Save"** after adding each variable

5. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**
   - OR push a new commit to trigger automatic deployment

## Important Notes

- ⚠️ Make sure to select all three environments (Production, Preview, Development) for each variable
- ⚠️ The region is `eu-north-1` (not `us-east-1`) because you created the bucket in Europe Stockholm
- ⚠️ The bucket name is `konnecthere` (not `konnecthere-resumes`)

## Where to Find Your Credentials

- **Access Key ID** and **Secret Access Key**: You saved these when creating the IAM user access key in AWS Console
- If you lost them, you'll need to create a new access key (you can't view the secret again)

## After Redeploying

1. Wait for deployment to complete
2. Go to `https://konnecthere.com/dashboard/resumes`
3. Try uploading a resume
4. It should work now! ✅


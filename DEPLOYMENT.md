# 🚀 Deployment Guide: E-Waste Hub

This guide will help you deploy the E-Waste Hub application to Netlify (frontend) and your preferred backend hosting service.

## 📋 Prerequisites

- GitHub account
- Netlify account
- Your backend deployed and accessible via HTTPS

## 🎯 Deployment Strategy

### Frontend: Next.js → Netlify
### Backend: NestJS → Railway/Render/DigitalOcean

---

## 🌐 Step 1: Deploy Frontend to Netlify

### Option A: GitHub Integration (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and authorize
   - Select your `ebs` repository

3. **Configure Build Settings:**
   ```
   Base directory: ebs-web
   Build command: npm run build
   Publish directory: ebs-web/out
   ```

4. **Set Environment Variables:**
   Go to Site Settings → Environment Variables and add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
   ```

### Option B: Manual Deploy

1. **Build locally:**
   ```bash
   cd ebs-web
   npm run build
   ```

2. **Deploy to Netlify:**
   - Drag and drop the `out` folder to netlify.com
   - Or use Netlify CLI: `npx netlify deploy --prod --dir=out`

---

## 🚀 Step 2: Deploy Backend

### Option A: Railway (Recommended)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy:**
   ```bash
   cd ebs-api
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables in Railway dashboard:**
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `GOOGLE_CLOUD_PROJECT_ID`
   - `GOOGLE_CLOUD_STORAGE_BUCKET`

### Option B: Render

1. **Create Render account and connect GitHub**
2. **Create new Web Service**
3. **Configure:**
   ```
   Root Directory: ebs-api
   Build Command: npm install
   Start Command: npm run start:prod
   ```

### Option C: DigitalOcean App Platform

1. **Create DigitalOcean account**
2. **Use App Platform with your GitHub repo**
3. **Configure build settings for ebs-api directory**

---

## ⚙️ Step 3: Configure CORS

Update your backend CORS settings to allow your Netlify domain:

```typescript
// In your main.ts or app.module.ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://your-netlify-app.netlify.app',
    'https://your-custom-domain.com'
  ],
  credentials: true,
});
```

---

## 🔧 Step 4: Update Frontend API URL

Once your backend is deployed, update the environment variable:

1. **In Netlify Dashboard:**
   - Go to Site Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to your backend URL

2. **Redeploy:**
   - Trigger a new deploy or push changes to GitHub

---

## 📝 Environment Variables Checklist

### Frontend (Netlify)
- ✅ `NEXT_PUBLIC_API_URL`

### Backend (Railway/Render/etc.)
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `GOOGLE_CLOUD_PROJECT_ID`
- ✅ `GOOGLE_CLOUD_STORAGE_BUCKET`
- ✅ `GOOGLE_APPLICATION_CREDENTIALS` (service account JSON)

---

## 🛠️ Troubleshooting

### Build Errors
- Check Node.js version (should be 22+)
- Verify all dependencies are installed
- Check for TypeScript errors

### CORS Issues
- Ensure backend CORS includes your Netlify domain
- Check that API URLs are correct

### Image Loading Issues
- Verify Google Cloud Storage bucket permissions
- Check image proxy endpoints are working

---

## 🎉 Success!

Your E-Waste Hub should now be live! 

- **Frontend:** `https://your-app.netlify.app`
- **Backend:** `https://your-backend.railway.app` (or your chosen service)

## 📞 Need Help?

- Check Netlify deploy logs
- Review backend service logs  
- Verify environment variables are set correctly 
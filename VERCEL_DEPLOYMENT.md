# 🚀 Quick Vercel + Render Deployment Guide

## Problem
You deployed frontend to Vercel, but backend is still local. Vercel can't access localhost!

## Solution: Deploy Backend to Render

### Step 1: Prepare Backend for Deployment

1. **Ensure server/package.json has start script:**
   ```json
   {
     "scripts": {
       "start": "tsx index.ts",
       "dev": "nodemon --exec tsx index.ts"
     }
   }
   ```

2. **Create render.yaml in server folder** (if not exists):
   ```yaml
   services:
     - type: web
       name: messenger-backend
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: MONGODB_URI
           sync: false
         - key: JWT_SECRET
           generateValue: true
         - key: PORT
           value: 10000
   ```

### Step 2: Deploy to Render

1. **Go to:** https://render.com
2. **Sign up/Login** (use GitHub)
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository:** `omprakashmm/messenger`
5. **Configure:**
   - **Name:** messenger-backend
   - **Root Directory:** `server`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

6. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   
   ```
   NODE_ENV = production
   PORT = 10000
   JWT_SECRET = your-super-secret-key-change-this-in-production
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/messenger
   ```

7. **Click "Create Web Service"**

### Step 3: Set Up MongoDB Atlas (Required for Production)

1. **Go to:** https://www.mongodb.com/cloud/atlas
2. **Create free cluster** (M0 tier)
3. **Create database user:**
   - Username: messenger_user
   - Password: (generate strong password)
4. **Whitelist IP:** 
   - Click "Network Access"
   - Add IP: `0.0.0.0/0` (allow from anywhere)
5. **Get connection string:**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
6. **Add to Render environment variables:**
   ```
   MONGODB_URI=mongodb+srv://messenger_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/messenger?retryWrites=true&w=majority
   ```

### Step 4: Update Vercel Environment Variables

1. **Go to:** https://vercel.com
2. **Open your project:** messenger
3. **Settings → Environment Variables**
4. **Add:**
   ```
   NEXT_PUBLIC_API_URL = https://messenger-backend.onrender.com
   ```
   (Replace with your actual Render URL)

5. **Redeploy:**
   - Go to "Deployments"
   - Click "..." on latest deployment
   - Click "Redeploy"

### Step 5: Verify Deployment

1. **Check Render backend:**
   ```
   https://your-app-name.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Check Vercel frontend:**
   ```
   https://your-app.vercel.app
   ```
   Should load without "Failed to fetch" error

## Alternative: Deploy Backend to Railway

### Railway Deployment (Faster)

1. **Go to:** https://railway.app
2. **Sign up with GitHub**
3. **New Project → Deploy from GitHub**
4. **Select:** omprakashmm/messenger
5. **Add service → Select repository**
6. **Settings:**
   - **Root Directory:** `/server`
   - **Start Command:** `npm start`
7. **Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret-key
   PORT=5000
   ```
8. **Generate Domain** (Settings → Networking)
9. **Copy Railway URL** and update Vercel:
   ```
   NEXT_PUBLIC_API_URL=https://your-app.railway.app
   ```

## Quick Checklist

- [ ] Backend deployed to Render/Railway
- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string added to backend env vars
- [ ] Backend URL added to Vercel env vars (`NEXT_PUBLIC_API_URL`)
- [ ] Vercel redeployed with new env vars
- [ ] Backend health endpoint working
- [ ] Frontend can connect to backend

## Environment Variables Summary

### Backend (Render/Railway)
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/messenger
JWT_SECRET=super-secret-production-key
CLIENT_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

## Common Issues

### Issue: "Failed to fetch" on Vercel
**Fix:** Backend not deployed or wrong `NEXT_PUBLIC_API_URL`

### Issue: Backend won't start on Render
**Fix:** Check logs, ensure MongoDB URI is correct

### Issue: CORS errors
**Fix:** Add your Vercel URL to backend CORS settings in `server/index.ts`:
```typescript
cors: {
  origin: process.env.CLIENT_URL || 'https://your-app.vercel.app',
  credentials: true,
}
```

### Issue: MongoDB connection failed
**Fix:** 
- Ensure IP whitelist includes `0.0.0.0/0`
- Check username/password in connection string
- Verify cluster is active

## Testing Production

1. **Test backend:**
   ```bash
   curl https://your-backend.onrender.com/health
   ```

2. **Test frontend:**
   - Open Vercel URL
   - Try to register/login
   - Check browser console for errors

## Free Tier Limits

**Render Free:**
- Sleeps after 15 min inactivity
- First request after sleep takes ~30 seconds
- 750 hours/month

**Railway Free:**
- $5 credit/month
- No sleep
- Faster than Render

**Vercel Free:**
- Unlimited deployments
- 100GB bandwidth/month

## Success!

When everything works:
- ✅ Backend responds at Render/Railway URL
- ✅ Frontend loads on Vercel
- ✅ Can register/login
- ✅ Messages send/receive
- ✅ No CORS errors

## Need Help?

1. Check Render/Railway logs for backend errors
2. Check Vercel logs for frontend errors
3. Use browser DevTools → Network tab
4. Verify all environment variables are set

Your app is now live! 🎉

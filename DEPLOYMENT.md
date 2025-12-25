# 🚀 PulseChat Deployment Guide

## ✅ LOCAL TESTING STATUS

**Frontend (Next.js):** ✅ Running on http://localhost:3000
**Backend (Express):** ✅ Running on http://localhost:5000
**Socket.io:** ✅ Connected
**UI:** ✅ Login/Register pages working
**Status:** ✅ **READY FOR DEPLOYMENT**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Code Quality
- [x] No TypeScript errors
- [x] No build errors
- [x] Environment variables configured
- [x] Socket.io connection working
- [x] API endpoints functional

### ⚠️ Required Before Deployment
- [ ] MongoDB Atlas setup (see MONGODB-SETUP.md)
- [ ] Environment variables configured for production
- [ ] JWT secrets changed from defaults
- [ ] CORS origins configured
- [ ] Rate limiting tested

---

## 🌐 DEPLOYMENT OPTIONS

### **Option 1: Vercel (Frontend) + Railway (Backend)** ⭐ RECOMMENDED

**Best for:** Fast deployment, auto-scaling, free tier available

#### Frontend (Vercel)
**Cost:** FREE
**Time:** 5 minutes

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
     ```

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

#### Backend (Railway)
**Cost:** FREE ($5 credit/month)
**Time:** 5 minutes

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select:** `messenger` repository
5. **Root Directory:** Set to `server`
6. **Add Environment Variables:**
   ```env
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_production_jwt_secret_here
   JWT_REFRESH_SECRET=your_production_refresh_secret_here
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
7. **Deploy!**

---

### **Option 2: Vercel (Frontend) + Render (Backend)**

**Best for:** Simple deployment, good free tier

#### Frontend (Vercel)
Same as Option 1

#### Backend (Render)
**Cost:** FREE
**Time:** 5 minutes

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **New** → **Web Service**
4. **Connect** your GitHub repository
5. **Settings:**
   - Name: `pulsechat-backend`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. **Environment Variables:** (same as Railway)
7. **Create Web Service**

---

### **Option 3: Full Stack on Vercel**

**Best for:** Simplest deployment (but limited backend features)

1. **Create `vercel.json` in root:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/next"
       },
       {
         "src": "server/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "/$1"
       }
     ]
   }
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

**⚠️ Note:** Socket.io may have issues on Vercel serverless. Use Option 1 or 2 for full real-time support.

---

### **Option 4: AWS / DigitalOcean / Heroku**

**Best for:** Full control, production-grade

See detailed guide in `DEPLOYMENT-ADVANCED.md` (to be created)

---

## 🔐 PRODUCTION ENVIRONMENT VARIABLES

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (.env.production)
```env
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/pulsechat

# Security
JWT_SECRET=CHANGE_THIS_TO_RANDOM_64_CHAR_STRING
JWT_REFRESH_SECRET=CHANGE_THIS_TO_DIFFERENT_64_CHAR_STRING

# CORS
CLIENT_URL=https://your-frontend-url.vercel.app

# Optional: Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: Redis (for caching)
REDIS_URL=redis://your-redis-url:6379
```

### Generate Secure Secrets
```bash
# Run in terminal to generate random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔧 BUILD COMMANDS

### Frontend
```bash
npm run build        # Creates production build
npm run start        # Starts production server
```

### Backend
```bash
cd server
npm install          # Install dependencies
npm run build        # Compile TypeScript (if needed)
npm start            # Start production server
```

---

## 🧪 PRE-DEPLOYMENT TESTING

### 1. Test Production Build Locally
```bash
# Frontend
npm run build
npm run start

# Backend
cd server
NODE_ENV=production npm start
```

### 2. Test with Production MongoDB
Update `server/.env` with MongoDB Atlas connection string and test locally.

### 3. Test CORS
Make sure `CLIENT_URL` in backend matches your frontend URL.

---

## 📊 DEPLOYMENT PLATFORMS COMPARISON

| Platform | Frontend | Backend | Socket.io | Free Tier | Best For |
|----------|----------|---------|-----------|-----------|----------|
| **Vercel + Railway** | ✅ Excellent | ✅ Excellent | ✅ Full Support | ✅ Yes | **RECOMMENDED** |
| **Vercel + Render** | ✅ Excellent | ✅ Good | ✅ Full Support | ✅ Yes | Simple Setup |
| **Netlify + Railway** | ✅ Excellent | ✅ Excellent | ✅ Full Support | ✅ Yes | Alternative |
| **Vercel Only** | ✅ Excellent | ⚠️ Limited | ❌ Issues | ✅ Yes | Static Only |
| **AWS/DO** | ✅ Full Control | ✅ Full Control | ✅ Full Support | ❌ Paid | Production |

---

## 🚨 COMMON DEPLOYMENT ISSUES

### Issue 1: "Failed to fetch" in Production
**Cause:** Wrong API URL
**Fix:** 
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Must start with `https://`
- No trailing slash

### Issue 2: Socket.io Connection Failed
**Cause:** CORS or serverless limitations
**Fix:**
- Deploy backend on Railway/Render (not Vercel serverless)
- Add frontend URL to `CLIENT_URL` in backend

### Issue 3: MongoDB Connection Error
**Cause:** Wrong connection string or IP not whitelisted
**Fix:**
- Verify MongoDB Atlas connection string
- Add `0.0.0.0/0` to Network Access in Atlas

### Issue 4: Environment Variables Not Working
**Cause:** Not prefixed with `NEXT_PUBLIC_` for frontend
**Fix:**
- Frontend vars MUST start with `NEXT_PUBLIC_`
- Redeploy after adding env vars

---

## 📈 POST-DEPLOYMENT MONITORING

### Check These After Deployment:

1. **Frontend Health:**
   - Visit: `https://your-app.vercel.app`
   - Should see login page

2. **Backend Health:**
   - Visit: `https://your-backend.railway.app/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Socket.io Connection:**
   - Open browser console on frontend
   - Should see: "Socket connected"

4. **Database Connection:**
   - Check backend logs
   - Should see: "✅ Connected to MongoDB"

---

## 🎯 QUICK DEPLOYMENT (5 Minutes)

**Fastest way to deploy:**

1. **Setup MongoDB Atlas** (2 min)
   - Follow `MONGODB-SETUP.md`

2. **Deploy Backend to Railway** (2 min)
   - Connect GitHub repo
   - Add environment variables
   - Deploy

3. **Deploy Frontend to Vercel** (1 min)
   - Run `vercel --prod`
   - Add `NEXT_PUBLIC_API_URL`
   - Done!

---

## ✅ DEPLOYMENT VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Frontend loads at production URL
- [ ] Can register new account
- [ ] Can login
- [ ] Can send messages
- [ ] Messages appear in real-time
- [ ] Typing indicators work
- [ ] Delivery status shows
- [ ] File uploads work (if Cloudinary configured)
- [ ] No console errors
- [ ] Mobile responsive

---

## 🔒 SECURITY CHECKLIST

Before going live:

- [ ] Change all default JWT secrets
- [ ] Use strong MongoDB password
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Add helmet.js headers
- [ ] Sanitize user inputs
- [ ] Enable MongoDB encryption at rest

---

## 📞 SUPPORT

**Issues?**
1. Check backend logs in Railway/Render dashboard
2. Check browser console for frontend errors
3. Verify all environment variables
4. Test MongoDB connection separately

---

**Status:** ✅ Application is deployment-ready!
**Recommended:** Option 1 (Vercel + Railway)
**Time to Deploy:** ~10 minutes
**Cost:** FREE (with free tiers)

---

Last Updated: 2024-12-25

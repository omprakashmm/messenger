# 🚀 Quick Deploy Reference Card

## 📋 DEPLOYMENT CHECKLIST

### ✅ Pre-Deployment (Done!)
- [x] Code pushed to GitHub
- [x] TypeScript errors fixed
- [x] Dependencies added
- [x] Deployment configs created

### 🔄 MongoDB Atlas (5 min)
1. Create account: https://mongodb.com/cloud/atlas/register
2. Create FREE cluster
3. Create database user (save password!)
4. Whitelist IP: 0.0.0.0/0
5. Get connection string
6. Add `/pulsechat` before `?`

### 🔄 Render Backend (5 min)
1. Sign up: https://render.com
2. New Web Service
3. Connect: omprakashmm/messenger
4. Root Directory: `server`
5. Build: `npm install && npm run build`
6. Start: `npm start`
7. Add env vars (see below)
8. Deploy!

### 🔄 Vercel Frontend (5 min)
1. Install: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel`
4. Add env: `NEXT_PUBLIC_API_URL`
5. Redeploy: `vercel --prod`
6. Update Render CLIENT_URL

---

## 🔑 ENVIRONMENT VARIABLES

### Render (Backend)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pulsechat?retryWrites=true&w=majority
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<run command again>
CLIENT_URL=https://your-app.vercel.app
```

### Vercel (Frontend)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## 🧪 VERIFICATION TESTS

1. **Backend Health:**
   ```
   https://your-backend.onrender.com/health
   → {"status":"ok","timestamp":"..."}
   ```

2. **Frontend Loads:**
   ```
   https://your-app.vercel.app
   → PulseChat login page
   ```

3. **Register Account:**
   - Click Register
   - Fill form
   - Should login successfully

4. **Real-time Test:**
   - Open 2 browsers
   - Register 2 accounts
   - Send messages
   - Should appear instantly

---

## 🐛 QUICK FIXES

**Build fails on Render:**
→ Check Root Directory = `server`

**Frontend can't connect:**
→ Verify NEXT_PUBLIC_API_URL in Vercel

**CORS error:**
→ Update CLIENT_URL in Render

**MongoDB error:**
→ Check connection string & IP whitelist

---

## 📞 SUPPORT

**Full Guide:** `DEPLOY-RENDER-VERCEL.md`
**Fix Guide:** `DEPLOYMENT-FIX.md`
**General:** `DEPLOYMENT.md`

---

**Total Time:** 15 minutes
**Total Cost:** $0 (FREE)
**Difficulty:** Easy ⭐⭐

---

**Repository:** https://github.com/omprakashmm/messenger
**Status:** Ready to Deploy ✅

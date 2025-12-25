# 🚀 PulseChat Deployment Configuration

## ✅ Correct Environment Variables

### **Render (Backend)**
```env
PORT=5000
NODE_ENV=production
CLIENT_URL=https://messenger-uu2.vercel.app
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

### **Vercel (Frontend)**
```env
NEXT_PUBLIC_API_URL=https://messenger-ccfz.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://messenger-ccfz.onrender.com
```

---

## 🔧 Common Issues & Solutions

### Issue: "Failed to fetch" during registration

**Cause:** CORS misconfiguration - trailing slash mismatch

**Solution:**
1. Ensure `CLIENT_URL` in Render = `https://messenger-uu2.vercel.app` (NO trailing slash)
2. Redeploy backend on Render
3. Test again

---

### Issue: Environment variables not working

**Cause:** Variables added but not redeployed

**Solution:**
1. After adding/changing env vars in Vercel, go to Deployments → Redeploy
2. After adding/changing env vars in Render, service auto-redeploys

---

### Issue: CORS error in browser console

**Cause:** CLIENT_URL doesn't match frontend URL exactly

**Solution:**
1. Check browser console for exact origin being sent
2. Update CLIENT_URL in Render to match exactly (case-sensitive, no trailing slash)
3. Redeploy

---

## 🧪 Testing Checklist

- [ ] Backend health check: https://messenger-ccfz.onrender.com/health
- [ ] Frontend loads: https://messenger-uu2.vercel.app/
- [ ] Registration works (no "Failed to fetch")
- [ ] Login works
- [ ] Socket.io connects (check browser console)

---

## 📝 Deployment URLs

- **Frontend (Vercel):** https://messenger-uu2.vercel.app
- **Backend (Render):** https://messenger-ccfz.onrender.com
- **Backend Health:** https://messenger-ccfz.onrender.com/health

---

## 🔍 Debugging Tips

### Check Backend Logs (Render)
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Look for errors or CORS messages

### Check Frontend Console (Browser)
1. Open your app in browser
2. Press F12 (DevTools)
3. Go to Console tab
4. Try to register/login
5. Look for CORS or network errors

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try to register
4. Click on the failed request
5. Check:
   - Request URL
   - Request Headers (Origin)
   - Response Headers (Access-Control-Allow-Origin)

---

## ⚠️ Important Notes

1. **NO trailing slashes** in URLs (especially CLIENT_URL)
2. **Must use https://** for production URLs
3. **Case-sensitive** - URLs must match exactly
4. **Redeploy required** after changing environment variables
5. **Wait 2-3 minutes** for Render to redeploy

---

## 🎯 Quick Fix Commands

If you need to update and redeploy quickly:

```bash
# Update Render via CLI (if you have Render CLI installed)
render env set CLIENT_URL=https://messenger-uu2.vercel.app

# Or update via Dashboard (recommended)
# 1. Go to dashboard.render.com
# 2. Select service → Environment
# 3. Update CLIENT_URL
# 4. Save (auto-redeploys)
```

---

Last Updated: 2025-12-25

# 🔧 "Failed to Fetch" Error - Troubleshooting Guide

## Problem
Frontend shows "Failed to fetch" error when trying to login/register.

## Root Cause
The backend server is not running or not accessible at the expected URL.

## Solution Steps

### Step 1: Check Backend Server Status

The backend server should show:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

If you only see "Connected to MongoDB" without "Server running", there's an issue.

### Step 2: Verify MongoDB is Running

**Check if MongoDB is running:**

```powershell
# Windows - Check MongoDB service
Get-Service MongoDB

# If not running, start it:
net start MongoDB

# OR if using MongoDB Compass, just open it
```

**Alternative: Use MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `server/.env` with the connection string

### Step 3: Check Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend (server/.env):**
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/messenger
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/messenger

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server Port
PORT=5000
NODE_ENV=development
```

### Step 4: Start Backend Server Properly

**Open a NEW terminal (separate from frontend):**

```powershell
# Navigate to server directory
cd d:\git\messenger\server

# Install dependencies (if not done)
npm install

# Start the server
npm run dev
```

**You should see:**
```
[nodemon] starting `tsx index.ts`
✅ Connected to MongoDB
🚀 Server running on port 5000
```

### Step 5: Verify Server is Accessible

**Test the health endpoint:**

```powershell
# In a new terminal or browser
curl http://localhost:5000/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2025-12-26T..."}
```

### Step 6: Check Firewall/Antivirus

Sometimes Windows Firewall blocks Node.js:
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find Node.js and ensure both Private and Public are checked

### Step 7: Check Port Conflicts

If port 5000 is already in use:

```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**OR change the port:**
- Update `PORT=5001` in `server/.env`
- Update `NEXT_PUBLIC_API_URL=http://localhost:5001` in `.env.local`

## Quick Fix Commands

### Option 1: Fresh Start

```powershell
# Terminal 1 - Backend
cd d:\git\messenger\server
npm install
npm run dev

# Terminal 2 - Frontend (keep existing one running)
# Should already be running on port 3000
```

### Option 2: Use MongoDB Atlas (No Local MongoDB Needed)

1. **Create MongoDB Atlas Account:**
   - Go to https://mongodb.com/cloud/atlas
   - Sign up for free
   - Create a cluster (M0 Free tier)

2. **Get Connection String:**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

3. **Update server/.env:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/messenger?retryWrites=true&w=majority
   ```

4. **Restart backend server**

## Common Issues & Fixes

### Issue: "ECONNREFUSED"
**Fix:** MongoDB is not running
```powershell
net start MongoDB
```

### Issue: "Port 5000 already in use"
**Fix:** Change port or kill existing process
```powershell
# Change port in server/.env
PORT=5001

# Update frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Issue: "Cannot find module"
**Fix:** Install dependencies
```powershell
cd server
npm install
```

### Issue: "JWT_SECRET is not defined"
**Fix:** Create/update server/.env
```env
JWT_SECRET=my-super-secret-key-12345
```

## Verification Checklist

- [ ] MongoDB is running (local or Atlas)
- [ ] Backend server shows "🚀 Server running on port 5000"
- [ ] Frontend is running on port 3000
- [ ] `http://localhost:5000/health` returns JSON
- [ ] `.env.local` has correct `NEXT_PUBLIC_API_URL`
- [ ] `server/.env` has correct `MONGODB_URI` and `JWT_SECRET`
- [ ] No firewall blocking Node.js
- [ ] Ports 3000 and 5000 are not in use by other apps

## Still Not Working?

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for the actual error message
4. Check Network tab for failed requests

### Check Server Logs
Look at the terminal where backend is running for error messages.

### Try This Test
```powershell
# Test if backend is reachable
curl http://localhost:5000/health

# If this works, backend is fine
# If this fails, backend is not running properly
```

## Success Indicators

When everything is working:

**Backend Terminal:**
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

**Frontend Terminal:**
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

**Browser:**
- Login page loads without errors
- Can register/login successfully
- No "Failed to fetch" errors

## Need MongoDB?

### Quick MongoDB Setup

**Option A: MongoDB Community Server (Local)**
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB runs as Windows service automatically

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Free tier available
2. No installation needed
3. Accessible from anywhere
4. Automatic backups

## Summary

The "Failed to fetch" error means:
1. Backend server is not running, OR
2. Backend is running on wrong port, OR
3. MongoDB is not connected, OR
4. Environment variables are incorrect

**Quick Fix:**
1. Start MongoDB (or use Atlas)
2. Start backend: `cd server && npm run dev`
3. Verify: `curl http://localhost:5000/health`
4. Refresh frontend

Your app should now work! 🚀

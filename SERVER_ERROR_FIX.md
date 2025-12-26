# 🔧 Server Error Fix Guide

## Quick Fix Steps

### 1. Start MongoDB
```bash
# Windows
mongod

# Or if MongoDB is installed as a service
net start MongoDB
```

### 2. Restart Backend Server
```bash
cd server
npm run dev
```

### 3. Check .env File
Make sure `server/.env` has:
```
MONGODB_URI=mongodb://localhost:27017/messenger
JWT_SECRET=your-secret-key-here
PORT=5000
```

### 4. If MongoDB Connection Fails
```bash
# Create data directory
mkdir C:\data\db

# Start MongoDB
mongod --dbpath C:\data\db
```

## Common Errors & Solutions

### Error: "Cannot connect to MongoDB"
**Solution**: Start MongoDB service
```bash
mongod
```

### Error: "Port 5000 already in use"
**Solution**: Kill the process or change port
```bash
# Find process
netstat -ano | findstr :5000

# Kill it
taskkill /PID <process_id> /F

# Or change PORT in .env
PORT=5001
```

### Error: "Module not found"
**Solution**: Reinstall dependencies
```bash
cd server
npm install
```

## Test Locally

1. **Start MongoDB**: `mongod`
2. **Start Backend**: `cd server && npm run dev`
3. **Start Frontend**: `npm run dev`
4. **Visit**: http://localhost:3000

## Production (Render)

The deployed version on Render should work fine. The local error doesn't affect production.

**Visit**: https://messenger-uu2.vercel.app

The production app uses MongoDB Atlas (cloud), not local MongoDB.

## Quick Test

```bash
# Test if MongoDB is running
mongo --eval "db.version()"

# Should show MongoDB version
```

## Still Not Working?

1. Check if MongoDB is installed:
   ```bash
   mongod --version
   ```

2. If not installed, download from:
   https://www.mongodb.com/try/download/community

3. Or use MongoDB Atlas (cloud):
   - Sign up at mongodb.com/atlas
   - Get connection string
   - Update MONGODB_URI in .env

## Production is Working!

Even if local server has issues, your production app on Vercel + Render is working fine!

**Just visit**: https://messenger-uu2.vercel.app

# 🚀 Quick Start Guide - PulseChat

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] MongoDB installed locally OR MongoDB Atlas account ([Setup](https://www.mongodb.com/cloud/atlas))
- [ ] Git installed
- [ ] A code editor (VS Code recommended)

## Step-by-Step Setup

### 1️⃣ Install Dependencies

Open terminal in the project root and run:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2️⃣ Setup Environment Variables

#### Frontend Environment
Create a file named `.env.local` in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Backend Environment
Create a file named `.env` in the `server` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pulsechat
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
```

**Important**: Change `JWT_SECRET` to a random secure string for production!

### 3️⃣ Start MongoDB

#### Option A: Local MongoDB
If you have MongoDB installed locally:

```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace `MONGODB_URI` in `server/.env` with your Atlas connection string

Example:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pulsechat
```

### 4️⃣ Start the Application

#### Method 1: Using Startup Script (Recommended)

**Windows (PowerShell):**
```powershell
.\start.ps1
```

**Windows (Command Prompt):**
```cmd
start.bat
```

This will automatically start both frontend and backend servers!

#### Method 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5️⃣ Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎉 You're Ready!

1. **Register** a new account on the login page
2. **Login** with your credentials
3. **Start chatting** by creating a new conversation

## 🐛 Troubleshooting

### MongoDB Connection Error
- **Problem**: `MongoServerError: connect ECONNREFUSED`
- **Solution**: Make sure MongoDB is running. Check with `mongod --version`

### Port Already in Use
- **Problem**: `Error: listen EADDRINUSE: address already in use :::3000`
- **Solution**: 
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:3000 | xargs kill -9
  ```

### Module Not Found
- **Problem**: `Error: Cannot find module 'xyz'`
- **Solution**: 
  ```bash
  # Delete node_modules and reinstall
  rm -rf node_modules package-lock.json
  npm install
  ```

### Socket.io Connection Failed
- **Problem**: Messages not sending in real-time
- **Solution**: 
  1. Check backend is running on port 5000
  2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
  3. Check browser console for errors

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the codebase structure
- Check out the API endpoints
- Customize the UI colors in `tailwind.config.ts`

## 💡 Tips

- Use **Chrome DevTools** to debug Socket.io connections (Network tab → WS)
- Install **MongoDB Compass** for visual database management
- Use **Postman** to test API endpoints
- Enable **React DevTools** for component debugging

---

Need help? Check the main README or open an issue on GitHub!

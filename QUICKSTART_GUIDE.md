# 🚀 Quick Start Guide - Messenger

## Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- (Optional) Cloudinary account for avatar uploads

## Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

## Step 2: Environment Setup

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (server/.env)
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/messenger
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/messenger

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary (Optional - for avatar uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OTP Service (Optional - for phone verification)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number

# Server
PORT=5000
NODE_ENV=development
```

## Step 3: Start MongoDB

### Option A: Local MongoDB
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

### Option B: MongoDB Atlas
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Add to server/.env as MONGODB_URI

## Step 4: Start the Application

### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

## Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 🎯 First Time Setup

1. **Register an Account**
   - Click "Register" tab
   - Enter username, email, and password
   - Click "Create Account"

2. **Set Up Your Profile**
   - Click on your avatar in the sidebar
   - Upload a profile photo
   - Add your bio and phone number
   - Click "Save Changes"

3. **Start Chatting**
   - Click "New Chat" button
   - Search for users
   - Select a user to start conversation

## 🔐 Security Features

### End-to-End Encryption
- Messages are automatically encrypted before sending
- Keys are generated on first login
- Server never sees plaintext messages

### Profile Photos
- Upload via profile page
- Automatically optimized and stored
- Fallback to colorful initials

## 🎵 Sound & Haptics

- **Typing Sound**: Plays when you type
- **Message Sent**: Confirmation sound
- **Message Received**: Notification sound
- **Haptic Feedback**: Vibration on mobile devices

Toggle in settings (coming soon) or via:
```javascript
import { toggleSound, toggleHaptic } from '@/lib/sounds';
toggleSound(false); // Disable sounds
toggleHaptic(false); // Disable haptics
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Frontend (3000)
# Change port in package.json dev script:
"dev": "next dev -p 3001"

# Backend (5000)
# Change PORT in server/.env
PORT=5001
```

### Avatar Upload Not Working
- Check Cloudinary credentials in server/.env
- Without Cloudinary, avatars use base64 (works but not recommended for production)

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## 📱 Mobile Testing

### Local Network Access
1. Find your local IP:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Update NEXT_PUBLIC_API_URL in .env.local:
   ```env
   NEXT_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000
   ```

3. Access from mobile:
   ```
   http://YOUR_LOCAL_IP:3000
   ```

## 🚀 Production Deployment

### Option 1: Vercel (Frontend) + Render (Backend)
See `DEPLOY-RENDER-VERCEL.md` for detailed instructions

### Option 2: Railway (Full Stack)
See `QUICK-DEPLOY.md` for Railway deployment

## 💡 Tips

1. **Test with Two Accounts**: Open two browsers (or incognito) to test chat
2. **Check Console**: Open DevTools to see encryption logs
3. **MongoDB Compass**: Use MongoDB Compass to view database
4. **Network Tab**: Monitor WebSocket connections in DevTools

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: '#6366f1', // Change to your color
  secondary: '#8b5cf6',
}
```

### Modify Sounds
Edit `lib/sounds.ts` to use custom sound files

### Update Branding
- Logo: Update in `components/auth/AuthPage.tsx`
- Name: Already changed to "Messenger"
- Favicon: Replace files in `public/`

## 📊 Monitoring

### Check Server Status
```bash
curl http://localhost:5000/health
```

### View Logs
```bash
# Backend logs
cd server
npm run dev

# Frontend logs
npm run dev
```

## 🆘 Need Help?

1. Check `ENHANCEMENTS_SUMMARY.md` for feature documentation
2. Review `README.md` for architecture details
3. Check existing documentation files
4. Review code comments

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] Backend server started (port 5000)
- [ ] Frontend started (port 3000)
- [ ] Can register new account
- [ ] Can login
- [ ] Can upload avatar
- [ ] Can send messages
- [ ] Can search users
- [ ] Sounds are working
- [ ] No console errors

## 🎉 You're Ready!

Your Messenger app is now running with:
- ✅ End-to-end encryption
- ✅ Profile management
- ✅ Avatar uploads
- ✅ Sound & haptic feedback
- ✅ Premium UI/UX
- ✅ Real-time messaging

Happy chatting! 🚀

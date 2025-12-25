---
description: Complete PulseChat Setup & Development Workflow
---

# 🚀 Complete PulseChat Setup & Development Workflow

## TRACK 1: GET APP RUNNING (Setup Phase)

### Step 1: Create Environment Files

#### Frontend Environment (.env.local in root)
Create file: `d:\git\messenger\.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Backend Environment (server/.env)
Create file: `d:\git\messenger\server\.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pulsechat
JWT_SECRET=pulsechat-super-secret-jwt-key-2024-change-in-production
CLIENT_URL=http://localhost:3000
```

### Step 2: Setup MongoDB

**Option A: MongoDB Atlas (Recommended - No Installation)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace MONGODB_URI in server/.env with:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pulsechat?retryWrites=true&w=majority
   ```

**Option B: Local MongoDB**
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Run: `mongod` in terminal
4. Keep MONGODB_URI as: `mongodb://localhost:27017/pulsechat`

### Step 3: Start Both Servers

// turbo
```bash
# Stop current servers first
taskkill /F /IM node.exe
```

// turbo
```bash
# Start using the startup script
.\start.bat
```

### Step 4: Verify Setup

Open browser and test:
- Frontend: http://localhost:3000
- Backend Health: http://localhost:5000/health

---

## TRACK 2: FEATURE IMPLEMENTATION (Development Phase)

### Phase 1: Core Messaging Features (Week 1)

#### Feature 1.1: Message Delivery Status
- [ ] Add delivery status UI indicators
- [ ] Implement Socket.io acknowledgements
- [ ] Update message schema with delivery timestamps
- [ ] Add "sent", "delivered", "seen" status

#### Feature 1.2: Message Edit & Delete
- [ ] Add edit button to messages
- [ ] Create edit history tracking
- [ ] Implement delete for me/everyone
- [ ] Add "edited" label to messages

#### Feature 1.3: File Upload (Images/Videos/Files)
- [ ] Setup Cloudinary account
- [ ] Add Cloudinary config to .env
- [ ] Implement file upload API endpoint
- [ ] Add file preview UI
- [ ] Implement file compression

### Phase 2: Security & Privacy (Week 2)

#### Feature 2.1: End-to-End Encryption
- [ ] Generate RSA key pairs on registration
- [ ] Implement AES-256 message encryption
- [ ] Store encrypted messages in DB
- [ ] Decrypt messages on client side
- [ ] Add encryption indicator UI

#### Feature 2.2: Privacy Settings
- [ ] Add settings page
- [ ] Toggle read receipts ON/OFF
- [ ] Toggle last seen ON/OFF
- [ ] Toggle online status visibility
- [ ] Block/unblock users

#### Feature 2.3: Refresh Token System
- [ ] Implement refresh token generation
- [ ] Add refresh token endpoint
- [ ] Auto-refresh on token expiry
- [ ] Logout from all devices

### Phase 3: Enhanced Messaging (Week 3)

#### Feature 3.1: Message Reactions
- [ ] Add reaction picker UI
- [ ] Implement reaction Socket.io events
- [ ] Store reactions in DB
- [ ] Display reaction counts

#### Feature 3.2: Reply & Forward
- [ ] Add reply UI component
- [ ] Implement reply logic
- [ ] Add forward to multiple chats
- [ ] Show replied message preview

#### Feature 3.3: Voice Messages
- [ ] Add audio recording UI
- [ ] Implement WebRTC audio recording
- [ ] Upload to Cloudinary
- [ ] Add audio player component

### Phase 4: Real-time Enhancements (Week 4)

#### Feature 4.1: Redis Integration
- [ ] Setup Redis (local or cloud)
- [ ] Implement Redis caching
- [ ] Store online presence in Redis
- [ ] Cache recent messages

#### Feature 4.2: Offline Support
- [ ] Implement message queue
- [ ] Store unsent messages locally
- [ ] Retry failed messages
- [ ] Sync on reconnection

### Phase 5: Media & Calls (Week 5)

#### Feature 5.1: WebRTC Video Calls
- [ ] Setup WebRTC signaling
- [ ] Implement peer connection
- [ ] Add call UI (incoming/outgoing)
- [ ] Add call controls (mute, video toggle)

#### Feature 5.2: WebRTC Audio Calls
- [ ] Implement audio-only calls
- [ ] Add call history
- [ ] Add call notifications

### Phase 6: AI Features (Week 6)

#### Feature 6.1: Smart Reply Suggestions
- [ ] Setup OpenAI API
- [ ] Implement context analysis
- [ ] Generate 3 reply suggestions
- [ ] Add suggestion UI chips

#### Feature 6.2: Chat Summarization
- [ ] Add "Summarize" button
- [ ] Send chat history to AI
- [ ] Display summary modal
- [ ] Cache summaries

#### Feature 6.3: Toxic Content Detection
- [ ] Implement content moderation API
- [ ] Flag toxic messages
- [ ] Add warning UI
- [ ] Auto-hide severe content

### Phase 7: Advanced Features (Week 7+)

#### Feature 7.1: Disappearing Messages
- [ ] Add timer settings (24h, 7d, 30d)
- [ ] Implement auto-delete cron job
- [ ] Add countdown UI
- [ ] Notify before deletion

#### Feature 7.2: Chat Folders
- [ ] Create folder schema
- [ ] Add folder management UI
- [ ] Drag & drop chats to folders
- [ ] Filter by folder

#### Feature 7.3: Custom Themes
- [ ] Create theme system
- [ ] Add theme editor
- [ ] Save user preferences
- [ ] Apply custom colors

---

## 🔧 Development Commands

### Frontend (Next.js)
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
```

### Backend (Express)
```bash
cd server
npm run dev          # Start with nodemon
npm run start        # Start without watch
```

### Both Servers
```bash
.\start.bat          # Windows - Start both
.\start.ps1          # PowerShell - Start both
```

---

## 📋 Daily Development Checklist

- [ ] Pull latest code
- [ ] Check MongoDB is running
- [ ] Start both servers
- [ ] Test existing features
- [ ] Implement new feature
- [ ] Test new feature
- [ ] Commit changes
- [ ] Update documentation

---

## 🐛 Common Issues & Fixes

### "Failed to fetch"
- Backend not running → Run `cd server && npm run dev`
- Wrong API URL → Check NEXT_PUBLIC_API_URL in .env.local

### "MongoDB connection error"
- MongoDB not running → Start mongod or use Atlas
- Wrong connection string → Check MONGODB_URI

### "Port already in use"
- Kill existing process → `taskkill /F /IM node.exe`
- Change port in .env

---

## 📊 Feature Priority Matrix

**Must Have (P0):**
- Message delivery status
- File upload
- E2E encryption
- Privacy settings

**Should Have (P1):**
- Message reactions
- Voice messages
- Video calls
- Smart replies

**Nice to Have (P2):**
- Chat folders
- Custom themes
- Disappearing messages
- Multi-language

---

## 🎯 Success Metrics

- [ ] App runs without errors
- [ ] Real-time messaging works
- [ ] File uploads successful
- [ ] Encryption working
- [ ] Video calls functional
- [ ] AI features responding
- [ ] Mobile responsive
- [ ] Performance optimized

---

**Next Action:** Complete Step 1-4 to get app running, then start Phase 1 features!

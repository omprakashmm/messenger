# 💬 PulseChat - Premium Messenger Application

A modern, feature-rich real-time messenger application with end-to-end encryption, built with Next.js, Express, Socket.io, and MongoDB.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🔐 Security & Privacy
- **End-to-End Encryption** - Messages encrypted using TweetNaCl
- **Trust Score System** - AI-powered user trust scoring
- **Security Timeline** - Track security events and suspicious activities
- **Session Management** - Secure JWT-based authentication
- **Zero-Knowledge Architecture** - Your data stays private

### 💬 Core Messaging
- **Real-time Messaging** - Instant message delivery via Socket.io
- **Typing Indicators** - See when others are typing
- **Read Receipts** - Know when messages are delivered and read
- **Message Status** - Sent, delivered, read indicators
- **Message Reactions** - React to messages with emojis
- **Message Threads** - Organize conversations with threaded replies
- **Search in Conversation** - Find messages quickly
- **Draft Preservation** - Never lose what you're typing

### 📱 Media & Files
- **Media Sharing** - Send images, videos, and files
- **Drag & Drop Upload** - Easy file sharing
- **Audio Messages** - Record and send voice messages
- **Image Preview** - View images inline
- **File Management** - Cloudinary integration for media storage

### 🎨 User Experience
- **Premium UI/UX** - Beautiful glassmorphism design
- **Dark Mode** - Easy on the eyes
- **Mobile Responsive** - Works perfectly on all devices
- **Haptic Feedback** - Touch-optimized interface
- **Gesture Actions** - Swipe to reply, archive, delete
- **Skeleton Loaders** - Smooth loading states
- **Optimistic UI** - Instant feedback on actions
- **Virtualized Lists** - Smooth scrolling with thousands of messages

### 🔔 Notifications & Presence
- **Smart Notifications** - Context-aware notifications
- **Push Notifications** - Never miss a message
- **Online Status** - See who's online
- **Live Presence** - Real-time user activity
- **Last Seen** - Know when users were last active

### 🎯 Advanced Features
- **Chat Management** - Pin, mute, archive conversations
- **Mark as Unread** - Keep track of important messages
- **Conversation Summarization** - AI-powered chat summaries
- **Smart Reminders** - Get reminded about important messages
- **Feature Flags** - Toggle features on/off
- **Performance Dashboard** - Monitor app performance
- **Message Pagination** - Load messages efficiently
- **Profile Management** - Upload avatar, edit bio, update status

### 🎵 Sound & Feedback
- **Sound Effects** - Customizable notification sounds
- **Haptic Feedback** - Touch response on mobile
- **Visual Feedback** - Smooth animations and transitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd messenger
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
cd ..
```

4. **Set up environment variables**

Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pulsechat
JWT_SECRET=your-super-secret-jwt-key-change-this
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

5. **Start MongoDB** (if running locally)
```bash
mongod
```

6. **Start the backend server** (Terminal 1)
```bash
cd server
npm run dev
```

7. **Start the frontend** (Terminal 2)
```bash
npm run dev
```

8. **Open your browser**
```
http://localhost:3000
```

## 📱 Usage

### First Time Setup
1. Register a new account with username, email, and password
2. Complete your profile with avatar and bio
3. Start chatting by searching for users

### Sending Messages
- Type your message and press Enter or click Send
- Drag and drop files to share media
- Click the emoji button to add reactions
- Long press on mobile for message actions

### Managing Conversations
- Pin important conversations to the top
- Mute notifications for specific chats
- Archive old conversations
- Mark messages as unread

### Advanced Features
- Access Feature Flags panel (bottom-right button) to toggle features
- View Performance Dashboard to monitor app health
- Check Trust Scores in the Security tab
- Review Security Timeline for suspicious activities

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: Radix UI
- **Real-time**: Socket.io Client
- **Encryption**: TweetNaCl

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express 5
- **Real-time**: Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer + Cloudinary
- **Security**: Helmet, CORS, Rate Limiting
- **Caching**: Redis (optional)

## 📁 Project Structure

```
messenger/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home/Auth page
│   ├── chat/              # Chat pages
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── chat/             # Chat components
│   ├── features/         # Feature components
│   ├── notifications/    # Notification components
│   ├── profile/          # Profile components
│   ├── settings/         # Settings components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── store.ts          # Zustand store
│   ├── encryption.ts     # Encryption utilities
│   ├── sounds.ts         # Sound management
│   ├── performance.ts    # Performance monitoring
│   └── ...               # Other utilities
├── server/               # Backend server
│   ├── index.ts         # Server entry point
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── socket/          # Socket.io handlers
│   └── middleware/      # Express middleware
├── public/              # Static assets
│   └── sounds/         # Sound files
└── README.md           # This file
```

## 🔧 Configuration

### Feature Flags
Access the Feature Flags panel to enable/disable features:
- Optimistic UI
- Trust Scores
- Message Threads
- Smart Reminders
- Conversation Summarization
- Live Presence
- Gesture Actions
- Security Timeline
- Performance Dashboard

### Environment Variables

**Frontend (.env.local)**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SOCKET_URL` - Socket.io server URL

**Backend (server/.env)**
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Backend (Render)
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd server && npm install && npm run build`
4. Set start command: `cd server && npm start`
5. Add environment variables
6. Deploy

See `INTEGRATION_GUIDE.md` for detailed deployment instructions.

## 📚 Documentation

- **[Integration Guide](INTEGRATION_GUIDE.md)** - How to integrate new features
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

### Analyze Bundle Size
```bash
npm run analyze
```

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

### Quick Fixes

**Messages not sending?**
- Check if backend server is running
- Verify Socket.io connection in browser console
- Check MongoDB connection

**Images not uploading?**
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper CORS configuration

**Real-time features not working?**
- Check Socket.io connection
- Verify WebSocket support in browser
- Check firewall/proxy settings

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Socket.io for real-time capabilities
- MongoDB for the database
- All open-source contributors

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

**Built with ❤️ for secure, premium communication**

## 🎯 Roadmap

### Upcoming Features
- [ ] Video/Voice Calls (WebRTC)
- [ ] Group Chats
- [ ] Message Scheduling
- [ ] Custom Themes
- [ ] Desktop App (Electron)
- [ ] Mobile App (React Native)
- [ ] AI Chat Assistant
- [ ] Message Translation
- [ ] Stickers and GIFs
- [ ] Screen Sharing

### Performance Goals
- [ ] Achieve 90+ Lighthouse score
- [ ] Sub-second message delivery
- [ ] Support 10,000+ concurrent users
- [ ] 99.9% uptime

---

**Version 1.0.0** | Last Updated: January 2026

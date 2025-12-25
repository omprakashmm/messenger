# 🚀 PulseChat - Premium Real-Time Messenger

A modern, full-stack messenger application built with Next.js, Express, Socket.io, and MongoDB. Features real-time messaging, end-to-end encryption support, and a beautiful glassmorphism UI.

![PulseChat](https://img.shields.io/badge/Status-In%20Development-yellow)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-green)

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication
- Secure password hashing with bcrypt
- End-to-end encryption support (infrastructure ready)
- Rate limiting and security headers

### 💬 Real-Time Messaging
- Instant message delivery via Socket.io
- Typing indicators
- Read receipts
- Message reactions
- Reply to messages
- Message deletion

### 👥 Conversations
- Direct messaging (1-on-1)
- Group chats with admin roles
- User search and discovery
- Contact management
- Online/offline/away status

### 🎨 Premium UI/UX
- Glassmorphism design
- Dark mode optimized
- Smooth animations with Framer Motion
- Responsive layout
- Emoji picker
- Custom scrollbars
- Gradient accents

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Real-time**: Socket.io Client
- **Animations**: Framer Motion
- **UI Components**: Radix UI
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, Rate Limiting
- **File Uploads**: Multer (ready for Cloudinary)

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running locally (or MongoDB Atlas account)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd messenger
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 4. Environment Setup

#### Frontend (.env.local)
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Backend (server/.env)
Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pulsechat
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
```

### 5. Start MongoDB
Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in MONGODB_URI
```

### 6. Run the Application

#### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```
Server will start on http://localhost:5000

#### Terminal 2 - Frontend
```bash
npm run dev
```
Frontend will start on http://localhost:3000

## 📁 Project Structure

```
messenger/
├── app/                      # Next.js app directory
│   ├── chat/                # Chat page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home/Auth page
├── components/              # React components
│   ├── auth/               # Authentication components
│   │   └── AuthPage.tsx    # Login/Register page
│   └── chat/               # Chat components
│       ├── Sidebar.tsx     # Conversations sidebar
│       └── ChatWindow.tsx  # Main chat interface
├── lib/                     # Utilities and stores
│   ├── store.ts            # Zustand state management
│   └── utils.ts            # Helper functions
├── server/                  # Backend server
│   ├── models/             # MongoDB models
│   │   ├── User.ts         # User model
│   │   ├── Message.ts      # Message model
│   │   └── Conversation.ts # Conversation model
│   ├── routes/             # API routes
│   │   ├── auth.ts         # Authentication routes
│   │   ├── user.ts         # User routes
│   │   └── message.ts      # Message routes
│   ├── middleware/         # Express middleware
│   │   └── auth.ts         # JWT authentication
│   ├── socket/             # Socket.io handlers
│   │   └── handlers.ts     # Real-time event handlers
│   ├── index.ts            # Server entry point
│   └── package.json        # Server dependencies
└── package.json            # Frontend dependencies
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Search users
- `GET /api/users/:userId` - Get user by ID
- `PATCH /api/users/profile` - Update profile
- `POST /api/users/contacts/:userId` - Add contact
- `DELETE /api/users/contacts/:userId` - Remove contact

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `POST /api/messages/conversations/direct` - Create/get direct conversation
- `POST /api/messages/conversations/group` - Create group conversation
- `GET /api/messages/conversations/:conversationId` - Get messages
- `POST /api/messages/send` - Send message (HTTP fallback)
- `DELETE /api/messages/:messageId` - Delete message

## 🔄 Socket.io Events

### Client → Server
- `join:conversation` - Join a conversation room
- `leave:conversation` - Leave a conversation room
- `message:send` - Send a message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `message:react` - React to a message
- `message:read` - Mark message as read
- `message:delete` - Delete a message
- `status:update` - Update user status

### Server → Client
- `message:new` - New message received
- `message:sent` - Message sent confirmation
- `message:error` - Message error
- `typing:user` - User typing status
- `message:reaction` - Message reaction update
- `message:read` - Message read receipt
- `message:deleted` - Message deleted
- `user:status` - User status update

## 🎯 Roadmap

### Phase 1 - Core Features ✅
- [x] User authentication
- [x] Real-time messaging
- [x] Direct conversations
- [x] Group chats
- [x] Typing indicators
- [x] Message reactions
- [x] Read receipts

### Phase 2 - Enhanced Features 🚧
- [ ] File uploads (images, videos, documents)
- [ ] Voice messages
- [ ] Video/audio calls
- [ ] Message search
- [ ] User profiles
- [ ] Settings page
- [ ] Notifications

### Phase 3 - Advanced Features 📋
- [ ] End-to-end encryption implementation
- [ ] Message forwarding
- [ ] Pinned messages
- [ ] Archived conversations
- [ ] Themes customization
- [ ] Multi-device sync
- [ ] Desktop app (Electron)

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Railway/Render/Heroku)
```bash
cd server
npm run build
# Deploy to your preferred platform
```

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in server/.env

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ by [Your Name]

---

**Note**: This is a portfolio/learning project. For production use, ensure proper security measures, environment variable management, and scalability considerations.

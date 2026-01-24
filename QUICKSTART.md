# 🚀 Quick Start Scripts

## Development

### Start Everything (Recommended)
Open two terminals:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Then open http://localhost:3000

### Start Backend Only
```bash
cd server
npm run dev
```

### Start Frontend Only
```bash
npm run dev
```

## Production

### Build Frontend
```bash
npm run build
```

### Build Backend
```bash
cd server
npm run build
```

### Start Production
```bash
# Backend
cd server
npm start

# Frontend (in another terminal)
npm start
```

## Testing

### Run Linter
```bash
npm run lint
```

### Analyze Bundle Size
```bash
npm run analyze
```

## Database

### Start MongoDB (Local)
```bash
mongod
```

### MongoDB Atlas (Cloud)
No need to start - just configure MONGODB_URI in .env

## Common Issues

### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
npx kill-port 3000

# Kill process on port 5000 (backend)
npx kill-port 5000
```

### Clear Cache
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install
```

### Reset Database
```bash
# Connect to MongoDB
mongosh

# Drop database
use pulsechat
db.dropDatabase()
```

## Environment Setup

### First Time Setup
1. Copy environment files:
```bash
# Frontend
cp env.local.example .env.local

# Backend
cp server/env.example.txt server/.env
```

2. Edit the files with your values

3. Install dependencies:
```bash
npm install
cd server && npm install
```

4. Start development servers (see above)

## Deployment

### Deploy to Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Render (Backend)
1. Push to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Configure build/start commands
5. Add environment variables
6. Deploy

See README.md for detailed deployment instructions.

# 🚀 Deployment Checklist

## Pre-Deployment

### ✅ Code Quality
- [x] All TypeScript errors resolved
- [x] Build completes successfully (`npm run build`)
- [x] No console errors in development
- [ ] Run linter (`npm run lint`)
- [ ] Code reviewed
- [ ] All features tested

### ✅ Environment Variables

#### Frontend (.env.local)
- [ ] `NEXT_PUBLIC_API_URL` - Production backend URL
- [ ] `NEXT_PUBLIC_SOCKET_URL` - Production Socket.io URL

#### Backend (server/.env)
- [ ] `PORT` - Server port (default: 5000)
- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Strong random secret (min 32 chars)
- [ ] `CLOUDINARY_CLOUD_NAME` - Cloudinary account
- [ ] `CLOUDINARY_API_KEY` - Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Cloudinary API secret
- [ ] `NODE_ENV=production`

### ✅ Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with proper permissions
- [ ] IP whitelist configured (0.0.0.0/0 for production)
- [ ] Connection string tested
- [ ] Indexes created for performance

### ✅ Third-Party Services
- [ ] Cloudinary account created
- [ ] Cloudinary credentials configured
- [ ] Upload presets configured

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository
```bash
# Commit all changes
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: **.**
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Add Environment Variables
Add these in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com`
- `NEXT_PUBLIC_SOCKET_URL` = `https://your-backend.onrender.com`

### Step 4: Deploy
- Click "Deploy"
- Wait for build to complete
- Test the deployment

### Step 5: Configure Domain (Optional)
- Add custom domain in Vercel settings
- Update DNS records
- Enable HTTPS

## Backend Deployment (Render)

### Step 1: Create Web Service
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure service:
   - Name: `pulsechat-backend`
   - Environment: **Node**
   - Region: Choose closest to users
   - Branch: **main**
   - Root Directory: **server**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### Step 2: Add Environment Variables
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pulsechat
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

### Step 3: Deploy
- Click "Create Web Service"
- Wait for deployment
- Note the service URL

### Step 4: Update Frontend
- Update Vercel environment variables with backend URL
- Redeploy frontend

## Post-Deployment

### ✅ Testing
- [ ] Frontend loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Real-time messaging works
- [ ] File upload works
- [ ] Notifications work
- [ ] All features functional
- [ ] Mobile responsive
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### ✅ Performance
- [ ] Run Lighthouse audit (target: 90+)
- [ ] Check page load time (target: <3s)
- [ ] Test with slow 3G network
- [ ] Monitor memory usage
- [ ] Check bundle size

### ✅ Security
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] JWT secrets are strong
- [ ] No sensitive data in client
- [ ] Environment variables secured

### ✅ Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Set up analytics (Google Analytics)
- [ ] Configure logging
- [ ] Set up alerts

## Troubleshooting

### Frontend Issues

**Build fails on Vercel**
- Check build logs
- Verify all dependencies in package.json
- Test build locally: `npm run build`
- Check TypeScript errors

**Environment variables not working**
- Ensure variables start with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Check variable names (case-sensitive)

**API calls failing**
- Verify API URL is correct
- Check CORS configuration
- Verify backend is running
- Check network tab in browser

### Backend Issues

**Deployment fails on Render**
- Check build logs
- Verify build command
- Check start command
- Verify all dependencies installed

**Database connection fails**
- Check MongoDB URI format
- Verify IP whitelist (0.0.0.0/0)
- Check database user permissions
- Test connection locally

**Socket.io not connecting**
- Check CORS configuration
- Verify Socket.io URL
- Check WebSocket support
- Review server logs

## Maintenance

### Regular Tasks
- [ ] Monitor error logs daily
- [ ] Check performance metrics weekly
- [ ] Update dependencies monthly
- [ ] Backup database weekly
- [ ] Review security alerts
- [ ] Monitor disk space
- [ ] Check uptime statistics

### Updates
```bash
# Update dependencies
npm update
cd server && npm update

# Check for security vulnerabilities
npm audit
npm audit fix

# Test after updates
npm run build
npm test
```

## Rollback Plan

### If deployment fails:
1. Revert to previous commit
2. Redeploy from Vercel/Render dashboard
3. Check logs for errors
4. Fix issues
5. Test locally
6. Redeploy

### Emergency contacts:
- Vercel Support: support@vercel.com
- Render Support: support@render.com
- MongoDB Support: Via Atlas dashboard

## Success Criteria

### Deployment is successful when:
- ✅ Frontend loads without errors
- ✅ Users can register and login
- ✅ Real-time messaging works
- ✅ File uploads work
- ✅ All features functional
- ✅ Performance score >90
- ✅ No critical errors in logs
- ✅ Mobile responsive
- ✅ HTTPS enabled
- ✅ Monitoring active

## Next Steps After Deployment

1. **Announce Launch** 🎉
   - Share with users
   - Post on social media
   - Update portfolio

2. **Monitor Closely**
   - Watch error logs
   - Monitor user feedback
   - Track performance

3. **Iterate**
   - Fix bugs quickly
   - Add requested features
   - Improve performance

4. **Scale**
   - Monitor usage
   - Upgrade plans as needed
   - Optimize database

---

**Good luck with your deployment!** 🚀

**Need help?** Check TROUBLESHOOTING.md or open an issue on GitHub.

**Last Updated**: January 24, 2026

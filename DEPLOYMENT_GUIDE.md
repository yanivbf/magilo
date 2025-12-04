# 🚀 DEPLOYMENT GUIDE

Complete guide for deploying the SvelteKit + Strapi application to production.

---

## Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Security configurations reviewed
- [ ] Database migrations prepared
- [ ] Build process verified
- [ ] Error handling tested

### ✅ Infrastructure Requirements
- [ ] Node.js 18+ hosting
- [ ] PostgreSQL database
- [ ] File storage (S3/CDN)
- [ ] Domain name configured
- [ ] SSL certificate ready
- [ ] Email service (optional)

---

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

**Best for:** Quick deployment with minimal configuration

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from new-app directory
cd new-app
vercel --prod
```

**Environment Variables (Vercel):**
```
PUBLIC_STRAPI_URL=https://your-strapi.railway.app
PUBLIC_API_URL=https://your-strapi.railway.app/api
STRAPI_API_TOKEN=your_production_token
```

#### Backend (Railway)
1. Connect GitHub repository
2. Select `strapi-backend` directory
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

**Environment Variables (Railway):**
```
DATABASE_CLIENT=postgres
DATABASE_HOST=your_postgres_host
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_SSL=true
JWT_SECRET=generate_random_string
API_TOKEN_SALT=generate_random_string
ADMIN_JWT_SECRET=generate_random_string
APP_KEYS=key1,key2,key3,key4
NODE_ENV=production
```

---

### Option 2: DigitalOcean App Platform

**Best for:** Full control with managed infrastructure

#### Setup Steps
1. Create new App
2. Connect GitHub repository
3. Configure two components:
   - Web Service (SvelteKit)
   - Web Service (Strapi)
4. Add PostgreSQL database
5. Configure environment variables
6. Deploy

**Cost Estimate:** $12-25/month

---

### Option 3: AWS (EC2 + RDS + S3)

**Best for:** Enterprise deployment with full control

#### Infrastructure Setup
```bash
# EC2 Instance (t3.small or larger)
# RDS PostgreSQL (db.t3.micro or larger)
# S3 Bucket for file storage
# CloudFront for CDN
# Route 53 for DNS
```

#### Server Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd your-repo

# Setup Strapi
cd strapi-backend
npm install
npm run build
pm2 start npm --name "strapi" -- start

# Setup SvelteKit
cd ../new-app
npm install
npm run build
pm2 start build/index.js --name "sveltekit"

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## Database Migration

### From SQLite to PostgreSQL

#### 1. Export Data from SQLite
```bash
cd strapi-backend
npm run strapi export -- --file backup.tar.gz
```

#### 2. Configure PostgreSQL
```env
DATABASE_CLIENT=postgres
DATABASE_HOST=your_host
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=your_user
DATABASE_PASSWORD=your_password
DATABASE_SSL=true
```

#### 3. Import Data
```bash
npm run strapi import -- --file backup.tar.gz
```

---

## File Storage Configuration

### Option A: AWS S3

#### Install Provider
```bash
cd strapi-backend
npm install @strapi/provider-upload-aws-s3
```

#### Configure (config/plugins.js)
```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: env('AWS_REGION'),
        params: {
          Bucket: env('AWS_BUCKET'),
        },
      },
    },
  },
});
```

### Option B: Cloudinary

#### Install Provider
```bash
npm install @strapi/provider-upload-cloudinary
```

#### Configure
```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
    },
  },
});
```

---

## Security Configuration

### 1. Update CORS Settings

**strapi-backend/config/middlewares.ts:**
```typescript
export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://your-cdn.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://your-cdn.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['https://your-domain.com'],
      credentials: true,
    },
  },
  // ... other middlewares
];
```

### 2. Enable Rate Limiting

```bash
npm install koa-ratelimit
```

### 3. Configure SSL/HTTPS

Ensure all traffic uses HTTPS in production.

---

## Environment Variables

### Frontend (.env)
```env
PUBLIC_STRAPI_URL=https://api.yourdomain.com
PUBLIC_API_URL=https://api.yourdomain.com/api
STRAPI_API_TOKEN=your_production_token
NODE_ENV=production
```

### Backend (.env)
```env
# Server
HOST=0.0.0.0
PORT=1337
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=random_string
ADMIN_JWT_SECRET=random_string
JWT_SECRET=random_string

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=your_host
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=your_user
DATABASE_PASSWORD=your_password
DATABASE_SSL=true

# File Upload (if using S3)
AWS_ACCESS_KEY_ID=your_key
AWS_ACCESS_SECRET=your_secret
AWS_REGION=us-east-1
AWS_BUCKET=your-bucket

NODE_ENV=production
```

---

## Build Commands

### Frontend Build
```bash
cd new-app
npm install
npm run build
```

### Backend Build
```bash
cd strapi-backend
npm install
NODE_ENV=production npm run build
```

---

## Monitoring & Logging

### Recommended Tools
- **Error Tracking:** Sentry
- **Uptime Monitoring:** UptimeRobot
- **Performance:** New Relic or DataDog
- **Logs:** Papertrail or Loggly

### Setup Sentry (Optional)
```bash
npm install @sentry/sveltekit
```

---

## Backup Strategy

### Database Backups
```bash
# Automated daily backups
pg_dump -h your_host -U your_user -d strapi > backup_$(date +%Y%m%d).sql
```

### File Backups
If using S3, enable versioning and lifecycle policies.

---

## Performance Optimization

### 1. Enable Caching
- Use Redis for session storage
- Implement CDN for static assets
- Enable browser caching headers

### 2. Database Optimization
- Add indexes to frequently queried fields
- Enable connection pooling
- Regular VACUUM operations

### 3. Frontend Optimization
- Enable SvelteKit prerendering where possible
- Optimize images (WebP format)
- Implement lazy loading

---

## Post-Deployment Verification

### ✅ Checklist
- [ ] Frontend loads correctly
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] File uploads functioning
- [ ] Database connections stable
- [ ] SSL certificate valid
- [ ] CORS configured correctly
- [ ] Error tracking active
- [ ] Backups scheduled
- [ ] Monitoring alerts set

### Test Critical Paths
1. User registration/login
2. Page creation
3. Image upload
4. Form submissions
5. Management interfaces
6. Public page viewing

---

## Rollback Plan

### If Issues Occur
1. Keep previous deployment active
2. Use blue-green deployment strategy
3. Database backup before migration
4. Quick rollback commands ready

```bash
# Rollback with PM2
pm2 restart strapi --update-env
pm2 restart sveltekit --update-env
```

---

## Support & Maintenance

### Regular Tasks
- **Daily:** Monitor error logs
- **Weekly:** Review performance metrics
- **Monthly:** Update dependencies
- **Quarterly:** Security audit

### Update Process
```bash
# Update dependencies
npm update

# Test locally
npm run build
npm run preview

# Deploy to staging first
# Then deploy to production
```

---

## Cost Estimates

### Small Scale (< 1000 users)
- **Vercel + Railway:** $20-40/month
- **DigitalOcean:** $25-50/month

### Medium Scale (1000-10000 users)
- **AWS:** $100-300/month
- **DigitalOcean:** $75-150/month

### Large Scale (10000+ users)
- **AWS:** $300-1000+/month
- Custom infrastructure required

---

## Troubleshooting

### Common Issues

**Issue:** Build fails on deployment
**Solution:** Check Node.js version matches local (18+)

**Issue:** Database connection fails
**Solution:** Verify SSL settings and firewall rules

**Issue:** File uploads not working
**Solution:** Check storage provider credentials and CORS

**Issue:** 502 Bad Gateway
**Solution:** Ensure backend is running and port is correct

---

## Next Steps

1. Choose deployment platform
2. Set up production database
3. Configure environment variables
4. Run test deployment to staging
5. Verify all functionality
6. Deploy to production
7. Monitor for 24-48 hours
8. Celebrate! 🎉

---

**Need Help?** Refer to:
- PROJECT_FINAL_SUMMARY.md
- API_DOCUMENTATION.md
- SECURITY_ENHANCEMENTS_COMPLETE.md

*Last Updated: December 1, 2025*

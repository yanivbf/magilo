# Deployment Verification Checklist

## Pre-Deployment Verification

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] PostgreSQL/SQLite configured
- [ ] Environment variables set
- [ ] Strapi API token generated
- [ ] SSL certificates ready (production)
- [ ] Domain DNS configured

### Code Verification
- [ ] All code committed to repository
- [ ] No console.log statements in production code
- [ ] Environment variables not hardcoded
- [ ] .env files not committed
- [ ] Dependencies up to date
- [ ] No security vulnerabilities (`npm audit`)

### Database Verification
- [ ] Database backup created
- [ ] Strapi migrations run
- [ ] Test data removed
- [ ] Production data migrated
- [ ] Database indexes optimized
- [ ] Connection pooling configured

---

## Security Verification

### Headers Check
```bash
# Test security headers
curl -I https://yourdomain.com

# Should see:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# Content-Security-Policy: ...
# Referrer-Policy: strict-origin-when-cross-origin
```

- [ ] X-Frame-Options header present
- [ ] X-Content-Type-Options header present
- [ ] Content-Security-Policy header present
- [ ] Referrer-Policy header present
- [ ] Permissions-Policy header present

### CSP Verification
- [ ] Open browser console
- [ ] Navigate to site
- [ ] Check for CSP violations
- [ ] Test all page types
- [ ] Verify YouTube embeds work
- [ ] Verify external images load

### XSS Protection Test
```javascript
// Test these payloads - all should be blocked:
<script>alert('XSS')</script>
javascript:alert('XSS')
<img src=x onerror=alert('XSS')>
<iframe src="javascript:alert('XSS')"></iframe>
```

- [ ] Script tags blocked
- [ ] JavaScript URLs blocked
- [ ] Event handlers stripped
- [ ] Dangerous iframes blocked
- [ ] HTML properly escaped

### Rate Limiting Test
```bash
# Make 21 requests in 1 minute
for i in {1..21}; do
  curl -X POST https://yourdomain.com/api/create-page-with-template \
    -H "Content-Type: application/json" \
    -d '{"mainName":"Test"}'
  sleep 2
done

# 21st request should return 429 Too Many Requests
```

- [ ] Rate limiting active
- [ ] 429 status returned after limit
- [ ] Error message clear
- [ ] Legitimate users not affected

---

## Functionality Verification

### Page Creation
- [ ] Store template creates pages
- [ ] Event template creates pages
- [ ] Service template creates pages
- [ ] Course template creates pages
- [ ] Workshop template creates pages
- [ ] Restaurant template creates pages
- [ ] Artist template creates pages
- [ ] Message template creates pages
- [ ] Quick template creates pages

### Page Features
- [ ] Products display correctly
- [ ] Images upload successfully
- [ ] Galleries render properly
- [ ] Videos embed correctly (YouTube)
- [ ] FAQs display properly
- [ ] Social links work
- [ ] Contact forms submit
- [ ] WhatsApp links work

### Management Features
- [ ] Product manager works
- [ ] Service editor works
- [ ] Section manager works
- [ ] Day settings save
- [ ] Appointment queue works
- [ ] Courier manager works
- [ ] Guest list manager works
- [ ] Tabbed interface switches

### API Endpoints
```bash
# Test critical endpoints
curl https://yourdomain.com/api/pages/all/marketplace
curl https://yourdomain.com/api/services/[pageId]
curl https://yourdomain.com/api/appointments/[pageId]
```

- [ ] GET /api/pages/all/marketplace
- [ ] POST /api/create-page-with-template
- [ ] POST /api/services/[pageId]
- [ ] GET /api/services/[pageId]
- [ ] POST /api/appointments
- [ ] GET /api/appointments/[pageId]
- [ ] POST /api/products
- [ ] PUT /api/products/[productId]

---

## Performance Verification

### Load Time
- [ ] Homepage loads < 2s
- [ ] Page creation < 3s
- [ ] API responses < 500ms
- [ ] Image loading optimized
- [ ] No memory leaks

### Lighthouse Audit
```bash
# Run Lighthouse
npx lighthouse https://yourdomain.com --view
```

- [ ] Performance score > 80
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 80

### Stress Test
```bash
# Use Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/
```

- [ ] Handles 100 concurrent users
- [ ] No 500 errors under load
- [ ] Response time stable
- [ ] Memory usage stable

---

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Samsung Internet
- [ ] Firefox Mobile

### RTL Support
- [ ] Hebrew text displays correctly
- [ ] Layout is RTL
- [ ] Forms work in RTL
- [ ] Navigation works in RTL

---

## Data Integrity

### Database Checks
```sql
-- Verify data integrity
SELECT COUNT(*) FROM pages;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM appointments;
SELECT COUNT(*) FROM purchases;
```

- [ ] All pages migrated
- [ ] Products linked correctly
- [ ] Appointments preserved
- [ ] Purchases intact
- [ ] Analytics data present
- [ ] User data correct

### Backup Verification
- [ ] Database backup exists
- [ ] Backup is restorable
- [ ] File uploads backed up
- [ ] Environment variables documented
- [ ] Rollback plan ready

---

## Monitoring Setup

### Error Tracking
- [ ] Error logging configured
- [ ] Log rotation set up
- [ ] Alert thresholds defined
- [ ] Notification channels configured

### Metrics Collection
- [ ] API response times tracked
- [ ] Error rates monitored
- [ ] User activity logged
- [ ] Security events logged

### Health Checks
```bash
# Set up health check endpoint
curl https://yourdomain.com/health

# Should return 200 OK
```

- [ ] Health check endpoint works
- [ ] Database connectivity checked
- [ ] Strapi connectivity checked
- [ ] Disk space monitored

---

## User Acceptance Testing

### Create Test Pages
- [ ] Create store page with products
- [ ] Create event page with date/time
- [ ] Create service page with services
- [ ] Create restaurant page with menu
- [ ] Create workshop page with schedule

### Test User Flows
- [ ] User can create account
- [ ] User can create page
- [ ] User can edit page
- [ ] User can delete page
- [ ] User can manage products
- [ ] User can view analytics
- [ ] User can manage appointments

### Test Edge Cases
- [ ] Empty form submission
- [ ] Special characters in input
- [ ] Very long text input
- [ ] Multiple image uploads
- [ ] Concurrent edits
- [ ] Network interruption

---

## Documentation Verification

### User Documentation
- [ ] Quick start guide available
- [ ] API documentation complete
- [ ] Template guide available
- [ ] Management guide available
- [ ] Troubleshooting guide available

### Technical Documentation
- [ ] Architecture documented
- [ ] Security measures documented
- [ ] Deployment process documented
- [ ] Monitoring setup documented
- [ ] Maintenance procedures documented

---

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor error logs every 2 hours
- [ ] Check security alerts
- [ ] Review performance metrics
- [ ] Collect user feedback
- [ ] Be ready for rollback

### First Week
- [ ] Daily error log review
- [ ] Security audit
- [ ] Performance analysis
- [ ] User feedback collection
- [ ] Bug fix deployment

### First Month
- [ ] Weekly performance review
- [ ] Security updates applied
- [ ] User feedback addressed
- [ ] Optimization implemented
- [ ] Documentation updated

---

## Rollback Plan

### Rollback Triggers
- [ ] Critical security vulnerability
- [ ] Data loss or corruption
- [ ] System unavailability > 1 hour
- [ ] Major functionality broken
- [ ] Performance degradation > 50%

### Rollback Steps
1. [ ] Stop new deployments
2. [ ] Notify stakeholders
3. [ ] Restore database backup
4. [ ] Deploy previous version
5. [ ] Verify functionality
6. [ ] Monitor for stability
7. [ ] Investigate root cause

### Rollback Verification
- [ ] Previous version deployed
- [ ] Database restored
- [ ] All features working
- [ ] No data loss
- [ ] Users notified

---

## Sign-Off

### Technical Sign-Off
- [ ] Development team approved
- [ ] Security team approved
- [ ] QA team approved
- [ ] DevOps team approved

### Business Sign-Off
- [ ] Product owner approved
- [ ] Stakeholders notified
- [ ] Users communicated
- [ ] Support team briefed

### Final Checks
- [ ] All checklist items complete
- [ ] No critical issues outstanding
- [ ] Monitoring active
- [ ] Support team ready
- [ ] Rollback plan ready

---

## Deployment Approval

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Approved By:** _______________  

**Status:** 
- [ ] ✅ APPROVED FOR PRODUCTION
- [ ] ⚠️ APPROVED WITH CONDITIONS
- [ ] ❌ NOT APPROVED

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Checklist Version:** 1.0  
**Last Updated:** December 1, 2025  
**Next Review:** Post-deployment

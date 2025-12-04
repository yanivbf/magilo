# 🔧 MAINTENANCE GUIDE

Ongoing maintenance procedures for the SvelteKit + Strapi application.

---

## Daily Maintenance

### Monitor Application Health

```bash
# Check if services are running
pm2 status

# View recent logs
pm2 logs --lines 50

# Check disk space
df -h

# Check memory usage
free -m
```

### Review Error Logs
- Check Strapi admin panel for errors
- Review application logs for exceptions
- Monitor API response times

---

## Weekly Maintenance

### 1. Database Health Check

```bash
# PostgreSQL vacuum (if not automated)
psql -h your_host -U your_user -d strapi -c "VACUUM ANALYZE;"

# Check database size
psql -h your_host -U your_user -d strapi -c "SELECT pg_size_pretty(pg_database_size('strapi'));"

# Check for slow queries
# Review pg_stat_statements if enabled
```

### 2. Backup Verification

```bash
# Test latest backup restore
pg_restore --list backup_latest.sql

# Verify file storage backups
aws s3 ls s3://your-bucket/backups/
```

### 3. Security Updates

```bash
# Check for security vulnerabilities
cd new-app
npm audit

cd ../strapi-backend
npm audit

# Fix critical issues
npm audit fix
```

---

## Monthly Maintenance

### 1. Dependency Updates

```bash
# Check outdated packages
npm outdated

# Update non-breaking changes
npm update

# Test thoroughly after updates
npm run build
npm run preview
```

### 2. Performance Review

- Analyze page load times
- Review API response times
- Check database query performance
- Monitor CDN cache hit rates

### 3. Content Cleanup

```bash
# Remove unused media files
# Check Strapi media library
# Delete orphaned uploads
```

### 4. User Management

- Review inactive accounts
- Check for suspicious activity
- Update user permissions if needed

---

## Quarterly Maintenance

### 1. Major Updates

```bash
# Update to latest stable versions
npm install sveltekit@latest
npm install @strapi/strapi@latest

# Run migration scripts if needed
npm run strapi migrate
```

### 2. Security Audit

- Review authentication flows
- Check API endpoint security
- Verify CORS configuration
- Test rate limiting
- Review CSP headers

### 3. Performance Optimization

- Analyze bundle sizes
- Optimize images
- Review database indexes
- Check for N+1 queries
- Optimize API calls

### 4. Backup Strategy Review

- Test full system restore
- Verify backup retention policy
- Check backup storage costs
- Update disaster recovery plan

---

## Common Maintenance Tasks

### Restart Services

```bash
# Restart Strapi
pm2 restart strapi

# Restart SvelteKit
pm2 restart sveltekit

# Restart all services
pm2 restart all

# Reload with zero downtime
pm2 reload all
```

### Clear Caches

```bash
# Clear Strapi cache
cd strapi-backend
npm run strapi cache:clear

# Clear build cache
rm -rf .svelte-kit
rm -rf node_modules/.cache
```

### Database Maintenance

```bash
# Create backup
pg_dump -h your_host -U your_user -d strapi > backup_$(date +%Y%m%d).sql

# Restore from backup
pg_restore -h your_host -U your_user -d strapi backup_20251201.sql

# Optimize tables
psql -h your_host -U your_user -d strapi -c "VACUUM FULL;"
```

### Log Management

```bash
# Rotate logs
pm2 flush

# Archive old logs
tar -czf logs_$(date +%Y%m%d).tar.gz ~/.pm2/logs/
mv logs_*.tar.gz /backup/logs/

# Clean old archives (keep 90 days)
find /backup/logs/ -name "logs_*.tar.gz" -mtime +90 -delete
```

---

## Monitoring Checklist

### Application Metrics
- [ ] Response time < 200ms (API)
- [ ] Page load time < 2s
- [ ] Error rate < 0.1%
- [ ] Uptime > 99.9%

### Server Metrics
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%
- [ ] Disk usage < 80%
- [ ] Network latency < 50ms

### Database Metrics
- [ ] Connection pool not exhausted
- [ ] Query time < 100ms average
- [ ] No long-running queries
- [ ] Backup completed successfully

---

## Troubleshooting Common Issues

### Issue: High Memory Usage

```bash
# Check process memory
pm2 monit

# Restart service
pm2 restart strapi --update-env

# If persistent, increase server resources
```

### Issue: Slow Database Queries

```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add missing indexes
CREATE INDEX idx_pages_user ON pages(user_id);
```

### Issue: File Upload Failures

```bash
# Check disk space
df -h

# Check upload directory permissions
ls -la strapi-backend/public/uploads

# Verify S3 credentials (if using S3)
aws s3 ls s3://your-bucket
```

### Issue: Authentication Problems

```bash
# Check JWT secret is set
echo $JWT_SECRET

# Verify session store
# Check Redis connection if using Redis

# Clear sessions
# Restart authentication service
```

---

## Update Procedures

### Minor Updates (Patch Versions)

```bash
# 1. Backup database
pg_dump -h your_host -U your_user -d strapi > backup_pre_update.sql

# 2. Update packages
npm update

# 3. Test locally
npm run build
npm run preview

# 4. Deploy to staging
# Test all critical paths

# 5. Deploy to production
pm2 restart all
```

### Major Updates (Breaking Changes)

```bash
# 1. Full system backup
# Database + Files + Configuration

# 2. Review changelog
# Check for breaking changes

# 3. Update in development environment
npm install package@latest

# 4. Run migration scripts
npm run migrate

# 5. Extensive testing
# Test all features

# 6. Deploy to staging
# User acceptance testing

# 7. Schedule maintenance window
# Deploy to production

# 8. Monitor closely for 24 hours
```

---

## Backup Procedures

### Automated Daily Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
pg_dump -h $DB_HOST -U $DB_USER -d strapi > $BACKUP_DIR/db_$DATE.sql

# Compress
gzip $BACKUP_DIR/db_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-backup-bucket/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

# Verify backup
if [ $? -eq 0 ]; then
    echo "Backup successful: $DATE"
else
    echo "Backup failed: $DATE" | mail -s "Backup Alert" admin@yourdomain.com
fi
```

### Setup Cron Job

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## Security Maintenance

### Regular Security Tasks

```bash
# 1. Update SSL certificates (if manual)
certbot renew

# 2. Review access logs
tail -f /var/log/nginx/access.log | grep -i "POST\|DELETE"

# 3. Check for failed login attempts
# Review Strapi admin logs

# 4. Update firewall rules
ufw status

# 5. Scan for vulnerabilities
npm audit
```

### Security Checklist
- [ ] SSL certificate valid and auto-renewing
- [ ] Firewall rules up to date
- [ ] No exposed sensitive data in logs
- [ ] API rate limiting active
- [ ] Admin panel access restricted
- [ ] Database credentials rotated quarterly
- [ ] Backup encryption enabled

---

## Performance Monitoring

### Key Metrics to Track

```javascript
// Add to monitoring dashboard
{
  "api_response_time": "< 200ms",
  "page_load_time": "< 2s",
  "database_query_time": "< 100ms",
  "error_rate": "< 0.1%",
  "uptime": "> 99.9%",
  "concurrent_users": "monitor",
  "memory_usage": "< 80%",
  "cpu_usage": "< 70%"
}
```

### Setup Monitoring Alerts

```bash
# Example: Alert if CPU > 80% for 5 minutes
# Example: Alert if error rate > 1%
# Example: Alert if response time > 500ms
# Example: Alert if disk space < 20%
```

---

## Disaster Recovery

### Recovery Time Objective (RTO): 4 hours
### Recovery Point Objective (RPO): 24 hours

### Recovery Steps

1. **Assess the situation**
   - Identify the issue
   - Determine scope of impact

2. **Restore from backup**
   ```bash
   # Restore database
   pg_restore -h your_host -U your_user -d strapi backup_latest.sql
   
   # Restore files
   aws s3 sync s3://backup-bucket/uploads/ ./public/uploads/
   ```

3. **Verify data integrity**
   - Check critical data
   - Test key functionality

4. **Bring services online**
   ```bash
   pm2 restart all
   ```

5. **Monitor closely**
   - Watch error logs
   - Check user reports

---

## Contact & Escalation

### Issue Severity Levels

**P0 - Critical:** Site down, data loss
- Response: Immediate
- Escalate: Immediately

**P1 - High:** Major feature broken
- Response: Within 1 hour
- Escalate: After 2 hours

**P2 - Medium:** Minor feature issue
- Response: Within 4 hours
- Escalate: After 8 hours

**P3 - Low:** Cosmetic issue
- Response: Within 24 hours
- Escalate: After 48 hours

---

## Maintenance Windows

### Recommended Schedule
- **Minor updates:** Tuesday/Wednesday 2-4 AM
- **Major updates:** Sunday 2-6 AM
- **Emergency fixes:** As needed with notification

### Notification Template
```
Subject: Scheduled Maintenance - [Date]

We will be performing system maintenance on [Date] from [Start] to [End].

During this time:
- The application may be unavailable
- Some features may be temporarily disabled

We apologize for any inconvenience.
```

---

## Documentation Updates

### Keep Updated
- API_DOCUMENTATION.md - When endpoints change
- PROJECT_STRUCTURE.md - When architecture changes
- This guide - When procedures change

---

## Useful Commands Reference

```bash
# Service Management
pm2 list                    # List all processes
pm2 restart [name]          # Restart specific service
pm2 logs [name]             # View logs
pm2 monit                   # Monitor resources

# Database
psql -h host -U user -d db  # Connect to database
\dt                         # List tables
\d+ table_name              # Describe table

# System
htop                        # Monitor system resources
df -h                       # Check disk space
free -m                     # Check memory
netstat -tulpn              # Check ports

# Logs
tail -f /var/log/app.log    # Follow log file
grep "ERROR" app.log        # Search logs
journalctl -u service       # System logs
```

---

**Remember:** Always test changes in staging before production!

*Last Updated: December 1, 2025*

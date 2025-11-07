# Quick Reference Card - parneet.me Deployment

## 🌐 URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | https://parneet.me | 443 |
| Backend API | https://api.parneet.me | 443 → 3001 |
| Database | localhost | 3306 |

---

## 📁 File Locations

```
/var/www/blood-donation-system/
├── backend/
│   ├── .env                    # Backend environment config
│   └── index.js                # Backend entry point
└── frontend/
    ├── .env                    # Frontend environment config
    └── build/                  # Production build
```

---

## 🔧 Common Commands

### Backend Management
```bash
# View status
pm2 status

# View logs
pm2 logs blood-donation-api

# Restart
pm2 restart blood-donation-api

# Stop
pm2 stop blood-donation-api

# Start
pm2 start blood-donation-api
```

### Frontend Updates
```bash
cd /var/www/blood-donation-system/frontend
npm run build
sudo systemctl reload nginx
```

### Nginx
```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Database
```bash
# Connect
mysql -u bloodapp -p blood_donation_db

# Backup
mysqldump -u bloodapp -p blood_donation_db > backup_$(date +%Y%m%d).sql

# Restore
mysql -u bloodapp -p blood_donation_db < backup_YYYYMMDD.sql
```

### SSL Certificates
```bash
# Check status
sudo certbot certificates

# Renew
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=bloodapp
DB_PASSWORD=***
DB_NAME=blood_donation_db
PORT=3001
JWT_SECRET=***
EMAIL_USER=***
EMAIL_PASS=***
FRONTEND_URL=https://parneet.me
BACKEND_URL=https://api.parneet.me
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://api.parneet.me
```

---

## 🚀 Deployment Steps (Quick)

### Full Deployment
```bash
cd /var/www/blood-donation-system
git pull
./deploy.sh all
```

### Backend Only
```bash
cd /var/www/blood-donation-system/backend
npm install
pm2 restart blood-donation-api
```

### Frontend Only
```bash
cd /var/www/blood-donation-system/frontend
npm install
npm run build
sudo systemctl reload nginx
```

---

## 🐛 Troubleshooting

### Backend Not Responding
```bash
pm2 logs blood-donation-api
pm2 restart blood-donation-api
```

### Frontend Shows Blank Page
```bash
# Check build
cd /var/www/blood-donation-system/frontend
npm run build

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

### Database Connection Error
```bash
# Check MySQL
sudo systemctl status mysql

# Test connection
mysql -u bloodapp -p blood_donation_db
```

### SSL Certificate Issues
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

### CORS Errors
- Check FRONTEND_URL in backend/.env
- Verify it matches your domain
- Restart backend: `pm2 restart blood-donation-api`

---

## 📊 Monitoring

### System Resources
```bash
# CPU and Memory
htop

# Disk space
df -h

# Disk usage by directory
du -sh /var/www/blood-donation-system/*
```

### Application Health
```bash
# Backend status
pm2 status
pm2 monit

# Nginx status
sudo systemctl status nginx

# MySQL status
sudo systemctl status mysql
```

### Logs
```bash
# Backend logs
pm2 logs blood-donation-api --lines 100

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

---

## 🔒 Security Checklist

- [ ] Firewall enabled (UFW)
- [ ] Only ports 22, 80, 443 open
- [ ] SSL certificates active
- [ ] Strong database password
- [ ] Strong JWT secret (32+ chars)
- [ ] .env files not in Git
- [ ] Regular backups scheduled

---

## 📞 Emergency Contacts

| Issue | Action |
|-------|--------|
| Site Down | Check PM2 and Nginx status |
| Database Error | Check MySQL status and logs |
| SSL Expired | Run `sudo certbot renew` |
| High CPU | Check `pm2 monit` and `htop` |
| Disk Full | Check `df -h` and clean logs |

---

## 🔄 Update Workflow

1. **Backup Database**
   ```bash
   mysqldump -u bloodapp -p blood_donation_db > backup_$(date +%Y%m%d).sql
   ```

2. **Pull Changes**
   ```bash
   cd /var/www/blood-donation-system
   git pull
   ```

3. **Update Backend**
   ```bash
   cd backend
   npm install
   pm2 restart blood-donation-api
   ```

4. **Update Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run build
   sudo systemctl reload nginx
   ```

5. **Verify**
   ```bash
   pm2 status
   curl https://api.parneet.me/api/constituencies
   ```

---

## 📝 Configuration Files

### Nginx Backend Config
`/etc/nginx/sites-available/api.parneet.me`

### Nginx Frontend Config
`/etc/nginx/sites-available/parneet.me`

### PM2 Ecosystem
```bash
pm2 save
pm2 startup
```

---

## 🎯 Testing Endpoints

```bash
# Test API
curl https://api.parneet.me/api/constituencies

# Test with auth
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.parneet.me/api/user/1

# Check SSL
curl -I https://parneet.me
```

---

## 💾 Backup Strategy

### Daily Backups
```bash
# Add to crontab
0 2 * * * mysqldump -u bloodapp -p'PASSWORD' blood_donation_db > /backups/db_$(date +\%Y\%m\%d).sql
```

### Keep Last 7 Days
```bash
find /backups -name "db_*.sql" -mtime +7 -delete
```

---

## 📚 Documentation Links

- [Full Deployment Guide](./AZURE_DEPLOYMENT_GUIDE.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Changes Summary](./DEPLOYMENT_CHANGES_SUMMARY.md)
- [Main README](./README.md)

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Domain:** parneet.me

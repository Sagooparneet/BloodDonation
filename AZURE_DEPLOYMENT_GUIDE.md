# Azure VM Deployment Guide for Blood Donation System

## Overview
This guide will help you deploy the Blood Donation Management System on an Azure VM with the domain **parneet.me**.

## Prerequisites
- Azure VM (Ubuntu 20.04 or later recommended)
- Domain: parneet.me pointing to your Azure VM IP
- SSH access to your VM
- MySQL installed on VM
- Node.js 18+ and npm installed

## Architecture
- **Frontend**: https://parneet.me (React app served via Nginx)
- **Backend API**: https://api.parneet.me (Express.js on port 3001)
- **Database**: MySQL on localhost

---

## Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Node.js and npm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be 18+
npm --version
```

### 1.3 Install MySQL
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

### 1.4 Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1.5 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 1.6 Install Certbot for SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

## Step 2: DNS Configuration

### 2.1 Configure DNS Records
In your domain registrar (where parneet.me is registered), add these A records:

```
Type    Name    Value               TTL
A       @       <YOUR_VM_IP>        3600
A       api     <YOUR_VM_IP>        3600
A       www     <YOUR_VM_IP>        3600
```

Wait for DNS propagation (5-30 minutes).

---

## Step 3: Database Setup

### 3.1 Create Database and User
```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE blood_donation_db;
CREATE USER 'bloodapp'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON blood_donation_db.* TO 'bloodapp'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.2 Import Database Schema
If you have a SQL dump file:
```bash
mysql -u bloodapp -p blood_donation_db < database_schema.sql
```

---

## Step 4: Deploy Application

### 4.1 Clone/Upload Project
```bash
cd /var/www
sudo mkdir -p blood-donation-system
sudo chown -R $USER:$USER blood-donation-system
cd blood-donation-system

# Upload your project files here via SCP, Git, or FTP
# Example with Git:
# git clone <your-repo-url> .
```

### 4.2 Install Dependencies
```bash
# Install backend dependencies
cd /var/www/blood-donation-system/backend
npm install

# Install frontend dependencies
cd /var/www/blood-donation-system/frontend
npm install
```

---

## Step 5: Configure Backend

### 5.1 Create Backend .env File
```bash
cd /var/www/blood-donation-system/backend
nano .env
```

Add the following:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=bloodapp
DB_PASSWORD=your_secure_password
DB_NAME=blood_donation_db
DB_PORT=3306

# Server Configuration
PORT=3001

# JWT Secret (generate a strong random string)
JWT_SECRET=your_very_secure_jwt_secret_key_here_min_32_chars

# Email Configuration (Gmail example)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL (for CORS)
FRONTEND_URL=https://parneet.me

# Backend URL
BACKEND_URL=https://api.parneet.me
```

Save and exit (Ctrl+X, Y, Enter).

### 5.2 Test Backend
```bash
cd /var/www/blood-donation-system/backend
node index.js
```

If it starts successfully, press Ctrl+C to stop it.

---

## Step 6: Configure Frontend

### 6.1 Create Frontend .env File
```bash
cd /var/www/blood-donation-system/frontend
nano .env
```

Add:
```env
REACT_APP_API_URL=https://api.parneet.me
```

### 6.2 Build Frontend for Production
```bash
cd /var/www/blood-donation-system/frontend
npm run build
```

This creates an optimized production build in the `build/` folder.

---

## Step 7: Configure Nginx

### 7.1 Create Nginx Config for Backend API
```bash
sudo nano /etc/nginx/sites-available/api.parneet.me
```

Add:
```nginx
server {
    listen 80;
    server_name api.parneet.me;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.2 Create Nginx Config for Frontend
```bash
sudo nano /etc/nginx/sites-available/parneet.me
```

Add:
```nginx
server {
    listen 80;
    server_name parneet.me www.parneet.me;

    root /var/www/blood-donation-system/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7.3 Enable Sites
```bash
sudo ln -s /etc/nginx/sites-available/api.parneet.me /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/parneet.me /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
```

### 7.4 Test and Reload Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 8: Setup SSL Certificates

### 8.1 Obtain SSL Certificates
```bash
sudo certbot --nginx -d parneet.me -d www.parneet.me -d api.parneet.me
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (option 2)

### 8.2 Auto-renewal Test
```bash
sudo certbot renew --dry-run
```

---

## Step 9: Start Backend with PM2

### 9.1 Start Backend
```bash
cd /var/www/blood-donation-system/backend
pm2 start index.js --name blood-donation-api
pm2 save
pm2 startup
```

Follow the command output to enable PM2 on system boot.

### 9.2 Monitor Backend
```bash
pm2 status
pm2 logs blood-donation-api
pm2 monit
```

---

## Step 10: Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

---

## Step 11: Verify Deployment

### 11.1 Check Backend API
```bash
curl https://api.parneet.me/api/constituencies
```

### 11.2 Check Frontend
Open browser and visit:
- https://parneet.me
- https://www.parneet.me

### 11.3 Test Full Flow
1. Sign up as a new user
2. Login
3. Create a blood request
4. Check all dashboards

---

## Step 12: Maintenance Commands

### Backend Management
```bash
# View logs
pm2 logs blood-donation-api

# Restart backend
pm2 restart blood-donation-api

# Stop backend
pm2 stop blood-donation-api

# View status
pm2 status
```

### Frontend Updates
```bash
cd /var/www/blood-donation-system/frontend
git pull  # or upload new files
npm install
npm run build
sudo systemctl reload nginx
```

### Backend Updates
```bash
cd /var/www/blood-donation-system/backend
git pull  # or upload new files
npm install
pm2 restart blood-donation-api
```

### Database Backup
```bash
mysqldump -u bloodapp -p blood_donation_db > backup_$(date +%Y%m%d).sql
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Backend Not Starting
```bash
pm2 logs blood-donation-api
# Check for database connection errors
# Verify .env file settings
```

### Frontend Shows Blank Page
```bash
# Check browser console for errors
# Verify build was successful
sudo nginx -t
sudo systemctl status nginx
```

### CORS Errors
- Verify FRONTEND_URL in backend/.env matches your domain
- Check backend CORS configuration in index.js
- Clear browser cache

### Database Connection Failed
```bash
# Test MySQL connection
mysql -u bloodapp -p blood_donation_db

# Check MySQL is running
sudo systemctl status mysql
```

### SSL Certificate Issues
```bash
sudo certbot certificates
sudo certbot renew
```

---

## Security Checklist

- [ ] Strong MySQL password set
- [ ] JWT_SECRET is a strong random string (32+ characters)
- [ ] Email credentials secured
- [ ] Firewall configured (UFW)
- [ ] SSL certificates installed
- [ ] Database user has minimal required privileges
- [ ] .env files are not in Git repository
- [ ] Regular backups scheduled
- [ ] PM2 configured to restart on failure
- [ ] Nginx security headers added (optional)

---

## Performance Optimization

### Enable Gzip in Nginx
Add to `/etc/nginx/nginx.conf` in the `http` block:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Add Nginx Security Headers
Add to your server blocks:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

---

## Monitoring

### Setup PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Monitor System Resources
```bash
htop
df -h
free -m
```

---

## Support

For issues:
1. Check logs: `pm2 logs` and `/var/log/nginx/error.log`
2. Verify all services are running
3. Check DNS propagation
4. Review firewall rules

---

## Summary

Your application is now deployed at:
- **Frontend**: https://parneet.me
- **API**: https://api.parneet.me
- **Database**: MySQL on localhost

All API calls from the frontend now use the production API URL instead of localhost.

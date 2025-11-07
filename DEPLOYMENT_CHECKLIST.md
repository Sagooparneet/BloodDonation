# Deployment Checklist for parneet.me

## Pre-Deployment

- [ ] Azure VM is provisioned and accessible via SSH
- [ ] Domain parneet.me DNS records point to VM IP
  - [ ] A record: @ → VM_IP
  - [ ] A record: api → VM_IP
  - [ ] A record: www → VM_IP
- [ ] Node.js 18+ installed on VM
- [ ] MySQL installed and secured on VM
- [ ] Nginx installed on VM
- [ ] PM2 installed globally
- [ ] Certbot installed for SSL

## Configuration Files Updated

### Backend
- [x] `backend/.env.example` - Updated with production URLs
- [x] `backend/index.js` - CORS configured for parneet.me
- [ ] `backend/.env` - Created on server with actual credentials

### Frontend
- [x] `frontend/.env.example` - Updated with api.parneet.me
- [x] `frontend/src/config/api.js` - Default URL set to api.parneet.me
- [x] `frontend/src/setupProxy.js` - Uses environment variable
- [x] All page components - Using API_BASE_URL from config
- [ ] `frontend/.env` - Created on server

### Pages Updated (All using API_BASE_URL)
- [x] SignUp/SignUpForm.jsx
- [x] Login/LoginForm.jsx
- [x] ResetPassword/ResetPassword.jsx
- [x] AdminLogin/AdminLogin.jsx
- [x] AdminDashboard/AdminDashboard.jsx
- [x] DonorDashboard/DonorDashboard.jsx
- [x] RecipientDashboard/RecipientDashboard.jsx
- [x] DonorMatching/DonorMatching.jsx
- [x] HealthProviderDashboard/HealthProviderDashboard.jsx
- [x] BloodRequestForm/BloodRequestForm.jsx
- [x] CommunityHub/CommunityHub.jsx

## Database Setup

- [ ] MySQL database `blood_donation_db` created
- [ ] Database user created with appropriate privileges
- [ ] Database schema imported/migrated
- [ ] Test data loaded (if needed)

## Application Deployment

- [ ] Project files uploaded to `/var/www/blood-donation-system`
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend built for production (`npm run build`)
- [ ] Backend .env file configured with production values
- [ ] Frontend .env file configured with API URL

## Nginx Configuration

- [ ] Backend reverse proxy configured (`/etc/nginx/sites-available/api.parneet.me`)
- [ ] Frontend static files configured (`/etc/nginx/sites-available/parneet.me`)
- [ ] Sites enabled (symlinks created)
- [ ] Default site removed
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] Nginx reloaded

## SSL Certificates

- [ ] SSL certificates obtained via Certbot
- [ ] Auto-renewal configured
- [ ] HTTPS redirect enabled
- [ ] All three domains covered (parneet.me, www.parneet.me, api.parneet.me)

## Process Management

- [ ] Backend started with PM2
- [ ] PM2 configured to start on boot
- [ ] PM2 process saved

## Security

- [ ] Firewall configured (UFW)
- [ ] Only necessary ports open (80, 443, 22)
- [ ] Strong passwords used for database
- [ ] JWT_SECRET is strong and unique
- [ ] Email credentials secured
- [ ] .env files not in version control

## Testing

- [ ] Backend API accessible at https://api.parneet.me
- [ ] Frontend accessible at https://parneet.me
- [ ] User signup works
- [ ] User login works
- [ ] All dashboards load correctly
- [ ] Blood request creation works
- [ ] Donor matching works
- [ ] Appointments can be booked
- [ ] Email notifications work
- [ ] Admin dashboard accessible
- [ ] All API endpoints responding correctly

## Post-Deployment

- [ ] Database backup scheduled
- [ ] Monitoring setup (PM2 logs, Nginx logs)
- [ ] Log rotation configured
- [ ] Performance tested
- [ ] Mobile responsiveness checked
- [ ] Browser compatibility tested
- [ ] Documentation updated

## Rollback Plan

- [ ] Previous version backed up
- [ ] Database backup before deployment
- [ ] Rollback procedure documented

## Monitoring Commands

```bash
# Check backend status
pm2 status
pm2 logs blood-donation-api

# Check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Check MySQL
sudo systemctl status mysql

# Check SSL certificates
sudo certbot certificates

# Monitor system resources
htop
df -h
```

## Emergency Contacts

- Azure Support: [Azure Portal]
- Domain Registrar: [Your registrar]
- Database Admin: [Contact]
- DevOps Team: [Contact]

---

## Deployment Date: _______________
## Deployed By: _______________
## Version: _______________

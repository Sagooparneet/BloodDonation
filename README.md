# Blood Donation Management System

A full-stack application for managing blood donation requests, donors, and healthcare providers.

## Project Structure

```
blood-donation-system/
├── backend/                # Express.js API (Port 3001)
│   ├── controllers/       # Business logic
│   ├── routes/           # API endpoints
│   ├── middleware/       # Authentication
│   ├── lib/             # Database & utilities
│   ├── utils/           # Helper functions
│   ├── index.js         # Entry point
│   ├── .env.example     # Environment template
│   └── package.json     # Backend dependencies
│
├── frontend/             # React Application (Port 3000)
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── config/      # API configuration
│   │   └── setupProxy.js # Proxy config
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
│
├── package.json         # Root scripts
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Quick Start

### 1. Install All Dependencies
```bash
npm run install:all
```

Or install separately:
```bash
npm run install:backend
npm run install:frontend
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blood_donation_db
DB_PORT=3306
PORT=3001
JWT_SECRET=your_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Create Database
```sql
CREATE DATABASE blood_donation_db;
```

### 4. Run the Application

**Option A: Run both servers together**
```bash
npm start
```

**Option B: Run separately**
```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - Frontend
npm run start:frontend
```

**Option C: Development mode with auto-reload**
```bash
npm run dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Features

- 👤 **User Authentication** - JWT-based auth for multiple user types
- 🩸 **Blood Request Management** - Create and track blood requests
- 🤝 **Donor Matching** - Smart matching algorithm
- 📅 **Appointment Scheduling** - Book donation appointments
- 💬 **Community Hub** - Share stories and experiences
- 👨‍⚕️ **Healthcare Provider Dashboard** - Manage requests and appointments
- 🔐 **Admin Panel** - User and system management
- 📧 **Email Notifications** - Automated email alerts
- ⏰ **Automated Reminders** - Cron-based appointment reminders

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Reset password

### Blood Requests
- `GET /api/blood-request/active` - Get active requests
- `POST /api/blood-request` - Create new request
- `POST /api/blood-request/mark-complete` - Mark request complete
- `GET /api/blood-request/donor-requests` - Get donor-specific requests

### Donors
- `GET /api/donors` - Get all donors
- `PUT /api/user/:id` - Update user profile

### Community
- `GET /api/community/stories` - Get all stories
- `POST /api/community/stories` - Share a story

### Admin
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status

### Other
- `GET /api/constituencies` - Get locations
- `GET /api/hospitals/:constituency` - Get hospitals by location
- `POST /api/appointments` - Create appointment
- `GET /api/notifications/:userId` - Get user notifications

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: MySQL with mysql2
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Email**: Nodemailer
- **Scheduling**: node-cron
- **Validation**: validator
- **CORS**: cors middleware

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Charts**: Chart.js & react-chartjs-2
- **Maps**: Mapbox GL
- **Notifications**: Sonner & SweetAlert2
- **Build Tool**: Create React App (react-scripts)
- **Proxy**: http-proxy-middleware

## Development

### Backend Development
```bash
cd backend
npm run dev  # Requires nodemon
```

### Frontend Development
```bash
cd frontend
npm start
```

### Install Nodemon (Optional)
```bash
cd backend
npm install --save-dev nodemon
```

## Scripts Reference

### Root Level
- `npm run install:all` - Install all dependencies
- `npm run install:backend` - Install backend dependencies
- `npm run install:frontend` - Install frontend dependencies
- `npm run start:backend` - Start backend server
- `npm run start:frontend` - Start frontend server
- `npm run dev:backend` - Start backend with nodemon
- `npm run dev:frontend` - Start frontend dev server
- `npm start` - Start both servers (requires concurrently)
- `npm run dev` - Start both in dev mode (requires concurrently)

### Backend (cd backend)
- `npm start` - Start production server
- `npm run dev` - Start with auto-reload

### Frontend (cd frontend)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blood_donation_db
DB_PORT=3306

# Server
PORT=3001

# JWT
JWT_SECRET=your_secret_key

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (.env) - Optional
```env
REACT_APP_API_URL=http://localhost:3001
```

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Database Connection Failed
- Verify MySQL is running
- Check credentials in `backend/.env`
- Ensure database exists
- Check firewall settings

### Module Not Found
```bash
# Reinstall all dependencies
npm run install:all

# Or specific folder
cd backend && npm install
cd frontend && npm install
```

### CORS Errors
- Backend CORS is enabled for all origins
- Check that backend is running on port 3001
- Verify proxy configuration in `frontend/src/setupProxy.js`

## Deployment

### Production Deployment (Azure VM)

This project is configured for deployment on Azure VM with domain **parneet.me**.

**Live URLs:**
- Frontend: https://parneet.me
- Backend API: https://api.parneet.me

**Deployment Documentation:**
- [Complete Azure Deployment Guide](./AZURE_DEPLOYMENT_GUIDE.md) - Step-by-step instructions
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre and post-deployment tasks

**Key Changes for Production:**
- All API endpoints use `https://api.parneet.me` instead of `localhost:3001`
- Frontend uses environment variable `REACT_APP_API_URL`
- Backend CORS configured for `https://parneet.me`
- SSL certificates via Let's Encrypt
- PM2 for process management
- Nginx as reverse proxy

### Local Development

For local development, the app still works with localhost:
```bash
# Backend runs on http://localhost:3001
# Frontend runs on http://localhost:3000
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue on the repository.

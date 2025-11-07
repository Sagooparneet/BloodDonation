# Quick Start Guide 🚀

## Project Structure

```
blood-donation-system/
├── backend/          # Express API (Port 3001)
├── frontend/         # React App (Port 3000)
└── package.json      # Root scripts
```

## Setup (5 Minutes)

### 1. Install Dependencies
```bash
npm run install:all
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
PORT=3001
JWT_SECRET=your_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Create Database
```sql
CREATE DATABASE blood_donation_db;
```

### 4. Start the App

**Easy way (both servers at once):**
```bash
npm start
```

**Or run separately:**
```bash
# Terminal 1 - Backend
npm run start:backend

# Terminal 2 - Frontend
npm run start:frontend
```

## Access

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Available Scripts

```bash
npm run install:all        # Install all dependencies
npm run install:backend    # Install backend only
npm run install:frontend   # Install frontend only
npm run start:backend      # Start backend
npm run start:frontend     # Start frontend
npm start                  # Start both servers
npm run dev               # Start both in dev mode
```

## Troubleshooting

**Port in use:**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Database error:**
- Check MySQL is running
- Verify `backend/.env` credentials
- Ensure database exists

**Module not found:**
```bash
npm run install:all
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure backend/.env
3. ✅ Create database
4. ✅ Run `npm start`
5. ✅ Open http://localhost:3000

That's it! 🎉

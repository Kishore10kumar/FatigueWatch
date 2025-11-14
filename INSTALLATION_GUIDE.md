# 📥 FatigueWatch - Complete Installation Guide

This guide will walk you through installing and running FatigueWatch from GitHub, even if you're new to programming.

## 📋 What You Need

Before starting, you'll need these installed on your computer:

### 1. Node.js (JavaScript Runtime)
- **Download**: https://nodejs.org/
- **Version**: 18 or higher
- **Why**: Runs the backend server and installs packages
- **How to check if installed**: Open terminal/command prompt and type:
  ```bash
  node --version
  ```
  Should show: `v18.x.x` or higher

### 2. Git (Version Control)
- **Download**: https://git-scm.com/downloads
- **Why**: Downloads the project from GitHub
- **How to check if installed**: 
  ```bash
  git --version
  ```

### 3. Web Browser
- **Chrome** or **Edge** (recommended)
- **Why**: Best compatibility with MediaPipe AI

### 4. Webcam
- Built-in laptop camera or external USB webcam

---

## 🚀 Installation Steps

### Step 1: Download the Project

**Option A: Using Git (Recommended)**
```bash
# Open Terminal (Mac/Linux) or Command Prompt (Windows)
# Navigate to where you want to save the project
cd Desktop

# Clone the repository
git clone https://github.com/Kishore10kumar/FatigueWatch.git

# Enter the project folder
cd FatigueWatch
```

**Option B: Download ZIP**
1. Go to https://github.com/Kishore10kumar/FatigueWatch
2. Click green "Code" button → Download ZIP
3. Extract the ZIP file
4. Open Terminal/Command Prompt in that folder

---

### Step 2: Install Dependencies

In your terminal/command prompt (inside the FatigueWatch folder):

```bash
npm install
```

**What happens:**
- Downloads 476 required packages
- Takes 2-5 minutes depending on internet speed
- Creates `node_modules` folder (don't delete this!)

**If you see errors:**
- Make sure Node.js 18+ is installed
- Try running: `npm cache clean --force` then `npm install` again

---

### Step 3: Start the Application

```bash
npm run dev
```

**What happens:**
- Starts the Express server (backend)
- Starts the Vite dev server (frontend)
- Both run on port 5000

**You should see:**
```
[express] serving on port 5000
```

**Keep this terminal open!** Closing it stops the server.

---

### Step 4: Open in Browser

1. Open **Chrome** or **Edge**
2. Go to: **http://localhost:5000**
3. You should see the FatigueWatch dashboard

---

### Step 5: Grant Camera Access

1. Browser will ask: "Allow camera access?"
2. Click **Allow**
3. If blocked, check browser settings:
   - Chrome: Settings → Privacy and security → Site settings → Camera
   - Edge: Settings → Cookies and site permissions → Camera

---

### Step 6: Start Monitoring

1. Click **"Start Monitoring"** button on the dashboard
2. Position your face in the webcam frame
3. Wait 10-30 seconds for AI to initialize
   - First time: Downloads MediaPipe models (~50MB)
   - You'll see: "Initializing AI..."
4. Once ready, green facial landmarks will appear
5. Dashboard metrics will start updating in real-time

---

## 📊 What You Should See

### Initial Load
```
Video metadata loaded...
Loading MediaPipe libraries...
Initializing FaceMesh...
Face detection initialized successfully ✓
```

### Dashboard Display
- **Drowsiness Score**: 0-100 (updates every second)
- **Eye State**: Open / Drowsy / Closed
- **Blink Rate**: Blinks per minute
- **Head Position**: Normal / Tilted
- **Alert Level**: Safe / Warning / Critical / Emergency

### Face Overlay
- Green dots on your face (468 landmarks)
- Eye and mouth tracking lines
- Real-time facial mesh

---

## ⚙️ Optional Configuration

### Change Port (if 5000 is busy)

1. Create `.env` file in project root:
```env
PORT=3000
```

2. Restart the server
3. Open http://localhost:3000

### Enable Database Storage

By default, data is stored in memory (lost on restart).

For permanent storage:

1. Install PostgreSQL or use Neon (serverless)
2. Add to `.env`:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

3. Run migrations:
```bash
npm run db:push
```

---

## 🔧 Troubleshooting

### Problem: "Port 5000 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

Or change port in `.env` file.

---

### Problem: "MediaPipe not loading" or "FaceMesh is not a constructor"

**Solution:**
1. Use Chrome or Edge (not Firefox/Safari)
2. Check internet connection (needs to download AI models)
3. Clear browser cache and refresh
4. Check browser console (F12) for specific errors

---

### Problem: "npm: command not found"

**Solution:**
- Node.js not installed correctly
- Download and install from https://nodejs.org/
- Restart terminal after installation

---

### Problem: Camera shows black screen

**Solution:**
1. Check if camera is being used by another app
2. Refresh the page
3. Check browser camera permissions
4. Try a different browser

---

### Problem: High CPU usage

**Solution:**
- Normal behavior (30 FPS AI processing)
- Close other tabs/applications
- Reduce browser window size
- Update graphics drivers

---

## 📁 Project Structure

```
FatigueWatch/
├── client/              # Frontend React app
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Dashboard pages
│   │   ├── lib/         # AI detection engine
│   │   └── hooks/       # React hooks
├── server/              # Backend Express server
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # Data storage
├── shared/              # Shared types
│   └── schema.ts        # Database schemas
├── package.json         # Dependencies
└── README.md            # Documentation
```

---

## 🎯 Testing the System

### Test Drowsiness Detection

1. **Normal State** (Score: 0-30)
   - Look at camera normally
   - Blink naturally
   - Should show GREEN "Safe"

2. **Warning State** (Score: 31-60)
   - Close eyes partially
   - Reduce blinking
   - Should show YELLOW "Warning" + beep sound

3. **Critical State** (Score: 61-85)
   - Yawn multiple times
   - Close eyes longer
   - Should show ORANGE "Critical" + alarm

4. **Emergency State** (Score: 86-100)
   - Close eyes completely
   - Tilt head down
   - Should show RED "Emergency" + loud alert

---

## 🛑 Stopping the Application

1. Go to the terminal running `npm run dev`
2. Press `Ctrl + C` (Windows/Linux) or `Cmd + C` (Mac)
3. Type `Y` if asked to terminate
4. Close browser tab

---

## 🔄 Updating to Latest Version

```bash
# Pull latest changes from GitHub
git pull origin main

# Reinstall dependencies (if package.json changed)
npm install

# Restart the server
npm run dev
```

---

## 💡 Tips for Best Results

1. **Good Lighting**: Face should be well-lit, avoid backlighting
2. **Camera Position**: Eye-level, 1-2 feet away
3. **Stable Internet**: First load downloads ~50MB AI models
4. **Chrome Browser**: Best MediaPipe compatibility
5. **Close Other Tabs**: Reduces CPU usage
6. **No Glasses Glare**: Adjust angle to avoid reflection

---

## 📞 Need Help?

If you encounter issues:
1. Check this troubleshooting guide
2. Look at browser console (F12 → Console tab)
3. Check GitHub Issues: https://github.com/Kishore10kumar/FatigueWatch/issues
4. Create a new issue with:
   - Error message
   - Browser version
   - Operating system
   - Steps to reproduce

---

## ✅ Success Checklist

- [ ] Node.js 18+ installed
- [ ] Project downloaded/cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Server started (`npm run dev`)
- [ ] Browser opened (http://localhost:5000)
- [ ] Camera access granted
- [ ] Face detection working (green landmarks visible)
- [ ] Dashboard showing real-time metrics

**You're all set!** 🎉

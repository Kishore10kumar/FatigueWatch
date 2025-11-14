# Upload FatigueWatch to GitHub - Step by Step Guide

Your GitHub repository is ready at:
**https://github.com/Kishore10kumar/FatigueWatch**

## Steps to Upload Your Code

### 1. Open Replit Shell
Click on the **Shell** tab in your Replit workspace.

### 2. Run These Commands (Copy & Paste One by One)

```bash
# Configure Git (run once)
git config --global user.email "your-email@example.com"
git config --global user.name "Kishore Kumar"

# Initialize Git Repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: FatigueWatch - Real-time Driver Drowsiness Detection System

- Complete AI-powered face detection using MediaPipe
- Real-time drowsiness monitoring with 30 FPS processing
- Progressive audio alert system (Safe → Warning → Critical → Emergency)
- Professional React dashboard with live metrics and analytics
- WebSocket real-time communication for multi-client monitoring
- Full TypeScript stack with end-to-end type safety
- Production-ready PostgreSQL integration with Drizzle ORM
- Robust 3-tier MediaPipe loading system for cross-device compatibility"

# Add GitHub remote
git remote add origin https://github.com/Kishore10kumar/FatigueWatch.git

# Push to GitHub
git push -u origin main
```

### 3. If Git Push Asks for Authentication

If prompted for username and password:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)

To create a Personal Access Token:
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "FatigueWatch Upload"
4. Select scopes: `repo` (full control)
5. Click "Generate token"
6. Copy the token and use it as your password

## Alternative: If `main` branch doesn't work

Some repos use `master` instead of `main`. If the push fails, try:

```bash
git branch -M main
git push -u origin main
```

Or push to master:
```bash
git push -u origin master
```

## Your Repository Details

- **Repository Name**: FatigueWatch
- **Repository URL**: https://github.com/Kishore10kumar/FatigueWatch
- **Clone URL**: https://github.com/Kishore10kumar/FatigueWatch.git
- **Visibility**: Public

## What Gets Uploaded

All your project files including:
- ✓ Complete source code (24+ files)
- ✓ Frontend (React + TypeScript)
- ✓ Backend (Express + Node.js)
- ✓ AI detection system (MediaPipe integration)
- ✓ Database schemas (Drizzle ORM)
- ✓ Configuration files
- ✗ node_modules (excluded via .gitignore)
- ✗ Temporary files (excluded via .gitignore)

## After Upload

Once uploaded, your repository will be visible at:
https://github.com/Kishore10kumar/FatigueWatch

You can:
- Share this link with anyone
- Clone it on other computers
- Add a README.md file for project documentation
- Set up GitHub Pages for deployment
- Add collaborators
- Track issues and pull requests

---

**Need Help?** If you encounter any issues, let me know!

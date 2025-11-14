# 🚀 Upload to GitHub - Simple Steps

## Part 1: In Replit (Where to Enter Commands)

### Step 1: Open Shell Tab
1. Look at the **left side** of your Replit screen
2. Find and click the **"Shell"** tab (looks like a terminal/console icon)
3. You'll see a black/dark screen with a cursor blinking

### Step 2: Copy and Paste Commands

**Command 1:** Initialize Git
```bash
git init
```
- **What it does:** Prepares your project for GitHub
- **Paste this in Shell** → Press Enter
- **Wait for:** "Initialized empty Git repository"

**Command 2:** Add All Files
```bash
git add .
```
- **What it does:** Selects all your code files
- **Paste in Shell** → Press Enter
- **Wait for:** Command completes (no error)

**Command 3:** Save Changes
```bash
git commit -m "Initial commit: FatigueWatch - AI Driver Drowsiness Detection System"
```
- **What it does:** Saves a snapshot of your code
- **Paste in Shell** → Press Enter
- **Wait for:** "files changed" message

**Command 4:** Connect to GitHub
```bash
git remote add origin https://github.com/Kishore10kumar/FatigueWatch.git
```
- **What it does:** Links your code to GitHub repository
- **Paste in Shell** → Press Enter
- **Wait for:** Command completes silently

**Command 5:** Upload to GitHub
```bash
git push -u origin main
```
- **What it does:** Uploads all your code to GitHub
- **Paste in Shell** → Press Enter
- **GitHub will ask for:**
  - **Username:** Kishore10kumar
  - **Password:** ⚠️ **NOT your GitHub password!** Use Personal Access Token (see below)

---

## Part 2: In GitHub (Create Access Token)

### Why You Need This
GitHub doesn't accept regular passwords anymore. You need a special "token" (temporary password).

### How to Create Personal Access Token

**Step 1:** Go to GitHub Settings
1. Open **https://github.com**
2. Log in to your account
3. Click your **profile picture** (top right corner)
4. Click **Settings**

**Step 2:** Developer Settings
1. Scroll down to bottom of left sidebar
2. Click **Developer settings**

**Step 3:** Personal Access Tokens
1. Click **Personal access tokens**
2. Click **Tokens (classic)**
3. Click **Generate new token (classic)**

**Step 4:** Configure Token
1. **Note:** Type "FatigueWatch Upload"
2. **Expiration:** Select "30 days" or "No expiration"
3. **Select scopes:** Check the box for **`repo`** (this gives full repository access)
4. Scroll down and click **Generate token**

**Step 5:** Copy Token
1. You'll see a long string like: `ghp_xxxxxxxxxxxxxxxxxxxx`
2. **⚠️ IMPORTANT:** Copy this NOW - you won't see it again!
3. Save it somewhere safe (notepad)

**Step 6:** Use Token
1. Go back to Replit Shell
2. When `git push` asks for password
3. **Paste the token** (not your GitHub password)
4. Press Enter

---

## Visual Guide: Where Everything Is

### In Replit:
```
┌─────────────────────────────────────────────────┐
│  Replit Screen                                  │
│                                                 │
│  Left Sidebar:                                  │
│  📁 Files                                       │
│  🔧 Tools                                       │
│  ⚡ Shell  ← CLICK HERE!                       │
│                                                 │
│  Shell Tab (where you paste commands):          │
│  ┌─────────────────────────────────────┐       │
│  │ $ _                                 │       │
│  │ ← Paste commands here               │       │
│  │                                     │       │
│  └─────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

### In GitHub:
```
GitHub.com
├─ Profile Picture (top right) → Settings
    └─ Developer settings (bottom left)
        └─ Personal access tokens
            └─ Tokens (classic)
                └─ Generate new token (classic)
                    ├─ Note: "FatigueWatch Upload"
                    ├─ Expiration: 30 days
                    └─ ✅ repo (check this box)
                        → Generate token
                        → COPY THE TOKEN!
```

---

## Complete Process (All Commands in Order)

**Copy these one by one into Replit Shell:**

```bash
# 1. Initialize
git init

# 2. Add files
git add .

# 3. Commit
git commit -m "Initial commit: FatigueWatch - AI Driver Drowsiness Detection System"

# 4. Connect to GitHub
git remote add origin https://github.com/Kishore10kumar/FatigueWatch.git

# 5. Upload (will ask for username & token)
git push -u origin main
```

**When it asks:**
- Username: `Kishore10kumar`
- Password: `Paste your Personal Access Token here`

---

## ✅ How to Know It Worked

After `git push`, you should see:
```
Enumerating objects: 100, done.
Counting objects: 100% (100/100), done.
Writing objects: 100% (100/100), done.
To https://github.com/Kishore10kumar/FatigueWatch.git
 * [new branch]      main -> main
```

Then go to: **https://github.com/Kishore10kumar/FatigueWatch**

You should see all your files there! 🎉

---

## 🆘 If Something Goes Wrong

### Error: "remote origin already exists"
**Fix:** Run this first:
```bash
git remote remove origin
```
Then try the `git remote add origin` command again.

### Error: "Permission denied"
**Fix:** 
- Your token might be wrong
- Create a new token on GitHub
- Make sure you checked the `repo` box
- Copy it correctly (no spaces)

### Error: "Updates were rejected"
**Fix:**
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 🎯 Quick Checklist

- [ ] Opened Shell tab in Replit
- [ ] Created Personal Access Token on GitHub
- [ ] Copied the token somewhere safe
- [ ] Ran all 5 git commands in order
- [ ] Used token (not password) when asked
- [ ] Saw success message
- [ ] Checked GitHub - files are there!

**That's it! Your code is now on GitHub!** 🚀

# HOW TO RUN VOUCH — Complete Step-by-Step Guide
### For Emulators, Physical Devices, and Local Development
> Written for non-technical readers. Follow every step in order.

---

## TABLE OF CONTENTS

1. [What You Need to Install First (Prerequisites)](#1-prerequisites)
2. [Project Folder Structure](#2-project-folder-structure)
3. [Setting Up the Backend (Server)](#3-setting-up-the-backend)
4. [Setting Up the Frontend (Mobile App)](#4-setting-up-the-frontend)
5. [Running on Android Emulator (Single)](#5-running-on-android-emulator-single)
6. [Running on Multiple Emulators at the Same Time](#6-running-on-multiple-emulators)
7. [Running on a Physical Android Device](#7-running-on-a-physical-android-device)
8. [Running on iOS Simulator (Mac only)](#8-running-on-ios-simulator-mac-only)
9. [Seeding the Admin Account](#9-seeding-the-admin-account)
10. [Stopping Everything](#10-stopping-everything)
11. [Common Errors and Fixes](#11-common-errors-and-fixes)
12. [Quick Reference — All Commands in One Place](#12-quick-reference)

---

## 1. PREREQUISITES

Before you run anything, make sure the following software is installed on your computer.

### 1.1 Required for Everyone

| Software | Where to Download | Why It's Needed |
|---|---|---|
| **Node.js 20** (LTS) | https://nodejs.org | Runs the backend server and React Native build tools |
| **Git** | https://git-scm.com | To clone the repository |
| **Android Studio** | https://developer.android.com/studio | Provides the Android emulator and SDK tools |
| **Java JDK 17** | https://www.oracle.com/java/technologies/downloads/ | Required to build Android apps |

### 1.2 Check Your Installation

Open a terminal (PowerShell on Windows / Terminal on Mac) and run these commands one by one:

```powershell
node --version
# Expected output: v20.x.x

npm --version
# Expected output: 10.x.x

java -version
# Expected output: openjdk version "17.x.x" ...

adb --version
# Expected output: Android Debug Bridge version 35.x.x
# If adb is not found, see Section 1.3 below
```

### 1.3 Add ADB to PATH (Windows only — if `adb` is not found)

ADB (Android Debug Bridge) is inside Android Studio. Add it to your PATH:

1. Open **System Properties** → **Advanced** → **Environment Variables**
2. Under **System Variables**, click on **Path** → **Edit**
3. Click **New** and add this path (adjust the drive letter if Android SDK is elsewhere):
   ```
   C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\platform-tools
   ```
4. Click OK, close and reopen your terminal
5. Run `adb --version` again — it should now work

### 1.4 MongoDB Atlas (Cloud Database)

The backend connects to MongoDB Atlas (cloud). You need:
- A MongoDB Atlas account: https://cloud.mongodb.com
- A cluster created and a connection string (`MONGODB_URI`) that looks like:
  ```
  mongodb+srv://username:password@cluster0.xxxx.mongodb.net/vouch?retryWrites=true&w=majority
  ```
- This string goes into the `.env` file in Step 3.

---

## 2. PROJECT FOLDER STRUCTURE

After cloning, your folder looks like this:

```
CodeBase/                      ← ROOT of the project
│
├── VouchBackend/              ← The server (Node.js + Express)
│   ├── server.ts              ← Entry point of the backend
│   ├── package.json           ← Backend dependencies
│   ├── .env                   ← Secret config file (YOU must create this)
│   └── src/                   ← All backend source code
│
└── VouchFrontend/             ← The mobile app (React Native)
    ├── App.tsx                ← Entry point of the app
    ├── package.json           ← Frontend dependencies
    └── src/                   ← All app source code
```

> **Important:** The backend and frontend are two separate projects. Each has its own `package.json` and needs its own `npm install`.

---

## 3. SETTING UP THE BACKEND

### 3.1 Open a Terminal and Go to the Backend Folder

```powershell
cd D:\Project\CodeBase\VouchBackend
```

### 3.2 Install Dependencies

```powershell
npm install
```

This downloads all the packages the server needs. It takes 1-2 minutes. You will see a `node_modules` folder created.

### 3.3 Create the Environment File (.env)

The backend needs secret keys and database credentials. These are stored in a `.env` file that you must create manually (it is never stored in Git for security reasons).

```powershell
# Run this to create the file (Windows PowerShell)
New-Item -Path ".env" -ItemType File
```

Now open the `.env` file in any text editor (Notepad, VS Code, etc.) and paste the following, filling in your own values:

```env
# ─── Server ─────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── Database ────────────────────────────────────────────
# Paste your MongoDB Atlas connection string here
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/vouch?retryWrites=true&w=majority

# ─── JWT Secrets (make these long random strings) ────────
# You can use any 32+ character random string
JWT_ACCESS_SECRET=change_this_to_a_random_secret_at_least_32_chars
JWT_REFRESH_SECRET=change_this_to_another_random_secret_32_chars

# ─── JWT Expiry ───────────────────────────────────────────
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# ─── Cloudinary (for document uploads) ───────────────────
# Get these from https://cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── Admin Account Seed ───────────────────────────────────
# This email/password will be used to create the admin account
ADMIN_SEED_EMAIL=admin@vouch.com
ADMIN_SEED_PASSWORD=Admin@1234

# ─── CORS (leave blank for development) ──────────────────
ALLOWED_ORIGINS=
```

> **Tip:** To generate a random 32-character secret in PowerShell, run:
> ```powershell
> -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
> ```

### 3.4 Start the Backend in Development Mode

```powershell
# Make sure you are in VouchBackend folder
cd D:\Project\CodeBase\VouchBackend

npm run dev
```

**What you should see:**
```
[INFO] MongoDB connected
[INFO] HTTP server listening on port 5000
[INFO] Socket.IO attached
```

> The backend is now running at **http://localhost:5000**
> Keep this terminal window open. Do NOT close it.

### 3.5 Verify the Backend is Running

Open a new browser tab and go to:
```
http://localhost:5000/api/v1
```
You should see a JSON response like `{ "message": "Vouch API v1" }` — this confirms the backend is up.

---

## 4. SETTING UP THE FRONTEND

### 4.1 Open a New Terminal and Go to the Frontend Folder

```powershell
cd D:\Project\CodeBase\VouchFrontend
```

### 4.2 Install Dependencies

```powershell
npm install
```

This takes 2-5 minutes. A `node_modules` folder will be created.

### 4.3 Install Android Dependencies (Gradle)

```powershell
cd android
./gradlew wrapper
cd ..
```

> If you see permission errors on Mac/Linux, run: `chmod +x android/gradlew` first.

### 4.4 Understanding the API URL Setting

The app connects to the backend using a URL. This URL is different depending on how you are running the app:

| Running On | URL to use | File to edit |
|---|---|---|
| Android Emulator | `http://10.0.2.2:5000` | `src/utils/constants.ts` |
| Physical Android Device | `http://YOUR_PC_LAN_IP:5000` | `src/utils/constants.ts` |
| iOS Simulator (Mac) | `http://localhost:5000` | `src/utils/constants.ts` |

The file to edit is at:
```
D:\Project\CodeBase\VouchFrontend\src\utils\constants.ts
```

Current contents (for emulator — this is the default):
```typescript
const DEV_HOST = '10.0.2.2'; // Android emulator loopback
// const DEV_HOST = '192.168.x.x'; // Uncomment this for physical device, use your PC's IP
export const API_BASE_URL = `http://${DEV_HOST}:5000/api/v1`;
export const SOCKET_URL   = `http://${DEV_HOST}:5000`;
```

> **For emulator:** Leave this as-is. `10.0.2.2` is the special address Android emulator uses to reach `localhost` on your PC.
> **For physical device:** See Section 7 for the exact change to make.

---

## 5. RUNNING ON ANDROID EMULATOR (SINGLE)

### Step 1 — Open Android Studio and Launch an Emulator

1. Open **Android Studio**
2. Click **More Actions** → **Virtual Device Manager** (or **AVD Manager**)
3. You should see emulators like `Pixel 7 Pro` or `Pixel 9 Pro XL`
4. Click the **Play (▶)** button next to your emulator to start it
5. Wait until the emulator fully boots to the Android home screen (takes 1-3 minutes)

**Alternative — Launch emulator from command line (faster):**

```powershell
# Launch Pixel 7 Pro
$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe -avd Pixel_7_Pro

# OR launch Pixel 9 Pro XL
$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe -avd Pixel_9_Pro_XL
```

### Step 2 — Check Emulator is Detected

```powershell
adb devices
```

Expected output:
```
List of devices attached
emulator-5554   device
```

### Step 3 — Set Up Port Forwarding

This allows the emulator to talk to your backend running on localhost:

```powershell
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5000 tcp:5000
```

> `8081` is for the React Native Metro bundler. `5000` is for your backend API.

### Step 4 — Start the Metro Bundler

Metro is the JavaScript bundler for React Native. Open a **new terminal** and run:

```powershell
cd D:\Project\CodeBase\VouchFrontend

npx react-native start
```

Wait until you see:
```
Metro waiting on http://localhost:8081
```

> Keep this terminal open.

### Step 5 — Build and Install the App on the Emulator

Open **another new terminal** and run:

```powershell
cd D:\Project\CodeBase\VouchFrontend

npx react-native run-android
```

This compiles the Android app and installs it on the emulator. Takes **3-8 minutes** the first time (Gradle downloads build tools). Subsequent runs are much faster.

When successful, you will see:
```
BUILD SUCCESSFUL
info Launching "com.vouchmobile"...
```

The Vouch app will open automatically on the emulator.

---

## 6. RUNNING ON MULTIPLE EMULATORS

You can run the app on two emulators at the same time. This is useful for testing how two different users (e.g., a Startup and a Professional) interact.

### Step 1 — Launch Both Emulators

Open two separate PowerShell windows and run one command in each:

**Window 1:**
```powershell
$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe -avd Pixel_7_Pro
```

**Window 2:**
```powershell
$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe -avd Pixel_9_Pro_XL
```

Wait for both to boot fully.

### Step 2 — Check Both Are Detected

```powershell
adb devices
```

Expected output (two emulators):
```
List of devices attached
emulator-5554   device
emulator-5556   device
```

> The first emulator is always `emulator-5554`, the second is `emulator-5556`.

### Step 3 — Set Up Port Forwarding for Both

```powershell
adb -s emulator-5554 reverse tcp:8081 tcp:8081
adb -s emulator-5554 reverse tcp:5000 tcp:5000

adb -s emulator-5556 reverse tcp:8081 tcp:8081
adb -s emulator-5556 reverse tcp:5000 tcp:5000
```

### Step 4 — Start Metro (only once — it serves both)

```powershell
cd D:\Project\CodeBase\VouchFrontend
npx react-native start
```

### Step 5 — Install App on First Emulator

```powershell
cd D:\Project\CodeBase\VouchFrontend

npx react-native run-android --device emulator-5554
```

### Step 6 — Install App on Second Emulator

Open **another new terminal**:

```powershell
cd D:\Project\CodeBase\VouchFrontend

npx react-native run-android --device emulator-5556
```

> Both emulators will now run the same app but you can log in as different users on each — e.g., a Startup on one, a Professional on the other — and test the full flow end-to-end.

---

## 7. RUNNING ON A PHYSICAL ANDROID DEVICE

### Step 1 — Enable Developer Mode on Your Phone

1. Open **Settings** on your Android phone
2. Go to **About Phone**
3. Find **Build Number** and tap it **7 times** rapidly
4. You will see: *"You are now a developer!"*
5. Go back to **Settings** → **Developer Options**
6. Enable **USB Debugging**

### Step 2 — Connect Phone to PC via USB

Plug your phone into your PC with a USB cable.

On your phone, a popup will appear: **"Allow USB Debugging from this computer?"** — tap **Allow**.

### Step 3 — Verify Phone is Detected

```powershell
adb devices
```

Expected output:
```
List of devices attached
R3CX10XXXXX   device
```

> If it shows `unauthorized` instead of `device`, check your phone screen for the Allow USB Debugging popup and tap Allow again.

### Step 4 — Find Your PC's Local Network IP Address

Your phone needs to reach your PC's backend over Wi-Fi. First, find your PC's IP address:

```powershell
ipconfig
```

Look for **IPv4 Address** under your active Wi-Fi adapter. It looks like:
```
IPv4 Address. . . . . . . . . . . : 192.168.1.105
```

> Note this number — you will need it in the next step.

### Step 5 — Make Sure Phone and PC are on the Same Wi-Fi Network

Your phone and PC must be connected to **the same Wi-Fi router**. Check:
- PC: Connected to your home/office Wi-Fi
- Phone: Connected to the **same** Wi-Fi network

### Step 6 — Update the API URL in the App

Edit the file:
```
D:\Project\CodeBase\VouchFrontend\src\utils\constants.ts
```

Change it to use your PC's IP address:

```typescript
// const DEV_HOST = '10.0.2.2';          // ← Comment out the emulator line
const DEV_HOST = '192.168.1.105';         // ← Use YOUR PC's actual IP from Step 4
export const API_BASE_URL = `http://${DEV_HOST}:5000/api/v1`;
export const SOCKET_URL   = `http://${DEV_HOST}:5000`;
```

> **Important:** Every time you switch between emulator and physical device, you must change this one line back and forth.

### Step 7 — Allow Port 5000 Through Windows Firewall

By default, Windows Firewall may block incoming connections to your backend from the phone. Run this command as **Administrator**:

```powershell
# Open PowerShell as Administrator (right-click → Run as Administrator)
New-NetFirewallRule -DisplayName "Vouch Backend Port 5000" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

### Step 8 — Start Metro Bundler

```powershell
cd D:\Project\CodeBase\VouchFrontend
npx react-native start
```

### Step 9 — Build and Install on Physical Device

```powershell
cd D:\Project\CodeBase\VouchFrontend
npx react-native run-android
```

React Native will automatically detect your connected phone and install the app on it.

### Step 10 — Verify Connection

Open the Vouch app on your phone. Try to log in. If you see the login screen and can make API calls (register / login), everything is working.

> **If the app shows "Network Error":** Double-check that:
> - Your phone and PC are on the same Wi-Fi
> - The IP in `constants.ts` matches your PC's actual IP (`ipconfig`)
> - The firewall rule from Step 7 was applied

---

## 8. RUNNING ON iOS SIMULATOR (MAC ONLY)

> This section is only for macOS. iOS development is not possible on Windows.

### Step 1 — Install Xcode

1. Open the **Mac App Store**
2. Search for **Xcode** and install it (it's large — about 12 GB)
3. After installing, open Xcode once to accept the license agreement

### Step 2 — Install CocoaPods (iOS dependency manager)

```bash
sudo gem install cocoapods
```

### Step 3 — Install iOS Dependencies

```bash
cd /path/to/CodeBase/VouchFrontend
npm install

cd ios
pod install
cd ..
```

### Step 4 — Ensure Backend URL Uses Localhost

Edit `VouchFrontend/src/utils/constants.ts`:

```typescript
const DEV_HOST = 'localhost';   // iOS simulator can reach localhost directly
export const API_BASE_URL = `http://${DEV_HOST}:5000/api/v1`;
export const SOCKET_URL   = `http://${DEV_HOST}:5000`;
```

### Step 5 — Start Metro

```bash
cd /path/to/CodeBase/VouchFrontend
npx react-native start
```

### Step 6 — Run on iOS Simulator

```bash
cd /path/to/CodeBase/VouchFrontend
npx react-native run-ios
```

This opens the default iPhone simulator. To choose a specific device:

```bash
npx react-native run-ios --simulator "iPhone 15 Pro"
```

List all available simulators:
```bash
xcrun simctl list devices
```

---

## 9. SEEDING THE ADMIN ACCOUNT

The Admin user cannot register through the app — it is created via a one-time script.

### Step 1 — Make Sure Backend is Running

Follow Section 3 to start the backend first.

### Step 2 — Run the Seed Script

```powershell
cd D:\Project\CodeBase\VouchBackend

npm run seed:admin
```

**What this does:**
- Creates (or updates) an admin account in the database
- Uses the `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` values from your `.env` file
- Example: email `admin@vouch.com`, password `Admin@1234`

**Output you should see:**
```
[INFO] Admin account created: admin@vouch.com
```

> Run this script only **once**. If you run it again, it will just update the same admin account.

### Step 3 — Log in as Admin

Open the app → tap **Sign In** → enter the admin email and password from your `.env` file.

---

## 10. STOPPING EVERYTHING

### Stop Metro Bundler
Go to the terminal running Metro and press:
```
Ctrl + C
```

### Stop the Backend Server
Go to the terminal running `npm run dev` and press:
```
Ctrl + C
```

### Stop an Emulator
```powershell
# Stop emulator-5554
adb -s emulator-5554 emu kill

# Stop emulator-5556
adb -s emulator-5556 emu kill

# Stop ALL emulators at once
adb -s emulator-5554 emu kill ; adb -s emulator-5556 emu kill
```

Or simply close the emulator window.

---

## 11. COMMON ERRORS AND FIXES

### Error: "Metro bundler not running"
**Fix:**
```powershell
cd D:\Project\CodeBase\VouchFrontend
npx react-native start --reset-cache
```

---

### Error: "adb: command not found"
**Fix:** Add Android SDK platform-tools to PATH (see Section 1.3)

---

### Error: "JAVA_HOME is not set" or Gradle build fails
**Fix:**
```powershell
# Set JAVA_HOME (change the path to match your JDK installation)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:PATH += ";$env:JAVA_HOME\bin"
```

Or add these permanently via System Environment Variables.

---

### Error: "Network request failed" / "Network Error" in app
**This means the app cannot reach the backend. Check:**
1. Is the backend running? (`npm run dev` in VouchBackend — look for "listening on port 5000")
2. Is `10.0.2.2` correct in `constants.ts` for emulator?
3. Did you run `adb reverse tcp:5000 tcp:5000`?
4. For physical device: is `DEV_HOST` set to your PC's LAN IP?

---

### Error: "No emulators found" or "No devices/emulators found"
**Fix:**
```powershell
# Check if emulator is listed
adb devices

# If empty, launch an emulator first (see Section 5 Step 1)
# Then run adb devices again
```

---

### Error: "SDK location not found" during Gradle build
**Fix:** Create a file at `VouchFrontend/android/local.properties`:
```powershell
# Run in PowerShell:
New-Item -Path "D:\Project\CodeBase\VouchFrontend\android\local.properties" -ItemType File
```
Then add this line inside it (adjust path if your SDK is elsewhere):
```
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

---

### Error: "Port 8081 already in use"
**Fix:**
```powershell
# Find what is using port 8081
netstat -ano | findstr :8081

# Kill the process by its PID (replace 12345 with actual PID)
taskkill /PID 12345 /F
```

---

### Error: "MongoDB connection error" on backend start
**Fix:** 
- Check your `MONGODB_URI` in `.env` is correct
- Make sure your IP is whitelisted in MongoDB Atlas: go to Atlas → Network Access → Add IP Address → Add Current IP

---

### App installs but shows blank white screen
**Fix:** Shake the emulator (or press `Ctrl+M`) → tap **Reload**. Or:
```powershell
adb -s emulator-5554 shell am force-stop com.vouchmobile
# Then reopen the app
```

---

## 12. QUICK REFERENCE

### Full Startup Sequence (Copy-Paste Ready)

Open **3 separate terminal windows** and run one block in each:

**Terminal 1 — Backend:**
```powershell
cd D:\Project\CodeBase\VouchBackend
npm run dev
```

**Terminal 2 — Metro Bundler:**
```powershell
cd D:\Project\CodeBase\VouchFrontend
npx react-native start
```

**Terminal 3 — Launch Emulator + Install App:**
```powershell
# Launch emulator
$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe -avd Pixel_9_Pro_XL

# Wait for emulator to boot, then run:
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5000 tcp:5000
cd D:\Project\CodeBase\VouchFrontend
npx react-native run-android
```

---

### Switch Between Emulator and Physical Device

| Scenario | Change in `src/utils/constants.ts` |
|---|---|
| Android Emulator | `const DEV_HOST = '10.0.2.2';` |
| Physical Device (Wi-Fi) | `const DEV_HOST = '192.168.X.X';` ← your PC's IP |
| iOS Simulator | `const DEV_HOST = 'localhost';` |

File location:
```
D:\Project\CodeBase\VouchFrontend\src\utils\constants.ts
```

---

### All Useful ADB Commands

```powershell
# List all connected devices and emulators
adb devices

# Install APK manually on a specific device
adb -s emulator-5554 install app-debug.apk

# Set up port forwarding (must do every time after restarting emulator)
adb -s emulator-5554 reverse tcp:8081 tcp:8081
adb -s emulator-5554 reverse tcp:5000 tcp:5000

# Clear app data (like a fresh install, without uninstalling)
adb -s emulator-5554 shell pm clear com.vouchmobile

# Uninstall the app
adb -s emulator-5554 uninstall com.vouchmobile

# Kill a specific emulator
adb -s emulator-5554 emu kill

# Open app logs (for debugging)
adb -s emulator-5554 logcat --pid=$(adb -s emulator-5554 shell pidof com.vouchmobile)
```

---

### All Backend npm Scripts

```powershell
# Run in development mode (auto-restarts on file changes)
npm run dev

# Build TypeScript to JavaScript (production)
npm run build

# Run the built production version
npm run start

# Create/update the Admin user in the database
npm run seed:admin

# Run backend tests
npm run test
```

---

### All Frontend npm Scripts

```powershell
# Start the Metro JS bundler
npx react-native start

# Build and run on Android (auto-detects emulator/device)
npx react-native run-android

# Build and run on a specific device
npx react-native run-android --device emulator-5554

# Build and run on iOS
npx react-native run-ios

# Run tests
npm run test

# Run lint checks
npm run lint
```

---

*Document last updated: April 2026*
*Project: Vouch — BCA Major Project, Jamia Hamdard*

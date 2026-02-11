# Quick Build Commands - APK with Sound 🎵

## 📥 Download These Files First:
1. package.json (SDK 51 - with expo-av)
2. app.json (Updated)
3. eas.json (Build config)

---

## 💻 Run These Commands (Windows):

```bash
# 1. Navigate to project
cd D:\connectDots

# 2. Clean slate
rmdir /s /q node_modules
del package-lock.json
del yarn.lock

# 3. Install dependencies
npm install

# 4. Test locally (IMPORTANT!)
npx expo start
# Open Expo Go on phone
# Scan QR code
# Verify sound works!
# Press Ctrl+C to stop

# 5. Build APK
eas build --platform android --profile preview

# 6. Wait 10-15 minutes
# Download APK from link
# Install on phone
# Done! ✅
```

---

## 🐧 Mac/Linux Commands:

```bash
# 1. Navigate to project
cd ~/connectDots

# 2. Clean slate
rm -rf node_modules package-lock.json yarn.lock

# 3. Install dependencies
npm install

# 4. Test locally
npx expo start
# Verify in Expo Go

# 5. Build APK
eas build --platform android --profile preview
```

---

## ⚡ Super Quick (If Already Set Up):

```bash
cd D:\connectDots
npm install
eas build -p android --profile preview
```

---

## 🔧 If Build Fails:

```bash
# Clear cache and retry
eas build -p android --profile preview --clear-cache
```

---

## 📱 After Build Completes:

1. Click download link from terminal
2. Transfer APK to phone
3. Install
4. Test all sounds! 🔊

---

## ✅ Verify Sound Works:

In the game:
- Draw path that crosses = ❌ Error beep (low)
- Connect dots successfully = ✅ Success beep (mid)
- Complete puzzle = 🎊 Celebration beep (high)
- Complete level = 🏆 Victory beep (highest)

---

## 🎯 Exact Package Versions:

```
expo: ~51.0.28
expo-av: ~14.0.7
react: 18.2.0
react-native: 0.74.5
react-native-svg: 15.2.0
```

**Don't change these!** They work together perfectly.

---

**That's it!** Your game with sound will build successfully! 🎮🔊

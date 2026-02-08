# Color Dot Puzzle - Quick Start Guide 🎮

## What You're Building

A challenging logic puzzle game where you connect matching colored dots by drawing paths - but paths can't cross! Just like the popular Flow and Pipe puzzle games.

## ⚡ Super Fast Setup (5 minutes)

### Step 1: Install Node.js
https://nodejs.org/ - Download LTS version

### Step 2: Get Expo Go on Your Phone
- **iPhone**: https://apps.apple.com/app/expo-go/id982107779  
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent

### Step 3: Setup Project
```bash
# Go to your project folder
cd path/to/color-dot-puzzle

# Install everything
npm install

# Start the game
npm start
```

### Step 4: Play on Your Phone!
1. QR code appears in terminal
2. **iPhone**: Scan with Camera app
3. **Android**: Scan with Expo Go app
4. Game loads in seconds!

## 🎮 How to Play

1. **Tap a colored dot** and hold
2. **Drag your finger** to draw a path
3. **Connect to the matching colored dot**
4. **Rules**:
   - Move only horizontal/vertical (no diagonals)
   - Paths can't cross!
   - Connect ALL color pairs to win
5. **Next level** when you complete all connections

## 🎯 Game Features

- ✅ 4 challenging levels
- ⏱️ Real-time timer
- 💎 Score tracking
- 🎨 5 different colors
- 🌙 Dark modern UI
- 📊 Move counter
- 🔄 Reset anytime

## 📁 Files You Need

Just these 4 files in one folder:
- `App.js` - Main game code
- `package.json` - Dependencies
- `app.json` - Configuration  
- `babel.config.js` - Build config

## ⚙️ Customization Tips

### Add More Levels
Open `App.js` and find the `LEVELS` array:

```javascript
const LEVELS = [
  // Your level here
  {
    level: 5,
    dots: [
      { color: '#FF6B6B', start: {row: 0, col: 0}, end: {row: 5, col: 5} },
      // More colors...
    ]
  }
];
```

### Change Colors
Replace hex codes:
```javascript
{ color: '#FF6B6B' } // Red
{ color: '#00FF00' } // Green
{ color: '#0000FF' } // Blue
```

### Make Bigger Grid
```javascript
const GRID_SIZE = 8; // Was 6, now 8x8
```

## 🐛 Troubleshooting

**Can't draw paths?**
- Swipe slowly from one dot toward the other
- Stay on the grid (don't go too fast)

**Paths look weird?**
- Only horizontal/vertical moves work
- No diagonal connections allowed

**App won't start?**
```bash
npm start --reset-cache
```

**Expo Go can't connect?**
- Phone and computer on same WiFi
- Try tunnel mode: `npm start --tunnel`

## 🚀 Building Real App

When ready for app stores:
```bash
npm install -g eas-cli
eas build --platform android  # APK file
eas build --platform ios       # iOS app
```

## 💡 Pro Tips

- **Tap color dots** at bottom to clear that path
- **Reset button** starts level over
- **Plan ahead** - some levels need strategic thinking!
- **No time limit** - take your time to solve

## 📱 Test on Device vs Simulator

**Best experience**: Real device with Expo Go (touch controls feel natural)
**For development**: Android Studio / Xcode simulators work too

---

**Ready to challenge your brain?** Install and play! 🧩🎯

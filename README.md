# Color Dot Puzzle Game 🎮

A challenging logic puzzle game for Android and iOS where you connect matching colored dots without crossing paths! Built with React Native and Expo.

## 🎯 Game Features

### Core Gameplay
- **Color Matching**: Connect dots of the same color by drawing paths between them
- **Logic Puzzle**: Paths cannot cross each other - plan your moves carefully!
- **Progressive Difficulty**: 4 levels with increasing complexity
- **Real-time Timer**: Track how fast you can solve each puzzle
- **Move Counter**: Monitor your efficiency
- **Score System**: Earn points for completing levels

### UI Features
- 🌙 **Dark Modern Theme**: Sleek dark UI matching popular puzzle games
- ⏱️ **Live Timer**: Real-time countdown for each level
- 💎 **Score Tracking**: Points and statistics display
- ✓ **Visual Feedback**: Dots show completion status
- 🎨 **Smooth Animations**: Fluid path drawing and interactions
- 📊 **Progress Indicators**: See which colors you've connected

## 📱 Screenshots

The game features:
- Clean dark interface (#1A1A2E background)
- Colorful dots (red, cyan, yellow, light blue, mint)
- Smooth curved line drawing
- Grid-based gameplay
- Completion celebrations

## 🎮 How to Play

1. **Start at a colored dot** - Tap and hold any colored dot
2. **Drag to connect** - Draw a path to the matching colored dot
3. **Follow the rules**:
   - Paths can only move horizontally or vertically (no diagonals)
   - Paths cannot cross other colored paths
   - Each color must connect its two dots
4. **Complete the puzzle** - Connect all color pairs to win!
5. **Move to next level** - Progress through increasingly difficult puzzles

## 🚀 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm start
```

3. **Run on your device:**
   - Scan the QR code with Expo Go (Android)
   - Scan with Camera app (iOS)

### Platform-Specific Commands

```bash
# Run on Android emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Run in web browser
npm run web
```

## 🏗️ Project Structure

```
color-dot-puzzle/
├── ColorDotGame.js      # Main game component with all logic
├── package.json         # Dependencies
├── app.json            # Expo configuration
├── babel.config.js     # Babel configuration
└── README.md           # This file
```

## 🎨 Customization

### Adding New Levels

Edit the `LEVELS` array in `ColorDotGame.js`:

```javascript
const LEVELS = [
  {
    level: 5, // New level number
    dots: [
      { 
        color: '#FF6B6B',          // Color code
        start: { row: 0, col: 0 }, // Starting position
        end: { row: 5, col: 5 }    // Ending position
      },
      // Add more color pairs...
    ],
  },
];
```

### Grid Size

Change the grid dimensions:

```javascript
const GRID_SIZE = 6; // Change to 8, 10, etc.
```

### Color Scheme

Update the color palette in styles:

```javascript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E', // Main background
  },
  header: {
    backgroundColor: '#16213E', // Header background
  },
  // ... more colors
});
```

### Dot Colors

Use any hex colors for the dots:

```javascript
{ color: '#FF6B6B' }, // Red
{ color: '#4ECDC4' }, // Cyan
{ color: '#FFE66D' }, // Yellow
{ color: '#A8DADC' }, // Light blue
{ color: '#95E1D3' }, // Mint green
// Add your own!
```

## 🎯 Game Mechanics

### Path Drawing System
- **Touch Detection**: Responds to pan gestures
- **Grid Snapping**: Automatically aligns to grid cells
- **Adjacency Check**: Only allows moves to adjacent cells
- **Collision Detection**: Prevents crossing other paths
- **Completion Detection**: Automatically checks when all pairs are connected

### Scoring
- Base score starts at 1234
- +100 points per level completed
- Move counter tracks efficiency
- Timer tracks speed

## 🐛 Troubleshooting

### Common Issues

**Paths not drawing smoothly:**
- Make sure you're dragging continuously without lifting your finger
- Paths only connect to adjacent cells (horizontal/vertical)

**Can't complete level:**
- Remember: paths cannot cross!
- Try clearing a path (tap the color indicator) and redraw it
- Use the Reset button to start fresh

**Performance issues:**
- Clear app cache: `expo start -c`
- Reduce grid size for older devices
- Ensure you're running the latest Expo version

## 📦 Building for Production

### Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure and build
eas build --platform android
```

### iOS App

```bash
# Build for iOS (requires Apple Developer account)
eas build --platform ios
```

See [Expo build documentation](https://docs.expo.dev/build/introduction/) for details.

## 🔧 Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build platform
- **react-native-svg** - SVG rendering for paths and dots
- **PanResponder** - Touch gesture handling
- **JavaScript/ES6+** - Programming language

## 🎓 Learning Resources

This game demonstrates:
- Touch gesture handling with PanResponder
- SVG path rendering in React Native
- Grid-based coordinate systems
- Game state management
- Collision detection algorithms
- Path finding logic

## 🚀 Future Enhancements

Ideas for expansion:
- [ ] More levels (10, 20, 50+)
- [ ] Different grid sizes (7x7, 8x8, 10x10)
- [ ] Hint system
- [ ] Undo/redo functionality
- [ ] Daily challenges
- [ ] Leaderboards
- [ ] Sound effects
- [ ] Haptic feedback
- [ ] Different game modes (time attack, limited moves)
- [ ] Level editor
- [ ] Share screenshots

## 📄 License

Open source - free to use and modify for learning purposes.

## 🙋 Support

For issues:
- Check [Expo documentation](https://docs.expo.dev/)
- Visit [React Native docs](https://reactnative.dev/)

## 🎉 Credits

Inspired by popular flow/pipe puzzle games. Created with React Native and Expo for educational purposes.

---

**Enjoy the challenge!** 🧩🎯

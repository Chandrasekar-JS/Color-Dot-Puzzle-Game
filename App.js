import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Vibration,
} from 'react-native';
import Svg, { Circle, Path, Line, G } from 'react-native-svg';
import { Audio } from 'expo-av';

const { width: screenWidth } = Dimensions.get('window');
const GRID_SIZE = 6;
const DOT_RADIUS = 12;
const PADDING = 20;
const CANVAS_WIDTH = screenWidth - (PADDING * 2);
const CELL_SIZE = CANVAS_WIDTH / GRID_SIZE;

// Darker, more distinct colors
const COLORS = {
  RED: '#CC2936',
  CYAN: '#2A9D8F',
  YELLOW: '#E9C46A',
  BLUE: '#264653',
  PURPLE: '#7209B7',
  ORANGE: '#F77F00',
  GREEN: '#06A77D',
  PINK: '#D81159',
};

// Level configurations - 5 puzzles per level
const LEVELS = [
  {
    level: 1,
    puzzles: [
      {
        puzzle: 1,
        dots: [
          { color: COLORS.RED, start: { row: 1, col: 1 }, end: { row: 4, col: 4 } },
          { color: COLORS.CYAN, start: { row: 1, col: 4 }, end: { row: 4, col: 1 } },
        ],
      },
      {
        puzzle: 2,
        dots: [
          { color: COLORS.RED, start: { row: 0, col: 0 }, end: { row: 5, col: 5 } },
          { color: COLORS.PURPLE, start: { row: 0, col: 5 }, end: { row: 5, col: 0 } },
        ],
      },
      {
        puzzle: 3,
        dots: [
          { color: COLORS.ORANGE, start: { row: 2, col: 0 }, end: { row: 2, col: 5 } },
          { color: COLORS.GREEN, start: { row: 0, col: 2 }, end: { row: 5, col: 2 } },
        ],
      },
      {
        puzzle: 4,
        dots: [
          { color: COLORS.BLUE, start: { row: 1, col: 1 }, end: { row: 4, col: 4 } },
          { color: COLORS.PINK, start: { row: 4, col: 1 }, end: { row: 1, col: 4 } },
        ],
      },
      {
        puzzle: 5,
        dots: [
          { color: COLORS.CYAN, start: { row: 0, col: 1 }, end: { row: 5, col: 4 } },
          { color: COLORS.YELLOW, start: { row: 0, col: 4 }, end: { row: 5, col: 1 } },
        ],
      },
    ],
  },
  {
    level: 2,
    puzzles: [
      {
        puzzle: 1,
        dots: [
          { color: COLORS.RED, start: { row: 0, col: 0 }, end: { row: 5, col: 5 } },
          { color: COLORS.CYAN, start: { row: 0, col: 5 }, end: { row: 5, col: 0 } },
          { color: COLORS.YELLOW, start: { row: 2, col: 2 }, end: { row: 3, col: 3 } },
        ],
      },
      {
        puzzle: 2,
        dots: [
          { color: COLORS.PURPLE, start: { row: 1, col: 0 }, end: { row: 4, col: 5 } },
          { color: COLORS.GREEN, start: { row: 0, col: 2 }, end: { row: 5, col: 3 } },
          { color: COLORS.ORANGE, start: { row: 2, col: 1 }, end: { row: 3, col: 4 } },
        ],
      },
      {
        puzzle: 3,
        dots: [
          { color: COLORS.BLUE, start: { row: 0, col: 1 }, end: { row: 5, col: 4 } },
          { color: COLORS.PINK, start: { row: 1, col: 0 }, end: { row: 4, col: 5 } },
          { color: COLORS.RED, start: { row: 2, col: 2 }, end: { row: 3, col: 3 } },
        ],
      },
      {
        puzzle: 4,
        dots: [
          { color: COLORS.CYAN, start: { row: 0, col: 0 }, end: { row: 3, col: 3 } },
          { color: COLORS.YELLOW, start: { row: 2, col: 5 }, end: { row: 5, col: 2 } },
          { color: COLORS.ORANGE, start: { row: 5, col: 0 }, end: { row: 0, col: 5 } },
        ],
      },
      {
        puzzle: 5,
        dots: [
          { color: COLORS.GREEN, start: { row: 1, col: 1 }, end: { row: 4, col: 4 } },
          { color: COLORS.PURPLE, start: { row: 0, col: 3 }, end: { row: 5, col: 2 } },
          { color: COLORS.BLUE, start: { row: 3, col: 0 }, end: { row: 2, col: 5 } },
        ],
      },
    ],
  },
  {
    level: 3,
    puzzles: [
      {
        puzzle: 1,
        dots: [
          { color: COLORS.RED, start: { row: 0, col: 2 }, end: { row: 5, col: 2 } },
          { color: COLORS.CYAN, start: { row: 0, col: 0 }, end: { row: 2, col: 4 } },
          { color: COLORS.YELLOW, start: { row: 3, col: 1 }, end: { row: 5, col: 5 } },
          { color: COLORS.BLUE, start: { row: 2, col: 0 }, end: { row: 5, col: 3 } },
        ],
      },
      {
        puzzle: 2,
        dots: [
          { color: COLORS.PURPLE, start: { row: 0, col: 1 }, end: { row: 5, col: 4 } },
          { color: COLORS.GREEN, start: { row: 1, col: 0 }, end: { row: 4, col: 5 } },
          { color: COLORS.ORANGE, start: { row: 0, col: 3 }, end: { row: 3, col: 0 } },
          { color: COLORS.PINK, start: { row: 2, col: 5 }, end: { row: 5, col: 2 } },
        ],
      },
      {
        puzzle: 3,
        dots: [
          { color: COLORS.RED, start: { row: 0, col: 0 }, end: { row: 5, col: 5 } },
          { color: COLORS.CYAN, start: { row: 0, col: 5 }, end: { row: 5, col: 0 } },
          { color: COLORS.YELLOW, start: { row: 1, col: 2 }, end: { row: 4, col: 3 } },
          { color: COLORS.BLUE, start: { row: 2, col: 1 }, end: { row: 3, col: 4 } },
        ],
      },
      {
        puzzle: 4,
        dots: [
          { color: COLORS.PURPLE, start: { row: 0, col: 2 }, end: { row: 3, col: 5 } },
          { color: COLORS.GREEN, start: { row: 2, col: 0 }, end: { row: 5, col: 3 } },
          { color: COLORS.ORANGE, start: { row: 1, col: 1 }, end: { row: 4, col: 4 } },
          { color: COLORS.PINK, start: { row: 3, col: 0 }, end: { row: 0, col: 3 } },
        ],
      },
      {
        puzzle: 5,
        dots: [
          { color: COLORS.RED, start: { row: 1, col: 0 }, end: { row: 4, col: 5 } },
          { color: COLORS.CYAN, start: { row: 0, col: 1 }, end: { row: 5, col: 4 } },
          { color: COLORS.YELLOW, start: { row: 2, col: 2 }, end: { row: 3, col: 3 } },
          { color: COLORS.BLUE, start: { row: 0, col: 4 }, end: { row: 5, col: 1 } },
        ],
      },
    ],
  },
  {
    level: 4,
    puzzles: [
      {
        puzzle: 1,
        dots: [
          { color: COLORS.RED, start: { row: 1, col: 0 }, end: { row: 4, col: 5 } },
          { color: COLORS.CYAN, start: { row: 0, col: 1 }, end: { row: 5, col: 4 } },
          { color: COLORS.YELLOW, start: { row: 0, col: 3 }, end: { row: 3, col: 0 } },
          { color: COLORS.BLUE, start: { row: 2, col: 5 }, end: { row: 5, col: 2 } },
          { color: COLORS.PURPLE, start: { row: 3, col: 3 }, end: { row: 5, col: 5 } },
        ],
      },
      {
        puzzle: 2,
        dots: [
          { color: COLORS.GREEN, start: { row: 0, col: 0 }, end: { row: 5, col: 5 } },
          { color: COLORS.ORANGE, start: { row: 0, col: 5 }, end: { row: 5, col: 0 } },
          { color: COLORS.PINK, start: { row: 1, col: 2 }, end: { row: 4, col: 3 } },
          { color: COLORS.RED, start: { row: 2, col: 1 }, end: { row: 3, col: 4 } },
          { color: COLORS.PURPLE, start: { row: 0, col: 2 }, end: { row: 5, col: 3 } },
        ],
      },
      {
        puzzle: 3,
        dots: [
          { color: COLORS.CYAN, start: { row: 0, col: 1 }, end: { row: 3, col: 4 } },
          { color: COLORS.YELLOW, start: { row: 1, col: 0 }, end: { row: 4, col: 5 } },
          { color: COLORS.BLUE, start: { row: 2, col: 0 }, end: { row: 5, col: 3 } },
          { color: COLORS.GREEN, start: { row: 0, col: 4 }, end: { row: 5, col: 1 } },
          { color: COLORS.ORANGE, start: { row: 2, col: 2 }, end: { row: 4, col: 4 } },
        ],
      },
      {
        puzzle: 4,
        dots: [
          { color: COLORS.PINK, start: { row: 0, col: 0 }, end: { row: 5, col: 5 } },
          { color: COLORS.RED, start: { row: 1, col: 1 }, end: { row: 4, col: 4 } },
          { color: COLORS.PURPLE, start: { row: 0, col: 3 }, end: { row: 3, col: 0 } },
          { color: COLORS.CYAN, start: { row: 3, col: 5 }, end: { row: 5, col: 3 } },
          { color: COLORS.YELLOW, start: { row: 2, col: 1 }, end: { row: 1, col: 4 } },
        ],
      },
      {
        puzzle: 5,
        dots: [
          { color: COLORS.BLUE, start: { row: 0, col: 2 }, end: { row: 5, col: 2 } },
          { color: COLORS.GREEN, start: { row: 2, col: 0 }, end: { row: 2, col: 5 } },
          { color: COLORS.ORANGE, start: { row: 0, col: 0 }, end: { row: 5, col: 5 } },
          { color: COLORS.PINK, start: { row: 0, col: 5 }, end: { row: 5, col: 0 } },
          { color: COLORS.RED, start: { row: 1, col: 3 }, end: { row: 4, col: 1 } },
        ],
      },
    ],
  },
];

const ColorDotGame = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [dots, setDots] = useState(LEVELS[0].puzzles[0].dots);
  const [paths, setPaths] = useState({});
  const [activePath, setActivePath] = useState(null);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(1234);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [totalMoves, setTotalMoves] = useState(0);
  const timerRef = useRef(null);
  const soundRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    // Setup audio
    setupAudio();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [currentLevel]);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.log('Audio setup error:', error);
    }
  };

  const playHaptic = (type) => {
    // Vibration feedback
    const patterns = {
      cross: [50],           
      connect: [30],         
      puzzle: [50, 50, 50],  
      level: [100, 50, 100], 
    };
    
    try {
      Vibration.vibrate(patterns[type] || [50]);
    } catch (error) {
      console.log('Vibration not supported');
    }
  };

  const playSound = async (type) => {
    // Play both vibration AND sound
    playHaptic(type);
    
    try {
      // Create and play sound
      const soundObject = new Audio.Sound();
      
      // Different frequencies for different events
      const frequencies = {
        cross: '200',      // Low beep
        connect: '600',    // Mid beep
        puzzle: '800',     // High beep
        level: '1000',     // Highest beep
      };
      
      const freq = frequencies[type] || '440';
      
      // Simple beep sound using data URI
      await soundObject.loadAsync({
        uri: `data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=`
      });
      
      await soundObject.playAsync();
      
      // Cleanup after playing
      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          soundObject.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Sound playback error:', error);
      // If sound fails, at least vibration will work
    }
  };

  useEffect(() => {
    checkCompletion();
  }, [paths]);

  const gridToScreen = (row, col) => {
    return {
      x: col * CELL_SIZE + CELL_SIZE / 2,
      y: row * CELL_SIZE + CELL_SIZE / 2,
    };
  };

  const distance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const findDotAtPosition = (x, y) => {
    for (const dot of dots) {
      const startPos = gridToScreen(dot.start.row, dot.start.col);
      const endPos = gridToScreen(dot.end.row, dot.end.col);
      
      if (distance({x, y}, startPos) < DOT_RADIUS * 2) {
        return { dot, position: 'start', pos: startPos };
      }
      if (distance({x, y}, endPos) < DOT_RADIUS * 2) {
        return { dot, position: 'end', pos: endPos };
      }
    }
    return null;
  };

  const pathsIntersect = (path1, path2) => {
    if (!path1 || !path2 || path1.length < 2 || path2.length < 2) return false;
    
    for (let i = 0; i < path1.length - 1; i++) {
      for (let j = 0; j < path2.length - 1; j++) {
        if (lineSegmentsIntersect(
          path1[i], path1[i + 1],
          path2[j], path2[j + 1]
        )) {
          return true;
        }
      }
    }
    return false;
  };

  const lineSegmentsIntersect = (p1, p2, p3, p4) => {
    const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y);
    if (det === 0) return false;
    
    const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
    const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;
    
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  };

  const handleTouchStart = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const dotInfo = findDotAtPosition(locationX, locationY);
    
    if (dotInfo) {
      setActivePath({
        color: dotInfo.dot.color,
        points: [{ x: dotInfo.pos.x, y: dotInfo.pos.y }],
        startDot: dotInfo.dot,
        startPosition: dotInfo.position,
      });
      setMoves((prev) => prev + 1);
    }
  };

  const handleTouchMove = (event) => {
    if (!activePath) return;

    const { locationX, locationY } = event.nativeEvent;
    
    // TRUE FREE-FLOW - No constraints, no threshold!
    // Just add every touch point directly
    setActivePath({
      ...activePath,
      points: [...activePath.points, { x: locationX, y: locationY }],
    });
  };

  const handleTouchEnd = (event) => {
    if (!activePath) return;

    const { locationX, locationY } = event.nativeEvent;
    const dotInfo = findDotAtPosition(locationX, locationY);
    
    if (dotInfo && dotInfo.dot.color === activePath.color) {
      const isValidEnd = (
        (activePath.startPosition === 'start' && dotInfo.position === 'end') ||
        (activePath.startPosition === 'end' && dotInfo.position === 'start')
      );
      
      if (isValidEnd) {
        const finalPath = [...activePath.points, dotInfo.pos];
        
        let intersects = false;
        for (const [color, path] of Object.entries(paths)) {
          if (color !== activePath.color && pathsIntersect(finalPath, path)) {
            intersects = true;
            break;
          }
        }
        
        if (!intersects) {
          playSound('connect'); // Success sound + vibration
          setPaths({
            ...paths,
            [activePath.color]: finalPath,
          });
        } else {
          playSound('cross'); // Error sound + vibration
        }
      }
    }
    
    setActivePath(null);
  };

  const checkCompletion = () => {
    if (Object.keys(paths).length === dots.length) {
      const pathArray = Object.values(paths);
      let allValid = true;
      
      for (let i = 0; i < pathArray.length; i++) {
        for (let j = i + 1; j < pathArray.length; j++) {
          if (pathsIntersect(pathArray[i], pathArray[j])) {
            allValid = false;
            break;
          }
        }
        if (!allValid) break;
      }
      
      if (allValid) {
        setIsComplete(true);
        setTotalMoves(totalMoves + moves);
        playSound('puzzle'); // Puzzle complete sound + vibration
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  const nextPuzzle = () => {
    const currentLevelData = LEVELS[currentLevel];
    
    if (currentPuzzle < currentLevelData.puzzles.length - 1) {
      const nextPuzzleIndex = currentPuzzle + 1;
      setCurrentPuzzle(nextPuzzleIndex);
      setDots(currentLevelData.puzzles[nextPuzzleIndex].dots);
      setPaths({});
      setActivePath(null);
      setMoves(0);
      setIsComplete(false);
      setScore((prev) => prev + 50);
    } else if (currentLevel < LEVELS.length - 1) {
      playSound('level'); // Level complete sound + vibration
      const nextLvl = currentLevel + 1;
      setCurrentLevel(nextLvl);
      setCurrentPuzzle(0);
      setDots(LEVELS[nextLvl].puzzles[0].dots);
      setPaths({});
      setActivePath(null);
      setTimer(0);
      setMoves(0);
      setIsComplete(false);
      setScore((prev) => prev + 100);
    } else {
      playSound('level');
      setGameComplete(true);
      setIsComplete(false);
    }
  };

  const showHintPath = () => {
    setShowHint(true);
    setTimeout(() => setShowHint(false), 3000);
  };

  const getIQLevel = () => {
    const totalPuzzles = 20;
    const avgMovesPerPuzzle = totalMoves / totalPuzzles;
    
    if (avgMovesPerPuzzle <= 3) return { level: 'Genius', score: 150, emoji: '🧠' };
    if (avgMovesPerPuzzle <= 5) return { level: 'Brilliant', score: 130, emoji: '⭐' };
    if (avgMovesPerPuzzle <= 8) return { level: 'Smart', score: 115, emoji: '💡' };
    if (avgMovesPerPuzzle <= 12) return { level: 'Good', score: 100, emoji: '👍' };
    return { level: 'Keep Practicing!', score: 85, emoji: '📚' };
  };

  const restartGame = () => {
    setCurrentLevel(0);
    setCurrentPuzzle(0);
    setDots(LEVELS[0].puzzles[0].dots);
    setPaths({});
    setActivePath(null);
    setTimer(0);
    setScore(1234);
    setMoves(0);
    setTotalMoves(0);
    setIsComplete(false);
    setGameComplete(false);
    setShowInstructions(true);
  };

  const resetLevel = () => {
    setPaths({});
    setActivePath(null);
    setTimer(0);
    setMoves(0);
    setIsComplete(false);
  };

  const clearPath = (color) => {
    const newPaths = { ...paths };
    delete newPaths[color];
    setPaths(newPaths);
  };

  const closeLevelComplete = () => {
    setIsComplete(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPath = (points, color, isActive = false) => {
    if (!points || points.length < 2) return null;

    let pathString = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathString += ` L ${points[i].x} ${points[i].y}`;
    }

    return (
      <Path
        key={color}
        d={pathString}
        stroke={color}
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isActive ? 0.7 : 1}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statText}>{score}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statText}>{moves}</Text>
          </View>
        </View>

        <View style={styles.levelContainer}>
          <Text style={styles.levelLabel}>LEVEL {LEVELS[currentLevel].level}</Text>
          <Text style={styles.puzzleProgress}>Puzzle {currentPuzzle + 1}/5</Text>
          <Text style={styles.timer}>{formatTime(timer)} ⏱</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statText}>150</Text>
          </View>
        </View>
      </View>

      {/* Game Board */}
      <View style={styles.gameContainer}>
        <View
          style={styles.svgContainer}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleTouchStart}
          onResponderMove={handleTouchMove}
          onResponderRelease={handleTouchEnd}
        >
          <Svg
            width={CANVAS_WIDTH}
            height={CANVAS_WIDTH}
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_WIDTH}`}
          >
            {/* Grid lines */}
            {[...Array(GRID_SIZE + 1)].map((_, i) => (
              <React.Fragment key={`grid-${i}`}>
                <Line
                  x1={0}
                  y1={i * CELL_SIZE}
                  x2={CANVAS_WIDTH}
                  y2={i * CELL_SIZE}
                  stroke="#2A2A3E"
                  strokeWidth={0.5}
                />
                <Line
                  x1={i * CELL_SIZE}
                  y1={0}
                  x2={i * CELL_SIZE}
                  y2={CANVAS_WIDTH}
                  stroke="#2A2A3E"
                  strokeWidth={0.5}
                />
              </React.Fragment>
            ))}

            {/* Draw completed paths */}
            {Object.entries(paths).map(([color, points]) => renderPath(points, color))}

            {/* Draw active path */}
            {activePath && renderPath(activePath.points, activePath.color, true)}
            
            {/* Draw hint */}
            {showHint && dots.filter(dot => !paths[dot.color]).length > 0 && (() => {
              const unconnectedDot = dots.find(dot => !paths[dot.color]);
              const startPos = gridToScreen(unconnectedDot.start.row, unconnectedDot.start.col);
              const endPos = gridToScreen(unconnectedDot.end.row, unconnectedDot.end.col);
              return (
                <G opacity={0.5}>
                  <Line
                    x1={startPos.x}
                    y1={startPos.y}
                    x2={endPos.x}
                    y2={endPos.y}
                    stroke={unconnectedDot.color}
                    strokeWidth={8}
                    strokeDasharray="10,10"
                    strokeLinecap="round"
                  />
                  <Circle
                    cx={startPos.x}
                    cy={startPos.y}
                    r={DOT_RADIUS + 5}
                    stroke={unconnectedDot.color}
                    strokeWidth={2}
                    fill="none"
                  />
                  <Circle
                    cx={endPos.x}
                    cy={endPos.y}
                    r={DOT_RADIUS + 5}
                    stroke={unconnectedDot.color}
                    strokeWidth={2}
                    fill="none"
                  />
                </G>
              );
            })()}

            {/* Draw dots */}
            {dots.map((dot, index) => {
              const startPos = gridToScreen(dot.start.row, dot.start.col);
              const endPos = gridToScreen(dot.end.row, dot.end.col);

              return (
                <G key={`dot-${index}`}>
                  <Circle
                    cx={startPos.x}
                    cy={startPos.y}
                    r={DOT_RADIUS}
                    fill={dot.color}
                    stroke="#1A1A2E"
                    strokeWidth={3}
                  />
                  <Circle
                    cx={endPos.x}
                    cy={endPos.y}
                    r={DOT_RADIUS}
                    fill={dot.color}
                    stroke="#1A1A2E"
                    strokeWidth={3}
                  />
                </G>
              );
            })}
          </Svg>
        </View>
        
        {/* Next Button - Visible on screen when complete */}
        {isComplete && (
          <TouchableOpacity 
            style={styles.nextButtonFloat}
            onPress={nextPuzzle}
          >
            <Text style={styles.nextButtonFloatText}>
              {currentPuzzle < 4 ? 'Next Puzzle →' : 'Next Level →'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Color indicators */}
      <View style={styles.colorIndicators}>
        {dots.map((dot, index) => {
          const isConnected = paths[dot.color] !== undefined;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.colorDot,
                { backgroundColor: dot.color },
                isConnected && styles.colorDotConnected,
              ]}
              onPress={() => clearPath(dot.color)}
            >
              {isConnected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Control buttons */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setShowInstructions(true)}
        >
          <Text style={styles.controlButtonText}>❓ Help</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={showHintPath}
        >
          <Text style={styles.controlButtonText}>💡 Hint</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={resetLevel}>
          <Text style={styles.controlButtonText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Completion overlay */}
      {isComplete && (
        <View style={styles.completionOverlay}>
          <View style={styles.completionCard}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeLevelComplete}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>Puzzle Complete!</Text>
            <Text style={styles.completionStats}>
              Time: {formatTime(timer)} | Moves: {moves}
            </Text>
            <TouchableOpacity style={styles.nextButton} onPress={nextPuzzle}>
              <Text style={styles.nextButtonText}>
                {currentPuzzle < 4 ? 'Next Puzzle →' : 'Next Level →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Instructions overlay */}
      {showInstructions && (
        <View style={styles.instructionsOverlay}>
          <View style={styles.instructionsCard}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowInstructions(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.instructionsTitle}>🎮 How to Play</Text>
            
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1️⃣</Text>
              <Text style={styles.instructionText}>
                Touch and hold a colored dot
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2️⃣</Text>
              <Text style={styles.instructionText}>
                Drag your finger to draw a path
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3️⃣</Text>
              <Text style={styles.instructionText}>
                Release on the matching colored dot
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4️⃣</Text>
              <Text style={styles.instructionText}>
                Connect all dots without crossing paths!
              </Text>
            </View>
            
            <View style={styles.instructionTip}>
              <Text style={styles.instructionTipIcon}>💡</Text>
              <Text style={styles.instructionTipText}>
                Tap a colored circle at the bottom to clear that path. You'll feel vibrations for feedback!
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => setShowInstructions(false)}
            >
              <Text style={styles.startButtonText}>Let's Play! 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Game Complete Screen */}
      {gameComplete && (
        <View style={styles.gameCompleteOverlay}>
          <View style={styles.gameCompleteCard}>
            <Text style={styles.gameCompleteEmoji}>🎊</Text>
            <Text style={styles.gameCompleteTitle}>Game Complete!</Text>
            <Text style={styles.gameCompleteSubtitle}>All 20 Puzzles Solved!</Text>
            
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Moves:</Text>
                <Text style={styles.summaryValue}>{totalMoves}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Final Score:</Text>
                <Text style={styles.summaryValue}>{score}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Time:</Text>
                <Text style={styles.summaryValue}>{formatTime(timer)}</Text>
              </View>
            </View>
            
            <View style={styles.iqContainer}>
              <Text style={styles.iqEmoji}>{getIQLevel().emoji}</Text>
              <Text style={styles.iqLabel}>Your IQ Level</Text>
              <Text style={styles.iqLevel}>{getIQLevel().level}</Text>
              <Text style={styles.iqScore}>Score: {getIQLevel().score}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.playAgainButton}
              onPress={restartGame}
            >
              <Text style={styles.playAgainButtonText}>Play Again 🔄</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#16213E',
    borderBottomWidth: 2,
    borderBottomColor: '#0F3460',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F3460',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 5,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    color: '#FFE66D',
    fontSize: 14,
    fontWeight: '700',
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelLabel: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  puzzleProgress: {
    color: '#FFE66D',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  timer: {
    color: '#A8DADC',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: PADDING,
    position: 'relative',
  },
  svgContainer: {
    backgroundColor: '#16213E',
    borderRadius: 20,
    overflow: 'hidden',
  },
  nextButtonFloat: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFE66D',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonFloatText: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '700',
  },
  colorIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#2A2A3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorDotConnected: {
    borderColor: '#4ECDC4',
  },
  checkmark: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 15,
    flexWrap: 'wrap',
  },
  controlButton: {
    backgroundColor: '#0F3460',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  controlButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
  },
  completionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionCard: {
    backgroundColor: '#16213E',
    padding: 40,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  completionEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFE66D',
    marginBottom: 15,
  },
  completionStats: {
    fontSize: 16,
    color: '#A8DADC',
    marginBottom: 30,
  },
  nextButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  nextButtonText: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#2A2A3E',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#A8DADC',
    fontSize: 20,
    fontWeight: '700',
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  instructionsCard: {
    backgroundColor: '#16213E',
    padding: 30,
    paddingTop: 50,
    borderRadius: 25,
    width: '85%',
    maxWidth: 400,
    borderWidth: 3,
    borderColor: '#4ECDC4',
  },
  instructionsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4ECDC4',
    textAlign: 'center',
    marginBottom: 25,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    paddingLeft: 10,
  },
  instructionNumber: {
    fontSize: 20,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 22,
  },
  instructionTip: {
    flexDirection: 'row',
    backgroundColor: '#0F3460',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 25,
  },
  instructionTipIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  instructionTipText: {
    flex: 1,
    fontSize: 14,
    color: '#FFE66D',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '700',
  },
  gameCompleteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  gameCompleteCard: {
    backgroundColor: '#16213E',
    padding: 30,
    borderRadius: 25,
    width: '90%',
    maxWidth: 400,
    borderWidth: 3,
    borderColor: '#FFE66D',
    alignItems: 'center',
  },
  gameCompleteEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  gameCompleteTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFE66D',
    marginBottom: 5,
  },
  gameCompleteSubtitle: {
    fontSize: 16,
    color: '#A8DADC',
    marginBottom: 25,
  },
  summaryContainer: {
    width: '100%',
    backgroundColor: '#0F3460',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#A8DADC',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '700',
  },
  iqContainer: {
    alignItems: 'center',
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#1A1A2E',
    borderRadius: 15,
    width: '100%',
  },
  iqEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  iqLabel: {
    fontSize: 14,
    color: '#A8DADC',
    marginBottom: 5,
  },
  iqLevel: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFE66D',
    marginBottom: 5,
  },
  iqScore: {
    fontSize: 18,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  playAgainButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  playAgainButtonText: {
    color: '#1A1A2E',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ColorDotGame;

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import Svg, { Circle, Path, Line, G } from 'react-native-svg';
import { Audio } from 'expo-av';

const { width: screenWidth } = Dimensions.get('window');
const GRID_SIZE = 6;
const DOT_RADIUS = 12; // Made smaller
const PADDING = 20;
const CANVAS_WIDTH = screenWidth - (PADDING * 2);
const CELL_SIZE = CANVAS_WIDTH / GRID_SIZE;

// Darker, more distinct colors
const COLORS = {
  RED: '#CC2936',      // Dark red
  CYAN: '#2A9D8F',     // Dark teal
  YELLOW: '#E9C46A',   // Muted yellow
  BLUE: '#264653',     // Dark navy blue
  PURPLE: '#7209B7',   // Deep purple
  ORANGE: '#F77F00',   // Dark orange
  GREEN: '#06A77D',    // Dark green
  PINK: '#D81159',     // Deep pink
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef(null);
  const soundsRef = useRef({});

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentLevel]);

  useEffect(() => {
    checkCompletion();
  }, [paths]);

  // Load sounds
  useEffect(() => {
    loadSounds();
    return () => {
      // Cleanup sounds
      Object.values(soundsRef.current).forEach(sound => {
        if (sound) sound.unloadAsync();
      });
    };
  }, []);

  const loadSounds = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      // Sounds will be generated programmatically using Web Audio API
      // For now, we'll use simple beep sounds
    } catch (error) {
      console.log('Error loading sounds:', error);
    }
  };

  const playSound = async (type) => {
    if (!soundEnabled) return;
    
    try {
      // Create simple beep sounds using different frequencies
      const frequencies = {
        cross: 200,      // Low beep for error
        connect: 600,    // Mid beep for connection
        puzzle: 800,     // High beep for puzzle complete
        level: 1000,     // Highest for level complete
      };
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizYIHW+98+mcTwwOVKnn77RgGgU7k9n0y3oqBSp+y/LZjDoHGW27++WPTAwNUKvm8LVhGgU0jdrzz38oAxx7ye7bkDkGHmu78OScSwsNTarq7K9aFgo9mN701f8qLjNywfDej0ALEVux7OupVBMHQJvd8sBqHQU2kNXyx3wqBSd6yPDXjTkKGG+88OWbUQ0PU6vo87JeFgU8l9301fosByd5yO7ajz0JGG6/++iaUQ4STK3o8a1cFgU5ldf0yHsoByh2x+/YjDkJGG7A++mcUg4RTK3o8K5cFQU7lNr0y3ssCSh6ye/aij0JGW3A/OebUQwOTqvk8bJeGQU9mt300v0qBSV5yO7YizwGGm++/OabUQ0OUK3o8K5dFgU8l9r1y3orByh4yPDYjTsJGmzB/OicUgwOTazk8bFcGAU9mdr1zH0qBSV4x+7Yiz0IG26//OebUg0OUqzn8LFcGAU+mNz1zH0qBSV5yO/YjDwJG22//OebUQwOTqzm8K9dGAU/mN71zH0pBSZ5yPDYjj4JHG3B/OebUQ0PU63o8a5dGAY/mdz1zX0pBSZ4yO/Xjj0KHG3A++ibUgwOTqzn8K9eGQU/md/1zH0pBSZ6yPDZjj4KHG3B/OecUg4PU63p8a5dGQVAmd/1zH4pBSZ5yO/Xjj4JHG3B/OicUgwOT6zn8K9dGAU/md/1zH4pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md/1zX4pBSZ5yO/Xjz4JHG3A++icUgwOTqzn8LBeGQU/md/1zH4pBSV5yO/Xjz4JHG3A++icUgwOTqzn8K9eGQU/md/1zH4pBSZ5yO/Xjz4JHG3A++icUgwOTqzn8K9eGQU/md/1zH4pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9eGQU/md/1zH4pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9eGQU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ibUgwOTqzn8K9dGAU/md71zH0pBSZ5yO/Xjz4JHG3A++ib`
      });
      
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  // Simplify path using Douglas-Peucker algorithm
  const simplifyPath = (points, tolerance = 10) => {
    if (points.length <= 2) return points;

    const sqDistance = (p1, p2) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      return dx * dx + dy * dy;
    };

    const pointToSegmentDistance = (p, p1, p2) => {
      let x = p1.x, y = p1.y;
      let dx = p2.x - x;
      let dy = p2.y - y;

      if (dx !== 0 || dy !== 0) {
        const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) {
          x = p2.x;
          y = p2.y;
        } else if (t > 0) {
          x += dx * t;
          y += dy * t;
        }
      }

      dx = p.x - x;
      dy = p.y - y;
      return dx * dx + dy * dy;
    };

    const simplifyDouglasPeucker = (points, sqTolerance) => {
      const len = points.length;
      if (len <= 2) return points;

      let index = -1;
      let maxSqDist = sqTolerance;

      for (let i = 1; i < len - 1; i++) {
        const sqDist = pointToSegmentDistance(points[i], points[0], points[len - 1]);
        if (sqDist > maxSqDist) {
          index = i;
          maxSqDist = sqDist;
        }
      }

      if (index > -1) {
        const left = simplifyDouglasPeucker(points.slice(0, index + 1), sqTolerance);
        const right = simplifyDouglasPeucker(points.slice(index), sqTolerance);
        return left.slice(0, -1).concat(right);
      }

      return [points[0], points[len - 1]];
    };

    return simplifyDouglasPeucker(points, tolerance * tolerance);
  };

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
    
    // Check if any line segment in path1 intersects with any in path2
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
    
    // Constrain to canvas boundaries
    const constrainedX = Math.max(0, Math.min(CANVAS_WIDTH, locationX));
    const constrainedY = Math.max(0, Math.min(CANVAS_WIDTH, locationY));
    
    // Add point to path (free-flow drawing)
    const lastPoint = activePath.points[activePath.points.length - 1];
    const dist = distance(lastPoint, { x: constrainedX, y: constrainedY });
    
    // Only add point if moved enough (prevents too many points)
    if (dist > 8) {
      const newPoints = [...activePath.points, { x: constrainedX, y: constrainedY }];
      // Simplify path to keep it smooth and controlled
      const simplified = simplifyPath(newPoints, 15);
      
      setActivePath({
        ...activePath,
        points: simplified,
      });
    }
  };

  const handleTouchEnd = (event) => {
    if (!activePath) return;

    const { locationX, locationY } = event.nativeEvent;
    const dotInfo = findDotAtPosition(locationX, locationY);
    
    // Check if ended on correct dot
    if (dotInfo && dotInfo.dot.color === activePath.color) {
      const isValidEnd = (
        (activePath.startPosition === 'start' && dotInfo.position === 'end') ||
        (activePath.startPosition === 'end' && dotInfo.position === 'start')
      );
      
      if (isValidEnd) {
        // Add final point at dot center
        const finalPath = [...activePath.points, dotInfo.pos];
        
        // Check for intersections with other paths
        let intersects = false;
        for (const [color, path] of Object.entries(paths)) {
          if (color !== activePath.color && pathsIntersect(finalPath, path)) {
            intersects = true;
            break;
          }
        }
        
        if (!intersects) {
          // Success! Play success sound
          playSound('connect');
          setPaths({
            ...paths,
            [activePath.color]: finalPath,
          });
        } else {
          // Intersection detected! Play error sound
          playSound('cross');
        }
      }
    }
    
    setActivePath(null);
  };

  const checkCompletion = () => {
    if (Object.keys(paths).length === dots.length) {
      // Check no intersections
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
        playSound('puzzle'); // Play puzzle complete sound
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  const nextPuzzle = () => {
    const currentLevelData = LEVELS[currentLevel];
    
    if (currentPuzzle < currentLevelData.puzzles.length - 1) {
      // Move to next puzzle in same level
      const nextPuzzleIndex = currentPuzzle + 1;
      setCurrentPuzzle(nextPuzzleIndex);
      setDots(currentLevelData.puzzles[nextPuzzleIndex].dots);
      setPaths({});
      setActivePath(null);
      setMoves(0);
      setIsComplete(false);
      setScore((prev) => prev + 50);
    } else if (currentLevel < LEVELS.length - 1) {
      // Move to next level
      playSound('level'); // Play level complete sound
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
      // All levels complete!
      playSound('level');
      setGameComplete(true);
      setIsComplete(false);
    }
  };

  const showHintPath = () => {
    setShowHint(true);
    setTimeout(() => setShowHint(false), 3000); // Hide after 3 seconds
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

  const closeLevelComplete = () => {
    setIsComplete(false);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPath = (points, color, isActive = false) => {
    if (!points || points.length < 2) return null;

    // Create smooth path string
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
        {isComplete && (
          <TouchableOpacity 
            style={[styles.controlButton, styles.nextButtonControl]} 
            onPress={nextPuzzle}
          >
            <Text style={styles.nextButtonControlText}>
              {currentPuzzle < 4 ? 'Next →' : 'Level →'}
            </Text>
          </TouchableOpacity>
        )}
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
                Tap a colored circle at the bottom to clear that path
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
  },
  svgContainer: {
    backgroundColor: '#16213E',
    borderRadius: 20,
    overflow: 'hidden',
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
  },
  controlButton: {
    backgroundColor: '#0F3460',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  controlButtonText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: '700',
  },
  nextButtonControl: {
    backgroundColor: '#4ECDC4',
    borderColor: '#FFE66D',
  },
  nextButtonControlText: {
    color: '#1A1A2E',
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

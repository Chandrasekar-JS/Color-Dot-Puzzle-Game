import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Alert,
} from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const GRID_SIZE = 6;
const DOT_RADIUS = 18;
const CELL_SIZE = (screenWidth - 80) / GRID_SIZE;

// Level configurations
const LEVELS = [
  {
    level: 1,
    dots: [
      { color: '#FF6B6B', start: { row: 1, col: 1 }, end: { row: 4, col: 4 } },
      { color: '#4ECDC4', start: { row: 1, col: 4 }, end: { row: 4, col: 1 } },
    ],
  },
  {
    level: 2,
    dots: [
      { color: '#FF6B6B', start: { row: 0, col: 0 }, end: { row: 5, col: 5 } },
      { color: '#4ECDC4', start: { row: 0, col: 5 }, end: { row: 5, col: 0 } },
      { color: '#FFE66D', start: { row: 2, col: 2 }, end: { row: 3, col: 3 } },
    ],
  },
  {
    level: 3,
    dots: [
      { color: '#FF6B6B', start: { row: 0, col: 2 }, end: { row: 5, col: 2 } },
      { color: '#4ECDC4', start: { row: 0, col: 0 }, end: { row: 2, col: 4 } },
      { color: '#FFE66D', start: { row: 3, col: 1 }, end: { row: 5, col: 5 } },
      { color: '#A8DADC', start: { row: 2, col: 0 }, end: { row: 5, col: 3 } },
    ],
  },
  {
    level: 4,
    dots: [
      { color: '#FF6B6B', start: { row: 1, col: 0 }, end: { row: 4, col: 5 } },
      { color: '#4ECDC4', start: { row: 0, col: 1 }, end: { row: 5, col: 4 } },
      { color: '#FFE66D', start: { row: 0, col: 3 }, end: { row: 3, col: 0 } },
      { color: '#A8DADC', start: { row: 2, col: 5 }, end: { row: 5, col: 2 } },
      { color: '#95E1D3', start: { row: 3, col: 3 }, end: { row: 5, col: 5 } },
    ],
  },
];

const ColorDotGame = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [dots, setDots] = useState(LEVELS[0].dots);
  const [paths, setPaths] = useState({});
  const [activePath, setActivePath] = useState(null);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(1234);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef(null);

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

  const gridToScreen = (row, col) => {
    return {
      x: 40 + col * CELL_SIZE + CELL_SIZE / 2,
      y: 180 + row * CELL_SIZE + CELL_SIZE / 2,
    };
  };

  const screenToGrid = (x, y) => {
    const col = Math.round((x - 40 - CELL_SIZE / 2) / CELL_SIZE);
    const row = Math.round((y - 180 - CELL_SIZE / 2) / CELL_SIZE);
    return { row, col };
  };

  const isValidCell = (row, col) => {
    return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
  };

  const isCellOccupied = (row, col, excludeColor) => {
    for (const color in paths) {
      if (color === excludeColor) continue;
      const path = paths[color];
      if (path && path.some((cell) => cell.row === row && cell.col === col)) {
        return true;
      }
    }
    return false;
  };

  const findDotAtPosition = (row, col) => {
    return dots.find(
      (dot) =>
        (dot.start.row === row && dot.start.col === col) ||
        (dot.end.row === row && dot.end.col === col)
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt, gestureState) => {
        const { locationX, locationY } = evt.nativeEvent;
        const gridPos = screenToGrid(locationX, locationY);

        if (!isValidCell(gridPos.row, gridPos.col)) return;

        const dot = findDotAtPosition(gridPos.row, gridPos.col);
        if (dot) {
          setActivePath({
            color: dot.color,
            path: [gridPos],
            startDot: dot,
          });
          setMoves((prev) => prev + 1);
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        if (!activePath) return;

        const { locationX, locationY } = evt.nativeEvent;
        const gridPos = screenToGrid(locationX, locationY);

        if (!isValidCell(gridPos.row, gridPos.col)) return;

        const lastPos = activePath.path[activePath.path.length - 1];
        if (lastPos.row === gridPos.row && lastPos.col === gridPos.col) return;

        // Check if adjacent
        const isAdjacent =
          Math.abs(lastPos.row - gridPos.row) + Math.abs(lastPos.col - gridPos.col) === 1;

        if (!isAdjacent) return;

        // Check if occupied by another color
        if (isCellOccupied(gridPos.row, gridPos.col, activePath.color)) return;

        // Check if reached end dot
        const endDot = activePath.startDot.end;
        const startDot = activePath.startDot.start;

        // Allow connecting to either start or end
        const reachedEnd =
          (gridPos.row === endDot.row && gridPos.col === endDot.col) ||
          (gridPos.row === startDot.row && gridPos.col === startDot.col);

        if (reachedEnd || !isCellOccupied(gridPos.row, gridPos.col, activePath.color)) {
          setActivePath({
            ...activePath,
            path: [...activePath.path, gridPos],
            complete: reachedEnd,
          });
        }
      },

      onPanResponderRelease: () => {
        if (activePath) {
          if (activePath.complete) {
            setPaths({
              ...paths,
              [activePath.color]: activePath.path,
            });
          }
          setActivePath(null);
        }
      },
    })
  ).current;

  const checkCompletion = () => {
    if (Object.keys(paths).length === dots.length) {
      const allComplete = dots.every((dot) => {
        const path = paths[dot.color];
        if (!path) return false;

        const start = path[0];
        const end = path[path.length - 1];

        return (
          (start.row === dot.start.row &&
            start.col === dot.start.col &&
            end.row === dot.end.row &&
            end.col === dot.end.col) ||
          (start.row === dot.end.row &&
            start.col === dot.end.col &&
            end.row === dot.start.row &&
            end.col === dot.start.col)
        );
      });

      if (allComplete) {
        setIsComplete(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  const nextLevel = () => {
    if (currentLevel < LEVELS.length - 1) {
      const nextLvl = currentLevel + 1;
      setCurrentLevel(nextLvl);
      setDots(LEVELS[nextLvl].dots);
      setPaths({});
      setActivePath(null);
      setTimer(0);
      setMoves(0);
      setIsComplete(false);
      setScore((prev) => prev + 100);
    } else {
      Alert.alert('Congratulations!', 'You completed all levels!');
    }
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

  const renderPath = (path, color, isActive = false) => {
    if (!path || path.length < 2) return null;

    const pathString = path
      .map((cell, index) => {
        const pos = gridToScreen(cell.row, cell.col);
        return `${index === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
      })
      .join(' ');

    return (
      <Path
        key={color}
        d={pathString}
        stroke={color}
        strokeWidth={12}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isActive ? 0.8 : 1}
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
      <View style={styles.gameContainer} {...panResponder.panHandlers}>
        <Svg
          width={screenWidth - 40}
          height={CELL_SIZE * GRID_SIZE + 40}
          style={styles.svg}
        >
          {/* Grid lines (subtle) */}
          {[...Array(GRID_SIZE + 1)].map((_, i) => (
            <React.Fragment key={`grid-${i}`}>
              <Line
                x1={40}
                y1={180 + i * CELL_SIZE}
                x2={40 + GRID_SIZE * CELL_SIZE}
                y2={180 + i * CELL_SIZE}
                stroke="#2A2A3E"
                strokeWidth={0.5}
              />
              <Line
                x1={40 + i * CELL_SIZE}
                y1={180}
                x2={40 + i * CELL_SIZE}
                y2={180 + GRID_SIZE * CELL_SIZE}
                stroke="#2A2A3E"
                strokeWidth={0.5}
              />
            </React.Fragment>
          ))}

          {/* Draw completed paths */}
          {Object.entries(paths).map(([color, path]) => renderPath(path, color))}

          {/* Draw active path */}
          {activePath && renderPath(activePath.path, activePath.color, true)}

          {/* Draw dots */}
          {dots.map((dot, index) => {
            const startPos = gridToScreen(dot.start.row, dot.start.col);
            const endPos = gridToScreen(dot.end.row, dot.end.col);

            return (
              <React.Fragment key={`dot-${index}`}>
                {/* Start dot */}
                <Circle
                  cx={startPos.x}
                  cy={startPos.y}
                  r={DOT_RADIUS}
                  fill={dot.color}
                  stroke="#1A1A2E"
                  strokeWidth={3}
                />
                {/* End dot */}
                <Circle
                  cx={endPos.x}
                  cy={endPos.y}
                  r={DOT_RADIUS}
                  fill={dot.color}
                  stroke="#1A1A2E"
                  strokeWidth={3}
                />
              </React.Fragment>
            );
          })}
        </Svg>
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
        <TouchableOpacity style={styles.controlButton} onPress={resetLevel}>
          <Text style={styles.controlButtonText}>🔄 Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Completion overlay */}
      {isComplete && (
        <View style={styles.completionOverlay}>
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>Level Complete!</Text>
            <Text style={styles.completionStats}>
              Time: {formatTime(timer)} | Moves: {moves}
            </Text>
            <TouchableOpacity style={styles.nextButton} onPress={nextLevel}>
              <Text style={styles.nextButtonText}>Next Level →</Text>
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
    paddingVertical: 20,
  },
  svg: {
    backgroundColor: '#16213E',
    borderRadius: 20,
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
});

export default ColorDotGame;

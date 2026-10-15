/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  Car,
  FileCode,
  Gauge,
  Zap,
  Play,
  Pause,
  Sun,
  Moon,
  Sparkles,
  Flame,
  Compass,
} from 'lucide-react';
import { Vehicle } from './components/Vehicle';
import { TouchControls } from './components/TouchControls';
import { RulesModal } from './components/RulesModal';
import { OriginalRepoModal } from './components/OriginalRepoModal';
import { sound } from './sound';
import treeImg from './assets/images/tree.jpg';
import trophyImg from './assets/images/arcade_champion_cup_1792077200280.jpg';

// 6 curated vehicle liveries
const CAR_PAINTS = [
  { id: 'crimson', name: 'Crimson Apex', hex: '#e11d48' },
  { id: 'magenta', name: 'Retro Magenta', hex: '#de168b' },
  { id: 'cyan', name: 'Cyber Cyan', hex: '#06b6d4' },
  { id: 'gold', name: 'Bumblebee Gold', hex: '#f59e0b' },
  { id: 'violet', name: 'Midnight Violet', hex: '#8b5cf6' },
  { id: 'emerald', name: 'Toxic Lime', hex: '#10b981' },
];

const OPPONENT_PALETTE = ['#270463', '#1e3a8a', '#78350f', '#064e3b', '#831843', '#312e81'];

export default function App() {
  // Road dimensions
  const ROAD_WIDTH = 380;
  const ROAD_HEIGHT = 630;
  const CAR_WIDTH = 42;
  const CAR_HEIGHT = 64;

  // Game state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('high_score') || '0', 10) || 0;
    } catch {
      return 0;
    }
  });

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [headlightsEnabled, setHeadlightsEnabled] = useState<boolean>(true);
  const [isNightMode, setIsNightMode] = useState<boolean>(true);
  const [selectedColor, setSelectedColor] = useState<string>('#e11d48');
  const [speedLevel, setSpeedLevel] = useState<number>(2);

  // Modals
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showOriginalRepo, setShowOriginalRepo] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [treeImageError, setTreeImageError] = useState<boolean>(false);
  const [trophyImageError, setTrophyImageError] = useState<boolean>(false);

  // Player state
  const [playerX, setPlayerX] = useState<number>(ROAD_WIDTH * 0.5 - CAR_WIDTH / 2);
  const [playerY, setPlayerY] = useState<number>(ROAD_HEIGHT - 100);
  const [playerTilt, setPlayerTilt] = useState<number>(0);

  // Road lines
  const [lines, setLines] = useState<number[]>([-150, 150, 450]);

  // Opponents state
  const [opponents, setOpponents] = useState<
    { id: string; x: number; y: number; color: string }[]
  >([
    { id: 'car_1', x: ROAD_WIDTH * 0.62, y: -100, color: '#270463' },
    { id: 'car_2', x: ROAD_WIDTH * 0.22, y: -280, color: '#1e3a8a' },
    { id: 'car_3', x: ROAD_WIDTH * 0.44, y: -450, color: '#78350f' },
  ]);

  // Active key presses
  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
  });

  // Mutable game state ref
  const simRef = useRef({
    playerX: ROAD_WIDTH * 0.5 - CAR_WIDTH / 2,
    playerY: ROAD_HEIGHT - 100,
    lines: [-150, 150, 450],
    opponents: [
      { id: 'car_1', x: ROAD_WIDTH * 0.62, y: -100, color: '#270463' },
      { id: 'car_2', x: ROAD_WIDTH * 0.22, y: -280, color: '#1e3a8a' },
      { id: 'car_3', x: ROAD_WIDTH * 0.44, y: -450, color: '#78350f' },
    ],
    score: 0,
    scoreCounter: 1,
    speed: 2,
    lineSpeed: 5,
    distance: 0,
    gameOver: false,
    paused: false,
    animId: 0,
    highScore: 0,
  });

  // High score ref sync
  useEffect(() => {
    simRef.current.highScore = highScore;
  }, [highScore]);

  // Toggle sound
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
  };

  // Precise hitbox collision detection matching original script.js
  const checkCollision = (
    px: number,
    py: number,
    ox: number,
    oy: number
  ): boolean => {
    const pad = 4;
    const x1 = px + pad;
    const y1 = py + pad;
    const w1 = CAR_WIDTH - pad * 2;
    const h1 = CAR_HEIGHT - pad * 2;
    const b1 = y1 + h1;
    const r1 = x1 + w1;

    const x2 = ox + pad;
    const y2 = oy + pad;
    const w2 = CAR_WIDTH - pad * 2;
    const h2 = CAR_HEIGHT - pad * 2;
    const b2 = y2 + h2;
    const r2 = x2 + w2;

    if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) {
      return false;
    }
    return true;
  };

  // End Game
  const endGame = useCallback(() => {
    const sim = simRef.current;
    sim.gameOver = true;
    setIsGameOver(true);
    setIsPlaying(false);
    cancelAnimationFrame(sim.animId);
    sound.playCrash();

    // Trigger road impact vibration effect
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 500);

    const currentScore = sim.score;
    if (currentScore > sim.highScore) {
      sim.highScore = currentScore;
      setHighScore(currentScore);
      setIsNewRecord(true);
      try {
        localStorage.setItem('high_score', currentScore.toString());
      } catch {
        // Ignore storage errors
      }
    }
  }, []);

  // Main animation frame loop
  const loop = useCallback(() => {
    const sim = simRef.current;
    if (sim.gameOver || sim.paused) return;

    // 1. Player movement with dynamic tilt
    const keys = keysRef.current;
    let tilt = 0;

    // Clamp inside asphalt curbs (allow room up to shoulder line)
    const minX = 22;
    const maxX = ROAD_WIDTH - CAR_WIDTH - 22;

    if (keys.left && sim.playerX > minX) {
      sim.playerX -= 5;
      tilt -= 6;
    }
    if (keys.right && sim.playerX < maxX) {
      sim.playerX += 5;
      tilt += 6;
    }
    if (keys.up && sim.playerY > 12) {
      sim.playerY -= 3.5;
    }
    if (keys.down && sim.playerY < ROAD_HEIGHT - CAR_HEIGHT - 16) {
      sim.playerY += 3.5;
    }

    setPlayerX(sim.playerX);
    setPlayerY(sim.playerY);
    setPlayerTilt(tilt);

    // 2. Collision check
    for (let i = 0; i < sim.opponents.length; i++) {
      const opp = sim.opponents[i];
      if (checkCollision(sim.playerX, sim.playerY, opp.x, opp.y)) {
        endGame();
        return;
      }
    }

    // 3. Move lines
    for (let i = 0; i < sim.lines.length; i++) {
      let lineY = sim.lines[i] + sim.lineSpeed;
      if (lineY > ROAD_HEIGHT) {
        lineY = -200;
      }
      sim.lines[i] = lineY;
    }
    setLines([...sim.lines]);

    // 4. Move Opponent Cars
    for (let i = 0; i < sim.opponents.length; i++) {
      const opp = sim.opponents[i];
      let oppY = opp.y + sim.speed;

      if (oppY > ROAD_HEIGHT) {
        oppY = -220;
        // Spawn across lanes inside asphalt width
        const availableWidth = maxX - minX;
        const randomLeft = minX + Math.floor(Math.random() * availableWidth);
        opp.x = randomLeft;
        opp.color =
          OPPONENT_PALETTE[Math.floor(Math.random() * OPPONENT_PALETTE.length)];
      }
      opp.y = oppY;
    }
    setOpponents([...sim.opponents]);

    // 5. Score increment (faithful to: score_counter % 20 == 0 -> score++)
    sim.scoreCounter++;
    sim.distance += Math.round(sim.speed * 0.4);
    setDistance(sim.distance);

    if (sim.scoreCounter % 20 === 0) {
      sim.score++;
      setScore(sim.score);
      if (sim.score % 30 === 0) {
        sound.playScorePing();
      }
    }

    // 6. Dynamic acceleration (faithful to: score_counter % 300 == 0 -> speed++, line_speed++)
    if (sim.scoreCounter % 300 === 0) {
      sim.speed++;
      sim.lineSpeed++;
      setSpeedLevel(sim.speed);
      sound.updateEngineSpeed(sim.speed);
    }

    sim.animId = requestAnimationFrame(loop);
  }, [ROAD_HEIGHT, ROAD_WIDTH, endGame]);

  // Start / Restart game
  const startGame = useCallback(() => {
    const sim = simRef.current;
    cancelAnimationFrame(sim.animId);

    const initX = ROAD_WIDTH * 0.5 - CAR_WIDTH / 2;
    const initY = ROAD_HEIGHT - 100;

    sim.playerX = initX;
    sim.playerY = initY;
    sim.lines = [-150, 150, 450];
    sim.opponents = [
      { id: 'car_1', x: ROAD_WIDTH * 0.62, y: -100, color: '#270463' },
      { id: 'car_2', x: ROAD_WIDTH * 0.22, y: -280, color: '#1e3a8a' },
      { id: 'car_3', x: ROAD_WIDTH * 0.44, y: -450, color: '#78350f' },
    ];
    sim.score = 0;
    sim.scoreCounter = 1;
    sim.speed = 2;
    sim.lineSpeed = 5;
    sim.distance = 0;
    sim.gameOver = false;
    sim.paused = false;

    setPlayerX(initX);
    setPlayerY(initY);
    setPlayerTilt(0);
    setLines([...sim.lines]);
    setOpponents([...sim.opponents]);
    setScore(0);
    setDistance(0);
    setSpeedLevel(2);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    setIsNewRecord(false);

    sound.startEngine(2);
    sim.animId = requestAnimationFrame(loop);
  }, [ROAD_HEIGHT, ROAD_WIDTH, loop]);

  // Pause / Resume
  const togglePause = () => {
    if (isGameOver || !isPlaying) return;
    const next = !isPaused;
    setIsPaused(next);
    simRef.current.paused = next;
    if (next) {
      sound.stopEngine();
      cancelAnimationFrame(simRef.current.animId);
    } else {
      sound.startEngine(simRef.current.speed);
      simRef.current.animId = requestAnimationFrame(loop);
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Enter') {
        if (!isPlaying || isGameOver) {
          startGame();
          return;
        }
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        if (isPlaying && !isGameOver) {
          togglePause();
          return;
        }
      }

      if (e.key === 'h' || e.key === 'H') {
        sound.playHonk();
        return;
      }

      if (simRef.current.gameOver || simRef.current.paused) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = false;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(simRef.current.animId);
      sound.stopEngine();
    };
  }, [isGameOver, isPlaying, startGame]);

  // Touch controls handlers
  const handleTouchStartMove = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (!isPlaying && !isGameOver) {
      startGame();
    }
    keysRef.current[dir] = true;
  };

  const handleTouchStopMove = (dir: 'up' | 'down' | 'left' | 'right') => {
    keysRef.current[dir] = false;
  };

  // Driver rank title based on score
  const getDriverRank = (s: number) => {
    if (s >= 150) return 'Highway Legend';
    if (s >= 100) return 'Speed Demon';
    if (s >= 50) return 'Track Master';
    if (s >= 20) return 'Pro Driver';
    return 'Rookie Racer';
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Universal Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Clean single-line links) — Zone 3 (1 Action CTA) */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-neutral-800/80 bg-neutral-900/60 backdrop-blur-md">
        {/* Zone 1: Single Wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-neutral-950 font-black">
            <Car className="w-5 h-5 fill-current" />
          </div>
          <span className="text-lg font-black tracking-wider text-white font-outfit uppercase">
            Traffic Racer
          </span>
        </div>

        {/* Zone 2: 4-5 single line nav buttons / controls */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
          <button
            onClick={() => setShowRules(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Driver Manual</span>
          </button>

          <button
            onClick={toggleSound}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-500" />
            )}
            <span>{soundEnabled ? 'Audio On' : 'Audio Muted'}</span>
          </button>

          <button
            onClick={() => setIsNightMode((v) => !v)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            {isNightMode ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span>{isNightMode ? 'Night Highway' : 'Daylight Run'}</span>
          </button>

          <button
            onClick={() => setHeadlightsEnabled((v) => !v)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{headlightsEnabled ? 'Xenon Beams' : 'Beams Off'}</span>
          </button>

          <button
            onClick={() => setShowOriginalRepo(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-neutral-400" />
            <span>Raw Files</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary CTA Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={isPlaying ? togglePause : startGame}
            className="px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 active:scale-95 rounded-xl shadow-md shadow-amber-500/20 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isGameOver ? 'Play Again' : 'Start Race'}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8 my-auto">
        
        {/* Left Side: Telemetry Cockpit & Vehicle Livery */}
        <div className="w-full lg:w-72 flex flex-col gap-4 order-2 lg:order-1">
          {/* Real-time LED Score Dashboard */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-xs text-neutral-400">
              <span className="font-outfit uppercase tracking-wider font-semibold">Live Score</span>
              <span className="font-mono-numbers text-emerald-400">PTS</span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-extrabold font-mono-numbers text-white tracking-tight">
                {score.toString().padStart(3, '0')}
              </span>
              <span className="text-xs text-neutral-400 font-medium">pts</span>
            </div>

            {/* High Score Trophy Card */}
            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-950 border border-amber-500/30 flex-shrink-0 flex items-center justify-center">
                  {!trophyImageError ? (
                    <img
                      src={trophyImg}
                      alt="Championship Trophy"
                      referrerPolicy="no-referrer"
                      onError={() => setTrophyImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Trophy className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-semibold">
                    Best Record
                  </span>
                  <span className="text-sm font-bold text-amber-400 font-outfit">
                    {getDriverRank(highScore)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono-numbers text-amber-400">
                  {highScore}
                </span>
              </div>
            </div>

            {isNewRecord && (
              <div className="mt-3 py-1 px-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-xl text-center animate-pulse">
                New All-Time High Score!
              </div>
            )}
          </div>

          {/* Speed & Gauge Telemetry */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 shadow-xl grid grid-cols-2 gap-3">
            <div className="bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-emerald-400" />
                Velocity
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono-numbers text-white">
                  {speedLevel * 24}
                </span>
                <span className="text-[10px] text-neutral-400">MPH</span>
              </div>
            </div>

            <div className="bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                Distance
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono-numbers text-white">
                  {distance}
                </span>
                <span className="text-[10px] text-neutral-400">m</span>
              </div>
            </div>
          </div>

          {/* Paint Shop / Vehicle Skin Chooser */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-outfit font-semibold text-neutral-300">
                Vehicle Paint Livery
              </span>
              <span className="text-neutral-500 text-[11px]">
                {CAR_PAINTS.find((c) => c.hex === selectedColor)?.name}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {CAR_PAINTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  title={c.name}
                  className={`h-8 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedColor === c.hex
                      ? 'border-white scale-110 shadow-lg shadow-white/20'
                      : 'border-neutral-700/60 hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Desktop Keyboard Quick Guide */}
          <div className="bg-neutral-900/60 border border-neutral-800/60 p-4 rounded-3xl text-xs text-neutral-400 hidden lg:block">
            <div className="font-outfit font-bold text-neutral-200 mb-2">Controls:</div>
            <div className="space-y-1 text-[11px] leading-relaxed">
              <div className="flex justify-between">
                <span>Steer / Move</span>
                <span className="text-neutral-200 font-mono">Arrow Keys / WASD</span>
              </div>
              <div className="flex justify-between">
                <span>Sound Horn</span>
                <span className="text-neutral-200 font-mono">H Key</span>
              </div>
              <div className="flex justify-between">
                <span>Pause</span>
                <span className="text-neutral-200 font-mono">Space / P</span>
              </div>
              <div className="flex justify-between">
                <span>Restart</span>
                <span className="text-neutral-200 font-mono">Enter</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: The High-Definition Asphalt Raceway */}
        <div className={`relative flex-shrink-0 order-1 lg:order-2 ${screenShake ? 'animate-bounce' : ''}`}>
          {/* Outer Grass Embankment Left */}
          <div className="absolute -left-5 top-0 bottom-0 w-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 rounded-l-2xl shadow-2xl overflow-hidden pointer-events-none" />

          {/* Left Rumble Curb (Red & White alternating) */}
          <div className="absolute -left-3 top-0 bottom-0 w-3 rumble-curb-left z-20 pointer-events-none" />

          {/* Main Road Surface */}
          <div
            id="container"
            className="relative asphalt-surface overflow-hidden rounded-xl shadow-2xl border-y border-neutral-700"
            style={{
              width: `${ROAD_WIDTH}px`,
              height: `${ROAD_HEIGHT}px`,
            }}
          >
            {/* Dark atmosphere mask when in night mode */}
            {isNightMode && (
              <div className="absolute inset-0 bg-neutral-950/50 pointer-events-none z-10" />
            )}

            {/* Left and Right Road Shoulder Lines */}
            <div className="shoulder-line-left" />
            <div className="shoulder-line-right" />

            {/* Center Dashed Lane Dividers */}
            {lines.map((topPos, idx) => (
              <div
                key={idx}
                id={`line_${idx + 1}`}
                className="line"
                style={{
                  top: `${topPos}px`,
                }}
              />
            ))}

            {/* Opponent Vehicles */}
            {opponents.map((opp) => (
              <Vehicle
                key={opp.id}
                id={opp.id}
                x={opp.x}
                y={opp.y}
                color={opp.color}
                isPlayer={false}
                showHeadlights={headlightsEnabled && isNightMode}
              />
            ))}

            {/* Player Vehicle */}
            <Vehicle
              id="car"
              x={playerX}
              y={playerY}
              color={selectedColor}
              isPlayer={true}
              showHeadlights={headlightsEnabled}
              tilt={playerTilt}
              crashed={isGameOver}
            />

            {/* Collision Crash Shockwave Effect */}
            {isGameOver && (
              <div
                className="absolute z-30 pointer-events-none rounded-full border-4 border-red-500 animate-ping"
                style={{
                  left: `${playerX - 15}px`,
                  top: `${playerY - 15}px`,
                  width: '72px',
                  height: '94px',
                  backgroundColor: 'rgba(239, 68, 68, 0.4)',
                }}
              />
            )}

            {/* Start / Idle Screen Overlay */}
            {!isPlaying && !isGameOver && (
              <div className="absolute inset-0 z-40 bg-neutral-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-neutral-950 flex items-center justify-center mb-4 shadow-xl shadow-amber-500/25">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <h3 className="text-2xl font-black text-white font-outfit tracking-wide mb-1">
                  READY TO RACE?
                </h3>
                <p className="text-xs text-neutral-300 mb-6 max-w-[240px] leading-relaxed">
                  Dodge oncoming highway traffic, collect distance, and challenge the leaderboards!
                </p>
                <button
                  type="button"
                  onClick={startGame}
                  className="px-7 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-black rounded-2xl shadow-xl shadow-amber-500/30 flex items-center gap-2 transition cursor-pointer font-outfit text-base"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>START DRIVING</span>
                </button>
                <div className="mt-4 flex items-center gap-2 text-[11px] text-neutral-400">
                  <span>Arrow keys / WASD to drive</span>
                  <span aria-hidden="true">·</span>
                  <span>Enter to go</span>
                </div>
              </div>
            )}

            {/* Pause Screen Overlay */}
            {isPaused && (
              <div className="absolute inset-0 z-40 bg-neutral-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3">
                  <Pause className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-white font-outfit mb-1">GAME PAUSED</h3>
                <p className="text-xs text-neutral-400 mb-5">Take a breather, driver.</p>
                <div className="flex flex-col gap-2 w-48">
                  <button
                    type="button"
                    onClick={togglePause}
                    className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition cursor-pointer font-outfit text-sm"
                  >
                    Resume Run
                  </button>
                  <button
                    type="button"
                    onClick={startGame}
                    className="py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-xl transition cursor-pointer text-xs"
                  >
                    Restart
                  </button>
                </div>
              </div>
            )}

            {/* Game Over Screen (#restart_div) */}
            {isGameOver && (
              <div
                id="restart_div"
                className="absolute inset-0 z-40 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in"
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3">
                  <Flame className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-white font-outfit tracking-wide mb-1">
                  CRASHED!
                </h2>
                <p className="text-xs text-neutral-400 mb-5">
                  High-speed collision with oncoming traffic
                </p>

                {/* Score breakdown sheet */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 w-68 mb-6 shadow-inner space-y-2.5 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase text-neutral-400 font-medium">Final Score</span>
                    <span className="text-2xl font-black text-white font-mono-numbers">
                      {score}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-neutral-400">
                    <span>Distance Covered</span>
                    <span className="font-mono-numbers text-neutral-200">{distance} m</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                    <span className="text-xs uppercase text-amber-400 font-semibold">High Score</span>
                    <span className="text-xl font-black text-amber-400 font-mono-numbers">
                      {highScore}
                    </span>
                  </div>
                </div>

                <button
                  id="restart"
                  type="button"
                  onClick={startGame}
                  className="w-68 py-3.5 px-6 bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-black rounded-2xl shadow-xl flex flex-col items-center justify-center transition cursor-pointer font-outfit"
                >
                  <span className="text-base tracking-wide flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </span>
                  <small className="small_text text-[11px] text-neutral-800 font-medium mt-0.5">
                    (Press Enter to Restart)
                  </small>
                </button>
              </div>
            )}
          </div>

          {/* Right Rumble Curb (Red & White alternating) */}
          <div className="absolute -right-3 top-0 bottom-0 w-3 rumble-curb-right z-20 pointer-events-none" />

          {/* Outer Grass Embankment Right */}
          <div className="absolute -right-5 top-0 bottom-0 w-5 bg-gradient-to-l from-emerald-950 via-emerald-900 to-emerald-950 rounded-r-2xl shadow-2xl overflow-hidden pointer-events-none" />
        </div>

        {/* Right Side: Roadside Tree Asset & Tactile Mobile D-Pad */}
        <div className="w-full lg:w-72 flex flex-col items-center gap-4 order-3">
          {/* Roadside Scenic Window (Preserving authentic tree.jpg asset from original folder) */}
          <div
            id="tree"
            className="w-full hidden lg:flex flex-col bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2.5">
              <span className="font-outfit font-semibold uppercase tracking-wider text-[11px]">
                Roadside Environment
              </span>
              <span className="text-emerald-400 text-[10px]">Scenic Route</span>
            </div>

            <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center">
              {!treeImageError ? (
                <img
                  id="tree1"
                  src={treeImg}
                  alt="Original Roadside Tree"
                  referrerPolicy="no-referrer"
                  onError={() => setTreeImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-emerald-950 via-emerald-900/60 to-neutral-950 flex flex-col items-center justify-center text-center p-3">
                  <span className="text-3xl mb-1">🌲</span>
                  <span className="text-xs font-bold text-emerald-300 font-outfit">Alpine Highway Woods</span>
                  <span className="text-[10px] text-neutral-400">Scenic Forest Road</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white pointer-events-none">
                <span className="font-outfit font-bold">Alpine Forest Road</span>
                <span className="font-mono-numbers text-[11px] text-neutral-300">
                  Speed Lvl {speedLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile / Tablet Touch Gamepad */}
          <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-3xl p-4 shadow-xl flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-outfit font-semibold text-neutral-300">
                Touch Gamepad
              </span>
              <button
                type="button"
                onClick={togglePause}
                disabled={!isPlaying || isGameOver}
                className="text-[11px] text-neutral-400 hover:text-white px-2 py-0.5 rounded-lg bg-neutral-800 disabled:opacity-40 transition"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>
            <TouchControls
              onStartMove={handleTouchStartMove}
              onStopMove={handleTouchStopMove}
            />
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 border-t border-neutral-800/80">
        <div className="flex items-center gap-2">
          <span>Traffic Racer</span>
          <span aria-hidden="true">·</span>
          <span>© Ansari Raza. All Rights Reserved.</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowRules(true)}
            className="hover:text-amber-400 transition cursor-pointer"
          >
            Instructions
          </button>
          <button
            onClick={() => setShowOriginalRepo(true)}
            className="hover:text-amber-400 transition cursor-pointer"
          >
            View Raw Folder Source
          </button>
          <button
            onClick={startGame}
            className="hover:text-amber-400 transition cursor-pointer text-amber-400 font-semibold"
          >
            Play Now
          </button>
        </div>
      </footer>

      {/* Modals */}
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        onStart={startGame}
        onOpenOriginal={() => {
          setShowRules(false);
          setShowOriginalRepo(true);
        }}
      />

      <OriginalRepoModal
        isOpen={showOriginalRepo}
        onClose={() => setShowOriginalRepo(false)}
      />
    </div>
  );
}

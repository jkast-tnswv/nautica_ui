import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ────────────────────────────────────────────────

type Pixel = string | null;
type Sprite = Pixel[][];

interface Player {
  x: number;
  y: number;
  vy: number;
  grounded: boolean;
  frameIndex: number;
  frameTick: number;
}

type ObstacleType = 'server-rack' | 'hot-pipe' | 'gpu-block' | 'cable-bundle';

interface Obstacle {
  x: number;
  width: number;
  height: number;
  type: ObstacleType;
}

interface Collectible {
  x: number;
  y: number;
  collected: boolean;
}

export interface GameState {
  phase: 'start' | 'playing' | 'dead';
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  speed: number;
  player: Player;
  obstacles: Obstacle[];
  collectibles: Collectible[];
  backgroundOffset: number;
  groundOffset: number;
  nextObstacleIn: number;
  nextCollectibleIn: number;
  distance: number;
}

// ── Constants ────────────────────────────────────────────

const CANVAS_W = 800;
const CANVAS_H = 300;
const PIXEL_SCALE = 3;
const GROUND_Y = CANVAS_H - 60;
const PLAYER_X = 80;

const GRAVITY = 2800;
const JUMP_VY = -780;
const BASE_SPEED = 280;
const MAX_SPEED = 700;
const SPEED_ACCEL = 12;
const MIN_GAP = 1.2;
const MAX_GAP = 2.8;

const HITBOX_INSET = 4;
const LANDING_THRESHOLD = 18;
const STORAGE_KEY = 'tensio-high-score';

// ── Color palette ────────────────────────────────────────

const L = '#81D4FA'; // highlight blue (light edge)
const B = '#42A5F5'; // main body blue
const b = '#1E88E5'; // mid shadow blue
const D = '#1565C0'; // dark shadow blue
const N = '#000000'; // black outline / eyes
const W = '#FFFFFF'; // white (catchlights, hands, sneaker accent)
const R = '#E53935'; // red sneaker
const r = '#B71C1C'; // dark red sneaker sole
const C = '#0CE2F2'; // cyan collectible
const c = '#0097A7'; // dark cyan
const _ = null;      // transparent

// ── Obstacle colors ──────────────────────────────────────

const G1 = '#37474F'; // rack dark
const G2 = '#546E7A'; // rack mid
const G3 = '#78909C'; // rack light
const GL = '#4CAF50'; // green LED
const RL = '#F44336'; // red LED
const Y1 = '#FF8F00'; // hot pipe warm
const Y2 = '#FF6F00'; // hot pipe hot
const P1 = '#1B5E20'; // GPU board
const P2 = '#388E3C'; // GPU chip
const P3 = '#66BB6A'; // GPU light
const CB = '#3E2723'; // cable brown
const CK = '#212121'; // cable dark

// ── Character sprites (16x16) ────────────────────────────

// Sprites: teardrop body with sharp point, big expressive eyes,
// white catchlights, small mouth, white hand nubs, chunky red sneakers.
// Matches the reference pixel art character.
/* eslint-disable */
const DROPLET_RUN_0: Sprite = [
  [_,_,_,_,_,_,_,N,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,N,L,N,_,_,_,_,_,_,_],
  [_,_,_,_,_,N,L,B,B,N,_,_,_,_,_,_],
  [_,_,_,_,N,L,B,B,B,b,N,_,_,_,_,_],
  [_,_,_,N,L,B,B,B,B,b,D,N,_,_,_,_],
  [_,_,N,L,B,N,N,B,N,N,b,D,N,_,_,_],
  [_,_,N,L,N,N,N,B,N,N,N,D,N,_,_,_],
  [_,_,N,B,N,W,N,B,N,W,N,b,N,_,_,_],
  [_,_,N,B,B,N,N,B,B,N,N,b,N,_,_,_],
  [_,_,N,B,B,B,N,N,B,B,b,b,N,_,_,_],
  [_,W,N,B,B,B,B,B,B,B,b,N,W,_,_,_],
  [_,W,W,N,b,b,b,b,b,b,N,W,W,_,_,_],
  [_,_,_,_,N,b,N,N,b,N,_,_,_,_,_,_],
  [_,_,_,N,R,R,N,_,N,R,N,_,_,_,_,_],
  [_,_,N,R,W,R,R,N,N,R,N,_,_,_,_,_],
  [_,_,N,r,r,r,r,N,N,r,N,_,_,_,_,_],
];

const DROPLET_RUN_1: Sprite = [
  [_,_,_,_,_,_,_,N,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,N,L,N,_,_,_,_,_,_,_],
  [_,_,_,_,_,N,L,B,B,N,_,_,_,_,_,_],
  [_,_,_,_,N,L,B,B,B,b,N,_,_,_,_,_],
  [_,_,_,N,L,B,B,B,B,b,D,N,_,_,_,_],
  [_,_,N,L,B,N,N,B,N,N,b,D,N,_,_,_],
  [_,_,N,L,N,N,N,B,N,N,N,D,N,_,_,_],
  [_,_,N,B,N,W,N,B,N,W,N,b,N,_,_,_],
  [_,_,N,B,B,N,N,B,B,N,N,b,N,_,_,_],
  [_,_,N,B,B,B,N,N,B,B,b,b,N,_,_,_],
  [_,W,N,B,B,B,B,B,B,B,b,N,W,_,_,_],
  [_,W,W,N,b,b,b,b,b,b,N,W,W,_,_,_],
  [_,_,_,_,N,b,N,N,b,N,_,_,_,_,_,_],
  [_,_,_,_,N,R,N,N,R,N,_,_,_,_,_,_],
  [_,_,_,N,R,W,R,N,R,W,R,N,_,_,_,_],
  [_,_,_,N,r,r,r,N,r,r,r,N,_,_,_,_],
];

const DROPLET_RUN_2: Sprite = [
  [_,_,_,_,_,_,_,N,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,N,L,N,_,_,_,_,_,_,_],
  [_,_,_,_,_,N,L,B,B,N,_,_,_,_,_,_],
  [_,_,_,_,N,L,B,B,B,b,N,_,_,_,_,_],
  [_,_,_,N,L,B,B,B,B,b,D,N,_,_,_,_],
  [_,_,N,L,B,N,N,B,N,N,b,D,N,_,_,_],
  [_,_,N,L,N,N,N,B,N,N,N,D,N,_,_,_],
  [_,_,N,B,N,W,N,B,N,W,N,b,N,_,_,_],
  [_,_,N,B,B,N,N,B,B,N,N,b,N,_,_,_],
  [_,_,N,B,B,B,N,N,B,B,b,b,N,_,_,_],
  [_,W,N,B,B,B,B,B,B,B,b,N,W,_,_,_],
  [_,W,W,N,b,b,b,b,b,b,N,W,W,_,_,_],
  [_,_,_,_,N,b,N,_,N,b,N,_,_,_,_,_],
  [_,_,_,_,N,R,N,_,_,N,R,N,_,_,_,_],
  [_,_,_,_,N,R,N,_,N,R,W,R,N,_,_,_],
  [_,_,_,_,N,r,N,_,N,r,r,r,N,_,_,_],
];

const DROPLET_RUN_3: Sprite = [
  [_,_,_,_,_,_,_,N,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,N,L,N,_,_,_,_,_,_,_],
  [_,_,_,_,_,N,L,B,B,N,_,_,_,_,_,_],
  [_,_,_,_,N,L,B,B,B,b,N,_,_,_,_,_],
  [_,_,_,N,L,B,B,B,B,b,D,N,_,_,_,_],
  [_,_,N,L,B,N,N,B,N,N,b,D,N,_,_,_],
  [_,_,N,L,N,N,N,B,N,N,N,D,N,_,_,_],
  [_,_,N,B,N,W,N,B,N,W,N,b,N,_,_,_],
  [_,_,N,B,B,N,N,B,B,N,N,b,N,_,_,_],
  [_,_,N,B,B,B,N,N,B,B,b,b,N,_,_,_],
  [_,W,N,B,B,B,B,B,B,B,b,N,W,_,_,_],
  [_,W,W,N,b,b,b,b,b,b,N,W,W,_,_,_],
  [_,_,_,N,b,N,_,_,N,b,N,_,_,_,_,_],
  [_,_,N,R,R,N,_,N,R,R,N,_,_,_,_,_],
  [_,_,N,R,W,R,N,N,R,W,R,N,_,_,_,_],
  [_,_,N,r,r,r,N,N,r,r,r,N,_,_,_,_],
];

const DROPLET_JUMP: Sprite = [
  [_,_,_,_,_,_,_,N,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,N,L,N,_,_,_,_,_,_,_],
  [_,_,_,_,_,N,L,B,B,N,_,_,_,_,_,_],
  [_,_,_,_,N,L,B,B,B,b,N,_,_,_,_,_],
  [_,_,_,N,L,B,B,B,B,b,D,N,_,_,_,_],
  [_,_,N,L,B,N,N,B,N,N,b,D,N,_,_,_],
  [_,_,N,L,N,N,N,B,N,N,N,D,N,_,_,_],
  [_,_,N,B,N,W,N,B,N,W,N,b,N,_,_,_],
  [_,_,N,B,B,N,N,B,B,N,N,b,N,_,_,_],
  [_,_,N,B,B,B,N,N,B,B,b,b,N,_,_,_],
  [_,W,N,B,B,B,B,B,B,B,b,N,W,_,_,_],
  [_,W,W,N,b,b,b,b,b,b,N,W,W,_,_,_],
  [_,_,N,b,N,_,_,_,_,N,b,N,_,_,_,_],
  [_,N,R,R,N,_,_,_,N,R,R,N,_,_,_,_],
  [_,N,R,W,R,R,N,N,R,W,R,N,_,_,_,_],
  [_,_,N,r,r,r,N,N,r,r,N,_,_,_,_,_],
];

// ── Obstacle sprites ─────────────────────────────────────

const SERVER_RACK: Sprite = [
  [N,N,N,N,N,N,N,N,N,N,N,N,N,N],
  [N,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,N],
  [N,G2,G1,G1,G1,G1,G1,G1,G1,G1,G1,GL,G2,N],
  [N,G2,G1,G3,G3,G3,G3,G3,G3,G1,G1,RL,G2,N],
  [N,G2,G1,G1,G1,G1,G1,G1,G1,G1,G1,GL,G2,N],
  [N,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,N],
  [N,G2,G1,G1,G1,G1,G1,G1,G1,G1,G1,GL,G2,N],
  [N,G2,G1,G3,G3,G3,G3,G3,G3,G1,G1,GL,G2,N],
  [N,G2,G1,G1,G1,G1,G1,G1,G1,G1,G1,RL,G2,N],
  [N,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,N],
  [N,G2,G1,G1,G1,G1,G1,G1,G1,G1,G1,GL,G2,N],
  [N,G2,G1,G3,G3,G3,G3,G3,G3,G1,G1,GL,G2,N],
  [N,G2,G1,G3,G3,G3,G3,G3,G3,G1,G1,RL,G2,N],
  [N,G2,G1,G1,G1,G1,G1,G1,G1,G1,G1,GL,G2,N],
  [N,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,N],
  [N,G2,G1,G1,G1,G1,G1,G1,G1,G1,G1,GL,G2,N],
  [N,G2,G1,G3,G3,G3,G3,G3,G3,G1,G1,GL,G2,N],
  [N,G2,G1,G3,G3,G3,G3,G3,G3,G1,G1,RL,G2,N],
  [N,G2,G1,G1,G1,G1,G1,G1,G1,G1,G1,GL,G2,N],
  [N,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,G2,N],
  [N,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,N],
  [N,G1,_,_,_,G1,G1,G1,G1,_,_,_,G1,N],
  [N,G1,_,_,_,G1,G1,G1,G1,_,_,_,G1,N],
  [N,N,N,N,N,N,N,N,N,N,N,N,N,N],
];

const HOT_PIPE: Sprite = [
  [_,_,N,N,N,N,_,_],
  [_,N,Y1,Y1,Y1,Y1,N,_],
  [N,Y1,Y2,Y2,Y2,Y2,Y1,N],
  [N,Y1,Y2,Y1,Y1,Y2,Y1,N],
  [N,Y1,Y2,Y1,Y1,Y2,Y1,N],
  [N,Y1,Y2,Y1,Y1,Y2,Y1,N],
  [N,Y1,Y2,Y1,Y1,Y2,Y1,N],
  [N,Y1,Y2,Y2,Y2,Y2,Y1,N],
  [N,Y2,Y1,Y1,Y1,Y1,Y2,N],
  [N,Y1,Y2,Y2,Y2,Y2,Y1,N],
  [_,N,Y1,Y1,Y1,Y1,N,_],
  [_,_,N,N,N,N,_,_],
];

const GPU_BLOCK: Sprite = [
  [N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],
  [N,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,N],
  [N,P1,P2,P2,P2,P1,P2,P2,P2,P1,P2,P2,P2,P1,P1,N],
  [N,P1,P2,P3,P2,P1,P2,P3,P2,P1,P2,P3,P2,P1,P1,N],
  [N,P1,P2,P2,P2,P1,P2,P2,P2,P1,P2,P2,P2,P1,P1,N],
  [N,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,N],
  [N,P1,GL,P1,GL,P1,GL,P1,GL,P1,GL,P1,GL,P1,GL,N],
  [N,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,P1,N],
  [N,N,_,N,_,N,_,N,_,N,_,N,_,N,_,N],
  [N,N,_,N,_,N,_,N,_,N,_,N,_,N,_,N],
];

const CABLE_BUNDLE: Sprite = [
  [_,_,N,N,N,_],
  [_,N,CB,CK,CB,N],
  [N,CK,CB,CB,CK,N],
  [N,CB,CK,CK,CB,N],
  [N,CK,CB,CK,CB,N],
  [N,CB,CK,CB,CK,N],
  [N,CK,CB,CK,CB,N],
  [_,N,N,N,N,_],
];

const COLLECTIBLE_SPRITE: Sprite = [
  [_,_,_,N,N,_,_,_],
  [_,_,N,C,C,N,_,_],
  [_,N,C,C,C,C,N,_],
  [N,C,W,C,C,C,C,N],
  [N,C,C,C,C,C,C,N],
  [_,N,C,C,C,C,N,_],
  [_,_,N,c,c,N,_,_],
  [_,_,_,N,N,_,_,_],
];
/* eslint-enable */

const RUN_FRAMES = [DROPLET_RUN_0, DROPLET_RUN_1, DROPLET_RUN_2, DROPLET_RUN_3];

const OBSTACLE_SPRITES: Record<ObstacleType, Sprite> = {
  'server-rack': SERVER_RACK,
  'hot-pipe': HOT_PIPE,
  'gpu-block': GPU_BLOCK,
  'cable-bundle': CABLE_BUNDLE,
};

const OBSTACLE_SIZES: Record<ObstacleType, { w: number; h: number }> = {
  'server-rack':  { w: 14 * PIXEL_SCALE, h: 24 * PIXEL_SCALE },
  'hot-pipe':     { w: 8 * PIXEL_SCALE,  h: 12 * PIXEL_SCALE },
  'gpu-block':    { w: 16 * PIXEL_SCALE, h: 10 * PIXEL_SCALE },
  'cable-bundle': { w: 6 * PIXEL_SCALE,  h: 8 * PIXEL_SCALE },
};

const PLAYER_W = 16 * PIXEL_SCALE;
const PLAYER_H = 16 * PIXEL_SCALE;

// ── High score persistence ──────────────────────────────

export function loadHighScore(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val !== null) {
      const n = parseInt(val, 10);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    }
  } catch { /* localStorage unavailable */ }
  return 0;
}

export function saveHighScore(score: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(score));
  } catch { /* localStorage unavailable */ }
}

// ── Pure engine functions ────────────────────────────────

export function createGameState(): GameState {
  return {
    phase: 'start',
    score: 0,
    highScore: loadHighScore(),
    isNewHighScore: false,
    speed: BASE_SPEED,
    player: {
      x: PLAYER_X,
      y: GROUND_Y,
      vy: 0,
      grounded: true,
      frameIndex: 0,
      frameTick: 0,
    },
    obstacles: [],
    collectibles: [],
    backgroundOffset: 0,
    groundOffset: 0,
    nextObstacleIn: 1.5,
    nextCollectibleIn: 2.0,
    distance: 0,
  };
}

function jump(state: GameState) {
  if (state.player.grounded) {
    state.player.vy = JUMP_VY;
    state.player.grounded = false;
  }
}

export function updatePlayer(state: GameState, dt: number) {
  const p = state.player;

  if (!p.grounded) {
    p.vy += GRAVITY * dt;
    p.y += p.vy * dt;
  }

  if (p.y >= GROUND_Y) {
    p.y = GROUND_Y;
    p.vy = 0;
    p.grounded = true;
  }

  // Fall off obstacle when it scrolls past
  if (p.grounded && p.y < GROUND_Y) {
    const playerCenterX = p.x + PLAYER_W / 2;
    const supported = state.obstacles.some(obs => {
      const obsTop = GROUND_Y - obs.height;
      return Math.abs(p.y - obsTop) < 3
        && playerCenterX > obs.x
        && playerCenterX < obs.x + obs.width;
    });
    if (!supported) {
      p.grounded = false;
    }
  }

  if (!p.grounded) {
    p.frameIndex = 0;
  } else {
    p.frameTick += dt;
    if (p.frameTick > 0.1) {
      p.frameTick = 0;
      p.frameIndex = (p.frameIndex + 1) % 4;
    }
  }
}

function updateObstacles(state: GameState, dt: number) {
  for (const obs of state.obstacles) {
    obs.x -= state.speed * dt;
  }
  state.obstacles = state.obstacles.filter(o => o.x + o.width > -20);

  state.nextObstacleIn -= dt;
  if (state.nextObstacleIn <= 0) {
    spawnObstacle(state);
  }
}

function updateCollectibles(state: GameState, dt: number) {
  for (const col of state.collectibles) {
    col.x -= state.speed * dt;
  }
  state.collectibles = state.collectibles.filter(c => c.x > -30 && !c.collected);

  state.nextCollectibleIn -= dt;
  if (state.nextCollectibleIn <= 0) {
    spawnCollectible(state);
  }
}

export function aabbOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function checkCollisions(state: GameState) {
  const p = state.player;
  const px = p.x + HITBOX_INSET;
  const py = p.y - PLAYER_H + HITBOX_INSET;
  const pw = PLAYER_W - HITBOX_INSET * 2;
  const ph = PLAYER_H - HITBOX_INSET * 2;
  const playerBottom = py + ph;

  for (const obs of state.obstacles) {
    const ox = obs.x + 2;
    const oy = GROUND_Y - obs.height + 2;
    const ow = obs.width - 4;
    const oh = obs.height - 2;
    if (aabbOverlap(px, py, pw, ph, ox, oy, ow, oh)) {
      // Landing on top: falling downward and feet near obstacle top
      const penetration = playerBottom - oy;
      if (p.vy >= 0 && penetration > 0 && penetration < LANDING_THRESHOLD) {
        p.y = GROUND_Y - obs.height;
        p.vy = 0;
        p.grounded = true;
      } else {
        state.phase = 'dead';
        if (state.score > state.highScore) {
          state.highScore = state.score;
          state.isNewHighScore = true;
          saveHighScore(state.score);
        }
        return;
      }
    }
  }

  const colSize = 8 * PIXEL_SCALE;
  for (const col of state.collectibles) {
    if (!col.collected && aabbOverlap(px, py, pw, ph, col.x, col.y - colSize, colSize, colSize)) {
      col.collected = true;
      state.score += 10;
    }
  }
}

function advanceSpeed(state: GameState, dt: number) {
  state.speed = Math.min(MAX_SPEED, state.speed + SPEED_ACCEL * dt);
  state.distance += state.speed * dt;
  // Add distance-based score (1 point per 100px)
  state.score = Math.max(state.score, Math.floor(state.distance / 100) + state.collectibles.filter(c => c.collected).length * 10);
}

export function spawnObstacle(state: GameState) {
  const types: ObstacleType[] = ['server-rack', 'hot-pipe', 'gpu-block', 'cable-bundle'];
  const type = types[Math.floor(Math.random() * types.length)];
  const size = OBSTACLE_SIZES[type];

  state.obstacles.push({
    x: CANVAS_W + 20,
    width: size.w,
    height: size.h,
    type,
  });

  const gapBase = MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
  state.nextObstacleIn = gapBase * (BASE_SPEED / state.speed);
}

function spawnCollectible(state: GameState) {
  const heights = [GROUND_Y - 50, GROUND_Y - 90, GROUND_Y - 130];
  const y = heights[Math.floor(Math.random() * heights.length)];

  state.collectibles.push({
    x: CANVAS_W + 40,
    y,
    collected: false,
  });

  state.nextCollectibleIn = 1.5 + Math.random() * 2.0;
}

// ── Rendering ────────────────────────────────────────────

function drawSprite(ctx: CanvasRenderingContext2D, sprite: Sprite, x: number, y: number) {
  const s = PIXEL_SCALE;
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const color = sprite[row][col];
      if (color === null) continue;
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x + col * s), Math.floor(y + row * s), s, s);
    }
  }
}

function renderBackground(ctx: CanvasRenderingContext2D, state: GameState) {
  // Parallax server rack silhouettes in background (30% speed)
  const bgOffset = state.backgroundOffset % 200;
  ctx.fillStyle = '#0d1117';
  for (let i = -1; i < 6; i++) {
    const rx = i * 200 - bgOffset;
    // Rack silhouette
    ctx.fillRect(rx + 20, 40, 40, GROUND_Y - 40);
    ctx.fillRect(rx + 80, 60, 30, GROUND_Y - 60);
    ctx.fillRect(rx + 140, 50, 35, GROUND_Y - 50);
    // Tiny status LEDs
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(rx + 52, 55, 3, 3);
    ctx.fillRect(rx + 52, 75, 3, 3);
    ctx.fillRect(rx + 102, 75, 3, 3);
    ctx.fillStyle = '#0d1117';
  }

  // Ceiling cable tray
  ctx.fillStyle = '#141922';
  ctx.fillRect(0, 0, CANVAS_W, 10);
  ctx.fillStyle = '#1a2030';
  for (let x = (-(state.backgroundOffset * 0.5) % 40) - 40; x < CANVAS_W; x += 40) {
    ctx.fillRect(x, 6, 20, 4);
  }
}

function renderGround(ctx: CanvasRenderingContext2D, state: GameState) {
  const tileW = 48;
  const offset = state.groundOffset % tileW;

  // Ground surface line
  ctx.fillStyle = '#1a2636';
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 2);

  // Floor tiles
  ctx.fillStyle = '#0c1620';
  ctx.fillRect(0, GROUND_Y + 2, CANVAS_W, CANVAS_H - GROUND_Y - 2);

  // Tile grid lines
  ctx.fillStyle = '#162030';
  for (let x = -offset; x < CANVAS_W; x += tileW) {
    ctx.fillRect(x, GROUND_Y + 2, 1, CANVAS_H - GROUND_Y);
  }
  // Horizontal line
  ctx.fillRect(0, GROUND_Y + 25, CANVAS_W, 1);
}

function renderHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = '#0CE2F2';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${state.score}`, 16, 32);

  // High score
  if (state.highScore > 0) {
    ctx.fillStyle = '#5a6a7a';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText(`HI: ${state.highScore}`, 16, 48);
  }

  // Speed bar
  const barW = 100;
  const barX = CANVAS_W - barW - 20;
  const ratio = (state.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(barX, 16, barW, 8);
  const hue = 180 - ratio * 120;
  ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
  ctx.fillRect(barX, 16, barW * ratio, 8);

  ctx.fillStyle = '#5a6a7a';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('SPEED', CANVAS_W - 20, 12);
}

function renderStartScreen(ctx: CanvasRenderingContext2D, state: GameState) {
  // Background and ground still render
  ctx.fillStyle = '#0CE2F2';
  ctx.font = 'bold 36px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TENSIO', CANVAS_W / 2, 100);

  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#5a8a9a';
  ctx.fillText('KEEP THE DATACENTER COOL', CANVAS_W / 2, 125);

  if (state.highScore > 0) {
    ctx.fillStyle = '#5a6a7a';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(`HIGH SCORE: ${state.highScore}`, CANVAS_W / 2, 150);
  }

  // Draw static player
  drawSprite(ctx, DROPLET_RUN_0, CANVAS_W / 2 - PLAYER_W / 2, GROUND_Y - PLAYER_H);
}

function renderDeadScreen(ctx: CanvasRenderingContext2D, state: GameState) {
  // Dim overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = '#F25829';
  ctx.font = 'bold 32px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('THERMAL OVERLOAD', CANVAS_W / 2, 110);

  ctx.fillStyle = '#0CE2F2';
  ctx.font = '18px "JetBrains Mono", monospace';
  ctx.fillText(`SCORE: ${state.score}`, CANVAS_W / 2, 150);

  if (state.isNewHighScore) {
    ctx.fillStyle = '#FFD54F';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillText('NEW HIGH SCORE!', CANVAS_W / 2, 175);
  } else if (state.highScore > 0) {
    ctx.fillStyle = '#5a6a7a';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(`HIGH SCORE: ${state.highScore}`, CANVAS_W / 2, 175);
  }
}

function renderGame(ctx: CanvasRenderingContext2D, state: GameState) {
  // Clear
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Background
  renderBackground(ctx, state);

  // Ground
  renderGround(ctx, state);

  if (state.phase === 'start') {
    renderStartScreen(ctx, state);
    return;
  }

  // Collectibles
  const colSize = 8 * PIXEL_SCALE;
  for (const col of state.collectibles) {
    if (!col.collected) {
      drawSprite(ctx, COLLECTIBLE_SPRITE, col.x, col.y - colSize);
    }
  }

  // Obstacles
  for (const obs of state.obstacles) {
    const sprite = OBSTACLE_SPRITES[obs.type];
    drawSprite(ctx, sprite, obs.x, GROUND_Y - obs.height);
  }

  // Player
  const p = state.player;
  const playerSprite = p.grounded ? RUN_FRAMES[p.frameIndex] : DROPLET_JUMP;
  drawSprite(ctx, playerSprite, p.x, p.y - PLAYER_H);

  // HUD
  renderHUD(ctx, state);

  // Game over overlay
  if (state.phase === 'dead') {
    renderDeadScreen(ctx, state);
  }
}

// ── React Component ──────────────────────────────────────

interface TensioProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Tensio({ isOpen, onClose }: TensioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createGameState());
  const rafRef = useRef<number>(0);
  const [phase, setPhase] = useState<'start' | 'playing' | 'dead'>('start');

  const handleInput = useCallback(() => {
    const state = stateRef.current;
    if (state.phase === 'start' || state.phase === 'dead') {
      stateRef.current = createGameState();
      stateRef.current.phase = 'playing';
      setPhase('playing');
    } else if (state.phase === 'playing') {
      jump(stateRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    stateRef.current = createGameState();
    setPhase('start');

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleInput();
      }
      if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);

    let lastTime: number | null = null;

    const loop = (timestamp: number) => {
      const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0;
      lastTime = timestamp;

      const state = stateRef.current;

      if (state.phase === 'playing') {
        updatePlayer(state, dt);
        updateObstacles(state, dt);
        updateCollectibles(state, dt);
        checkCollisions(state);
        advanceSpeed(state, dt);

        // Scroll background
        state.backgroundOffset += state.speed * 0.3 * dt;
        state.groundOffset += state.speed * dt;

        if (state.phase === 'dead') {
          setPhase('dead');
        }
      } else if (state.phase === 'start') {
        // Slow scroll on start screen
        state.backgroundOffset += 30 * dt;
        state.groundOffset += 60 * dt;
      }

      renderGame(ctx, state);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, handleInput, onClose]);

  if (!isOpen) return null;

  return (
    <div className="game-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="game-container">
        <div className="game-header">
          <span>TENSIO</span>
          <button className="game-close-btn" onClick={onClose} aria-label="Exit game">
            ESC
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="game-canvas"
          onClick={handleInput}
          style={{ cursor: 'pointer' }}
          aria-label="Tensio game"
        />
        {(phase === 'start' || phase === 'dead') && (
          <p className="game-hint">
            {phase === 'start' ? 'PRESS SPACE OR CLICK TO START' : 'PRESS SPACE OR CLICK TO RESTART'}
          </p>
        )}
      </div>
    </div>
  );
}

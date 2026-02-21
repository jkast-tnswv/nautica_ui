import { render, screen, fireEvent } from '@testing-library/react';
import { Tensio, createGameState, updatePlayer, aabbOverlap, spawnObstacle, checkCollisions, loadHighScore, saveHighScore } from './Tensio';
import type { GameState } from './Tensio';

let mockCtx: Record<string, unknown>;

beforeEach(() => {
  mockCtx = {
    fillRect: vi.fn(),
    fillText: vi.fn(),
    clearRect: vi.fn(),
    fillStyle: '',
    font: '',
    textAlign: '',
    imageSmoothingEnabled: false,
  };
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Component tests ──────────────────────────────────────

describe('Tensio component', () => {
  it('renders nothing when isOpen=false', () => {
    const { container } = render(<Tensio isOpen={false} onClose={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders overlay and canvas when isOpen=true', () => {
    render(<Tensio isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('TENSIO')).toBeInTheDocument();
    expect(screen.getByLabelText('Tensio game')).toBeInTheDocument();
  });

  it('shows start hint initially', () => {
    render(<Tensio isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('PRESS SPACE OR CLICK TO START')).toBeInTheDocument();
  });

  it('calls onClose when ESC button clicked', () => {
    const onClose = vi.fn();
    render(<Tensio isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Exit game'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key pressed', () => {
    const onClose = vi.fn();
    render(<Tensio isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(window, { code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    render(<Tensio isOpen={true} onClose={onClose} />);
    // Click the overlay div (not the inner container)
    const overlay = document.querySelector('.game-overlay')!;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('starts game on Space key from start screen', () => {
    render(<Tensio isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('PRESS SPACE OR CLICK TO START')).toBeInTheDocument();
    fireEvent.keyDown(window, { code: 'Space' });
    expect(screen.queryByText('PRESS SPACE OR CLICK TO START')).not.toBeInTheDocument();
  });

  it('starts game on canvas click from start screen', () => {
    render(<Tensio isOpen={true} onClose={() => {}} />);
    fireEvent.click(screen.getByLabelText('Tensio game'));
    expect(screen.queryByText('PRESS SPACE OR CLICK TO START')).not.toBeInTheDocument();
  });

  it('initializes requestAnimationFrame loop when open', () => {
    render(<Tensio isOpen={true} onClose={() => {}} />);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('cancels animation frame on unmount', () => {
    const { unmount } = render(<Tensio isOpen={true} onClose={() => {}} />);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});

// ── Pure function tests ──────────────────────────────────

describe('createGameState', () => {
  it('creates state in start phase', () => {
    const state = createGameState();
    expect(state.phase).toBe('start');
  });

  it('initializes player at correct position', () => {
    const state = createGameState();
    expect(state.player.x).toBe(80);
    expect(state.player.grounded).toBe(true);
    expect(state.player.vy).toBe(0);
  });

  it('starts with no obstacles or collectibles', () => {
    const state = createGameState();
    expect(state.obstacles).toHaveLength(0);
    expect(state.collectibles).toHaveLength(0);
  });

  it('starts with base speed', () => {
    const state = createGameState();
    expect(state.speed).toBe(280);
  });
});

describe('updatePlayer', () => {
  it('applies gravity when not grounded', () => {
    const state = createGameState();
    state.phase = 'playing';
    state.player.grounded = false;
    state.player.vy = -500;
    state.player.y = 150;

    updatePlayer(state, 0.016);

    expect(state.player.vy).toBeGreaterThan(-500);
    expect(state.player.y).toBeLessThan(150);
  });

  it('clamps player to ground', () => {
    const state = createGameState();
    state.phase = 'playing';
    state.player.grounded = false;
    state.player.vy = 500;
    state.player.y = 300; // beyond ground

    updatePlayer(state, 0.016);

    expect(state.player.y).toBe(240); // GROUND_Y = 300 - 60
    expect(state.player.grounded).toBe(true);
    expect(state.player.vy).toBe(0);
  });

  it('advances animation frame on ground', () => {
    const state = createGameState();
    state.phase = 'playing';
    state.player.frameTick = 0.09;

    updatePlayer(state, 0.02); // tick becomes 0.11 > 0.1

    expect(state.player.frameIndex).toBe(1);
    expect(state.player.frameTick).toBe(0);
  });
});

describe('aabbOverlap', () => {
  it('returns true for overlapping boxes', () => {
    expect(aabbOverlap(0, 0, 10, 10, 5, 5, 10, 10)).toBe(true);
  });

  it('returns false for non-overlapping boxes', () => {
    expect(aabbOverlap(0, 0, 10, 10, 20, 20, 10, 10)).toBe(false);
  });

  it('returns false for adjacent boxes (no overlap)', () => {
    expect(aabbOverlap(0, 0, 10, 10, 10, 0, 10, 10)).toBe(false);
  });

  it('returns true for contained box', () => {
    expect(aabbOverlap(0, 0, 20, 20, 5, 5, 5, 5)).toBe(true);
  });
});

describe('checkCollisions', () => {
  it('lands player on top when falling onto obstacle', () => {
    const state = createGameState();
    state.phase = 'playing';
    // GROUND_Y = 240, obstacle height = 36 (hot-pipe: 12*3)
    // Obstacle top = 240 - 36 = 204
    state.obstacles.push({ x: 70, width: 24, height: 36, type: 'hot-pipe' });
    // Player falling, feet just past obstacle top (need p.y > 210 for hitbox overlap)
    state.player.y = 212;
    state.player.vy = 300;
    state.player.grounded = false;

    checkCollisions(state);

    expect(state.phase).toBe('playing');
    expect(state.player.grounded).toBe(true);
    expect(state.player.y).toBe(204); // standing on obstacle top
    expect(state.player.vy).toBe(0);
  });

  it('kills player on side collision with obstacle', () => {
    const state = createGameState();
    state.phase = 'playing';
    // Player on ground, obstacle overlaps horizontally
    state.obstacles.push({ x: 70, width: 42, height: 72, type: 'server-rack' });
    state.player.y = 240; // on ground
    state.player.vy = 0;
    state.player.grounded = true;

    checkCollisions(state);

    expect(state.phase).toBe('dead');
  });

  it('does not kill when jumping upward into obstacle bottom', () => {
    const state = createGameState();
    state.phase = 'playing';
    // Player moving upward (vy < 0) overlaps obstacle — should die (not a landing)
    state.obstacles.push({ x: 70, width: 48, height: 30, type: 'gpu-block' });
    state.player.y = 220; // hitbox bottom at 216, obstacle top at 212 → overlap
    state.player.vy = -400; // moving upward
    state.player.grounded = false;

    checkCollisions(state);

    expect(state.phase).toBe('dead');
  });
});

describe('updatePlayer obstacle support', () => {
  it('falls when obstacle scrolls past', () => {
    const state = createGameState();
    state.phase = 'playing';
    // Player standing on obstacle
    const obsHeight = 36;
    state.player.y = 240 - obsHeight; // on top of obstacle
    state.player.grounded = true;
    state.player.vy = 0;
    // Obstacle has scrolled past — player center (80+24=104) is right of obstacle
    state.obstacles.push({ x: 0, width: 24, height: obsHeight, type: 'hot-pipe' });

    updatePlayer(state, 0.016);

    expect(state.player.grounded).toBe(false);
  });

  it('stays grounded when still on obstacle', () => {
    const state = createGameState();
    state.phase = 'playing';
    const obsHeight = 36;
    state.player.y = 240 - obsHeight;
    state.player.grounded = true;
    state.player.vy = 0;
    // Obstacle still under player (player center ~104, obstacle spans 70-118)
    state.obstacles.push({ x: 70, width: 48, height: obsHeight, type: 'hot-pipe' });

    updatePlayer(state, 0.016);

    expect(state.player.grounded).toBe(true);
  });
});

describe('spawnObstacle', () => {
  it('adds obstacle off-screen right', () => {
    const state = createGameState();
    state.phase = 'playing';

    spawnObstacle(state);

    expect(state.obstacles).toHaveLength(1);
    expect(state.obstacles[0].x).toBeGreaterThanOrEqual(800);
  });

  it('schedules next obstacle spawn delay', () => {
    const state = createGameState();
    state.phase = 'playing';
    state.nextObstacleIn = 0;

    spawnObstacle(state);

    expect(state.nextObstacleIn).toBeGreaterThan(0);
  });

  it('obstacle has valid type', () => {
    const state = createGameState();
    const validTypes = ['server-rack', 'hot-pipe', 'gpu-block', 'cable-bundle'];

    spawnObstacle(state);

    expect(validTypes).toContain(state.obstacles[0].type);
  });
});

describe('high scores', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadHighScore returns 0 when no score saved', () => {
    expect(loadHighScore()).toBe(0);
  });

  it('saveHighScore persists and loadHighScore retrieves it', () => {
    saveHighScore(42);
    expect(loadHighScore()).toBe(42);
  });

  it('createGameState loads high score from localStorage', () => {
    saveHighScore(100);
    const state = createGameState();
    expect(state.highScore).toBe(100);
  });

  it('checkCollisions saves new high score on death', () => {
    const state = createGameState();
    state.phase = 'playing';
    state.score = 50;
    state.highScore = 30;
    // Set up a side collision (player on ground, obstacle overlaps)
    state.obstacles.push({ x: 70, width: 42, height: 72, type: 'server-rack' });
    state.player.y = 240;
    state.player.vy = 0;
    state.player.grounded = true;

    checkCollisions(state);

    expect(state.phase).toBe('dead');
    expect(state.isNewHighScore).toBe(true);
    expect(state.highScore).toBe(50);
    expect(loadHighScore()).toBe(50);
  });

  it('does not flag new high score when score is lower', () => {
    saveHighScore(100);
    const state = createGameState();
    state.phase = 'playing';
    state.score = 30;
    state.obstacles.push({ x: 70, width: 42, height: 72, type: 'server-rack' });
    state.player.y = 240;
    state.player.vy = 0;
    state.player.grounded = true;

    checkCollisions(state);

    expect(state.phase).toBe('dead');
    expect(state.isNewHighScore).toBe(false);
    expect(loadHighScore()).toBe(100); // unchanged
  });

  it('loadHighScore handles invalid localStorage value', () => {
    localStorage.setItem('tensio-high-score', 'garbage');
    expect(loadHighScore()).toBe(0);
  });
});

/** Total particle count — fixed to avoid GPU buffer reallocation. */
export const N = 2200;

/** 450 particles form each hand silhouette; the rest are ambient. */
export const N_HAND = 450;

export const SLIDE_COLORS: number[] = [
  0x00f3ff, // 0 Hero       — cyan
  0xf3a000, // 1 About      — gold
  0x4488ff, // 2 Projects   — electric blue
  0xbc13fe, // 3 Experience — purple
  0xff88ff, // 4 Contact    — soft pink-magenta
];

// ─── Starfield ────────────────────────────────────────────────────────────────

export const N_STARS     = 10000;
export const STAR_BOX_X  = 1500;
export const STAR_BOX_Y  = 900;
export const STAR_Z_NEAR = 700;    // wrap threshold — just past camera
export const STAR_Z_FAR  = -2200;  // far clip boundary

// ─── Wave grid (slide 3 — Experience) ────────────────────────────────────────

export const GRID_COLS    = 100;
export const GRID_ROWS    = 100;
export const GRID_SPACING = 8;    // world-units between particles
export const N_GRID       = GRID_COLS * GRID_ROWS; // 10 000

// ─── Text particles (slide 0 — Hero) ─────────────────────────────────────────

export const N_TEXT_MAX = 3500; // max sampled particles for "PRANAV DAS"

/**
 * Hand silhouette regions: [xMin, xMax, yMin, yMax, count].
 * Local space — fingers point in the +X direction, thumb points +Y.
 * Mirroring X gives the right hand.
 * Total = 140+35+50+55+55+50+65 = 450 = N_HAND.
 */
export const HAND_REGIONS: [number, number, number, number, number][] = [
  [-65,  10, -50,  48, 140], // palm
  [-90, -65, -22,  22,  35], // wrist
  [ 10,  72,  28,  52,  50], // pinky
  [ 10,  84,   5,  28,  55], // ring
  [ 10,  94, -18,   5,  55], // middle
  [ 10,  82, -44, -18,  50], // index
  [-50,  -8,  38,  90,  65], // thumb
];

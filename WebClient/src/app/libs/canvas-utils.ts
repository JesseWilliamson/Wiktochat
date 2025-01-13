import { Point } from '../models/types';

// Canvas dimensions and drawing settings
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 600;
export const PIXEL_SIZE = 5; // Size of each drawable cell
export const DEFAULT_COLOR = '#FFFFFF';


export function initializeGrid(): string[][] {
  return Array(CANVAS_WIDTH).fill(null).map(() =>
    Array(CANVAS_HEIGHT).fill(DEFAULT_COLOR)
  );
}

// Initialize or reset the canvas grid
export function initializeCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas dimensions
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // Clear with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

export function drawCell(x: number, y: number, ctx: CanvasRenderingContext2D, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(
    PIXEL_SIZE * x,
    PIXEL_SIZE * y,
    PIXEL_SIZE,
    PIXEL_SIZE,
  );
}

// Bresenham's line algorithm for smooth line interpolation
export function interpolatePoints(p1: Point, p2: Point): Point[] {
  const points: Point[] = [];
  const dx = Math.abs(p2.x - p1.x);
  const dy = Math.abs(p2.y - p1.y);
  const sx = p1.x < p2.x ? 1 : -1;
  const sy = p1.y < p2.y ? 1 : -1;
  let err = dx - dy;
  let x = p1.x;
  let y = p1.y;

  while (true) {
    points.push({ x, y });
    if (x === p2.x && y === p2.y) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  return points;
}

// Convert mouse coordinates to grid cell coordinates
export function getGridPosition(x: number, y: number): Point {
  const xCell = Math.floor(x / PIXEL_SIZE);
  const yCell = Math.floor(y / PIXEL_SIZE);
  return { x: xCell, y: yCell };
}

export const dimensions = {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  pixelSize: PIXEL_SIZE
};

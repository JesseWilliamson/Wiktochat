import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Point } from '../models/types';
// Represents a point on the canvas grid

@Component({
  selector: 'app-canvas',
  standalone: true,
  template: '<canvas #canvas class="canvas"></canvas>',
  styleUrls: ['./canvas.component.less']
})
export class CanvasComponent implements AfterViewInit {
  // Canvas dimensions and drawing settings
  private readonly CANVAS_WIDTH: number = 1200;
  private readonly CANVAS_HEIGHT: number = 600;
  private readonly PIXEL_SIZE: number = 5; // Size of each drawable cell
  
  // Drawing state
  private lastPos: Point | null = null; // Last drawn position for line interpolation
  private grid: string[][]; // 2D array of hex colors
  private isDrawing = false; // Whether user is currently drawing

  // Reference to the canvas DOM element
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  // Color input from parent component
  @Input() selectedColor = '#000000';

  constructor() {
    // Initialize empty grid with white color
    this.grid = Array(this.CANVAS_WIDTH).fill(null).map(() =>
      Array(this.CANVAS_HEIGHT).fill('#FFFFFF')
    );
  }

  ngAfterViewInit() {
    const canvas = this.canvas.nativeElement;
    this.drawGrid(canvas);

    // Setup mouse event listeners for drawing
    canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    canvas.addEventListener('mousemove', (e) => this.draw(e));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseleave', () => this.stopDrawing());
  }

  // Public method to clear the canvas
  clearGrid(): void {
    const canvas = this.canvas.nativeElement;
    this.drawGrid(canvas);
    // Reset grid to white
    this.grid = Array(this.CANVAS_WIDTH).fill(null).map(() =>
      Array(this.CANVAS_HEIGHT).fill('#FFFFFF')
    );
  }

  // Initialize or reset the canvas grid
  drawGrid(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = this.CANVAS_WIDTH;
    canvas.height = this.CANVAS_HEIGHT;

    // Clear with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
  }

  // Draw a single cell at the specified coordinates
  private drawCell(x: number, y: number, ctx: CanvasRenderingContext2D): void {
    // Store the hex color
    this.grid[x][y] = this.selectedColor;

    // Draw the cell
    ctx.fillStyle = this.selectedColor;
    ctx.fillRect(
      this.PIXEL_SIZE * x,
      this.PIXEL_SIZE * y,
      this.PIXEL_SIZE,
      this.PIXEL_SIZE,
    );
  }

  // Get the current grid state
  getGrid(): string[][] {
    return this.grid;
  }

  // Start drawing when mouse is pressed
  private startDrawing(e: MouseEvent): void {
    this.isDrawing = true;
    this.draw(e);
  }

  // Stop drawing when mouse is released or leaves canvas
  private stopDrawing(): void {
    this.isDrawing = false;
    this.lastPos = null;
  }

  // Bresenham's line algorithm for smooth line interpolation
  private interpolatePoints(p1: Point, p2: Point): Point[] {
    const points: Point[] = [];
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    const sx = p1.x < p2.x ? 1 : -1; // Step direction for x
    const sy = p1.y < p2.y ? 1 : -1; // Step direction for y
    let err = dx - dy;
    let x = p1.x;
    let y = p1.y;

    while (true) {
      points.push({ x, y });
      if (x === p2.x && y === p2.y) break;

      // Calculate next position
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
  private clampPixel(x: number, y: number): Point {
    const xCell = Math.floor(x / this.PIXEL_SIZE);
    const yCell = Math.floor(y / this.PIXEL_SIZE);
    return { x: xCell, y: yCell };
  }

  // Main drawing function called on mouse move
  private draw(e: MouseEvent): void {
    if (!this.isDrawing) return;

    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to grid coordinates
    const clampedPosition = this.clampPixel(x, y);
    
    // If we have a previous position, interpolate between them
    if (clampedPosition != this.lastPos && this.lastPos != null) {
      const points: Point[] = this.interpolatePoints(
        this.lastPos,
        clampedPosition,
      );
      // Draw all points along the line
      for (const point of points) {
        this.drawCell(point.x, point.y, ctx);
      }
    }
    this.lastPos = clampedPosition;

    // Draw at current position
    this.drawCell(this.clampPixel(x, y).x, this.clampPixel(x, y).y, ctx);
  }
}

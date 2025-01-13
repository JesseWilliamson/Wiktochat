import { Component, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Point } from '../models/types';
import * as CanvasUtils from '../libs/canvas-utils';

@Component({
  selector: 'app-canvas',
  standalone: true,
  template: '<canvas #canvas class="canvas"></canvas>',
  styleUrls: ['./canvas.component.less']
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @Input() selectedColor = '#000000';

  private lastPos: Point | null = null;
  private mouseDownFlag = false; // Flag for mouse down state, used for interpolation
  private grid = CanvasUtils.initializeGrid();

  ngAfterViewInit() {
    const canvas = this.canvas.nativeElement;
    CanvasUtils.initializeCanvas(canvas);

    // Setup mouse event listeners for drawing
    canvas.addEventListener('mousedown', (e) => this.mouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.draw(e));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseleave', () => this.stopDrawing());
  }

  clearGrid(): void {
    const canvas = this.canvas.nativeElement;
    CanvasUtils.initializeCanvas(canvas);
    // Reset grid to white
    this.grid = Array(CanvasUtils.CANVAS_WIDTH).fill(null).map(() =>
      Array(CanvasUtils.CANVAS_HEIGHT).fill('#FFFFFF')
    );
  }

  getGrid(): string[][] {
    return this.grid;
  }

  private mouseDown(e: MouseEvent): void {
    this.mouseDownFlag = true;
    this.draw(e);
  }

  private stopDrawing(): void {
    this.mouseDownFlag = false;
    this.lastPos = null;
  }

  private draw(e: MouseEvent): void {
    if (!this.mouseDownFlag) return;

    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to grid coordinates
    const clampedPosition = CanvasUtils.getGridPosition(x, y);

    // If we have a previous position, interpolate between them
    if (this.lastPos && clampedPosition !== this.lastPos) {
      const points = CanvasUtils.interpolatePoints(this.lastPos, clampedPosition);
      // Draw all points along the line
      for (const point of points) {
        this.drawCell(point.x, point.y, ctx);
      }
    }
    this.lastPos = clampedPosition;

    // Draw at current position
    const pos = CanvasUtils.getGridPosition(x, y);
    this.drawCell(pos.x, pos.y, ctx);
  }

  private drawCell(x: number, y: number, ctx: CanvasRenderingContext2D): void {
    // Store the hex color
    this.grid[x][y] = this.selectedColor;
    // Draw the cell
    CanvasUtils.drawCell(x, y, ctx, this.selectedColor);
  }
}

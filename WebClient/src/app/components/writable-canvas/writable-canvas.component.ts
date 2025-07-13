import { Component, ElementRef, input, signal, viewChild, afterNextRender } from '@angular/core';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-writable-canvas',
  standalone: true,
  templateUrl: './writable-canvas.component.html',
  styleUrl: './writable-canvas.component.less'
})
export class WritableCanvasComponent {
  protected canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  selectedColor = input('#000000');
  canvas_width = input(300);
  canvas_height = input(130);
  background_color = input('#FFFFFF');

  private readonly grid = signal<string[][]>([]);
  private lastPos: Point | null = null;
  private pointerDownFlag = false;

  constructor() {
    afterNextRender(() => {
      this.initializeCanvas();
    });
  }

  private initializeCanvas() {
    const canvasRef = this.canvas();
    if (!canvasRef) return;

    const canvas = canvasRef.nativeElement;
    canvas.width = this.canvas_width();
    canvas.height = this.canvas_height();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const initialGrid = Array(this.canvas_width())
      .fill(null)
      .map(() => Array<string>(this.canvas_height()).fill(this.background_color()));
    this.grid.set(initialGrid);

    document.addEventListener('pointerdown', (e) => this.pointerDown(e));
    document.addEventListener('pointermove', (e) => this.pointerMove(e));
    document.addEventListener('pointerup', () => this.pointerUp());
  }

  protected pointerDown(event: PointerEvent) {
    this.pointerDownFlag = true;
    this.draw(event);
  }

  protected pointerMove(event: PointerEvent) {
    if (!this.pointerDownFlag) {
      return;
    };
    this.draw(event);
  }

  protected pointerUp() {
    this.pointerDownFlag = false;
    this.lastPos = null;
  }

  clearGrid(): void {
    const ctx = this.canvas()?.nativeElement.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = this.background_color();
    ctx.fillRect(0, 0, this.canvas_width(), this.canvas_height());

    const newGrid = Array(this.canvas_width())
      .fill(null)
      .map(() => Array<string>(this.canvas_height()).fill(this.background_color()));
    this.grid.set(newGrid);
  }

  getGrid(): string[][] {
    try {
      return this.grid();
    } catch (error) {
      console.error('Error getting grid data:', error);
      return [];
    }
  }

  private getGridPosition(clientX: number, clientY: number): Point {
    const rect = this.canvas()?.nativeElement.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    // Calculate position relative to canvas using client coordinates
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const scaleX = this.canvas_width() / rect.width;
    const scaleY = this.canvas_height() / rect.height;

    return {
      x: Math.floor(x * scaleX),
      y: Math.floor(y * scaleY)
    };
  }

  private interpolatePoints(start: Point, end: Point): Point[] {
    const points: Point[] = [];
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    const sx = start.x < end.x ? 1 : -1;
    const sy = start.y < end.y ? 1 : -1;
    let err = dx - dy;

    let x = start.x;
    let y = start.y;

    while (true) {
      points.push({ x, y });

      if (x === end.x && y === end.y) break;

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

  private drawCell(x: number, y: number, color: string): void {
    if (x < 0 || y < 0 || x >= this.canvas_width() || y >= this.canvas_height()) return;

    const currentGrid = this.grid();
    const ctx = this.canvas()?.nativeElement.getContext('2d');
    if (!ctx) return;

    // Update grid data
    const newGrid = currentGrid.map((row, i) => {
      if (i === x) {
        return row.map((cell, j) => (j === y ? color : cell));
      }
      return row;
    });
    this.grid.set(newGrid);

    // Draw on canvas
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }

  private isPointInGrid(x: number, y: number): boolean {
    return x >= 0 && x < this.canvas_width() && y >= 0 && y < this.canvas_height();
  }

  private isPointerInCanvas(clientX: number, clientY: number): boolean {
    const position = this.getGridPosition(clientX, clientY);

    return (
      position.x >= 0 &&
      position.x < this.canvas_width() &&
      position.y >= 0 &&
      position.y < this.canvas_height()
    );
  }

  protected onPointerLeave(e: PointerEvent) {
    if (!this.lastPos) return;
    const position = this.getGridPosition(e.clientX, e.clientY);
    const points = this.interpolatePoints(this.lastPos, position);
    for (const point of points) {
      this.drawCell(point.x, point.y, this.selectedColor());
    }
  }

  private draw(e: PointerEvent): void {
    const position = this.getGridPosition(e.clientX, e.clientY);

    if (!this.isPointerInCanvas(e.clientX, e.clientY)) {
      this.lastPos = position;  // Store the calculated position even when outside
      return;
    }

    if (this.lastPos) {
      const points = this.interpolatePoints(this.lastPos, position);
      for (const point of points) {
        this.drawCell(point.x, point.y, this.selectedColor());
      }
    } else {
      this.drawCell(position.x, position.y, this.selectedColor());
    }

    this.lastPos = position;
  }
}

import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-trestle',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './trestle.component.html',
  styleUrl: './trestle.component.less'
})
export class TrestleComponent {
  private readonly CANVAS_WIDTH: number = 1200;  // Adjust size as needed
  private readonly CANVAS_HEIGHT: number = 600; // Adjust size as needed
  private readonly PIXEL_SIZE: number = 5;  // Add this constant
  private lastPos: Point | null = null;
  private grid: Int8Array[];

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  selectedColor: string = '#000000';  // Default color black

  constructor(
    private route: ActivatedRoute,
  ) {
    this.grid = new Array(this.CANVAS_WIDTH).fill(new Int8Array(this.CANVAS_HEIGHT))
    console.log(this.grid);

    this.route.params.subscribe(params => {
      const roomId = params['id'];
      console.log('Room ID:', roomId);
    })
  }
  private isDrawing = false;


  ngAfterViewInit() {
    console.log(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    const canvas = this.canvas.nativeElement;
    this.drawGrid(canvas);

    // Setup event listeners
    canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    canvas.addEventListener('mousemove', (e) => this.draw(e));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseleave', () => this.stopDrawing());
  }

  clearGrid(): void {
    const canvas = this.canvas.nativeElement;
    this.drawGrid(canvas);
  }

  drawGrid(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = this.CANVAS_WIDTH;
    canvas.height = this.CANVAS_HEIGHT;

    // Clear with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // // Draw grid with crisp lines
    // ctx.strokeStyle = '#f8f8f8';
    // for(let i = 0; i < this.CANVAS_WIDTH + this.PIXEL_SIZE; i += this.PIXEL_SIZE) {
    //     const x = Math.floor(i) + 0.5;
    //     ctx.beginPath();
    //     ctx.moveTo(x, 0);
    //     ctx.lineTo(x, this.CANVAS_HEIGHT);
    //     ctx.stroke();
    // }

    // for(let i = 0; i < this.CANVAS_HEIGHT + this.PIXEL_SIZE; i += this.PIXEL_SIZE) {
    //     const y = Math.floor(i) + 0.5;
    //     ctx.beginPath();
    //     ctx.moveTo(0, y);
    //     ctx.lineTo(this.CANVAS_WIDTH, y);
    //     ctx.stroke();
    // }
  }

  private startDrawing(e: MouseEvent): void {
    this.isDrawing = true;
    this.draw(e);
  }

  private stopDrawing(): void {
    this.isDrawing = false;
    this.lastPos = null;
  }

  private interpolatePoints(p1: Point, p2: Point): Point[] {
    const points: Point[] = [];

    // Get the differences and determine direction
    let dx = Math.abs(p2.x - p1.x);
    let dy = Math.abs(p2.y - p1.y);
    const sx = p1.x < p2.x ? 1 : -1;
    const sy = p1.y < p2.y ? 1 : -1;

    // Initialize error term
    let err = dx - dy;

    // Start from first point
    let x = p1.x;
    let y = p1.y;

    while (true) {
      points.push({x, y});

      // If we've reached the end point, break
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

  private clampPixel(x: number, y: number): Point {
    // Takes a pixel coordinate and returns the nearest cell
    let xCell = Math.floor(x/this.PIXEL_SIZE)
    let yCell = Math.floor(y/this.PIXEL_SIZE)
    // if either x or y cell is 0, print it and the original x and y
    if (xCell == 0 || yCell == 0) {
      console.log(x, y, xCell, yCell);
    }
    return {x: xCell, y: yCell};
  }

  private drawCell(x: number, y: number, ctx: CanvasRenderingContext2D): void {
    // Fills cell
    this.grid[x][y] = 1;
    console.log(this.grid)
    ctx.fillStyle = this.selectedColor;
    ctx.fillRect(this.PIXEL_SIZE * x, this.PIXEL_SIZE * y, this.PIXEL_SIZE, this.PIXEL_SIZE);
  }

  private draw(e: MouseEvent): void {

    if (!this.isDrawing) return;

    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clampedPosition = this.clampPixel(x, y);
    if (clampedPosition != this.lastPos && this.lastPos != null){
      let points: Point[] = this.interpolatePoints(this.lastPos, clampedPosition)
      for (let point of points) {
        this.drawCell(point.x, point.y, ctx);
      }
    }
    this.lastPos = clampedPosition;



    this.drawCell(this.clampPixel(x, y).x, this.clampPixel(x, y).y, ctx);
  }
}

import { Component, input } from '@angular/core';
import { BaseCanvasComponent } from '../base-canvas/base-canvas.component';
import { Point } from '../models/types';

@Component({
  selector: 'app-drawable-canvas',
  templateUrl: './drawable-canvas.component.html',
  standalone: true,
  imports: [BaseCanvasComponent]
})
export class DrawableCanvasComponent extends BaseCanvasComponent {
  selectedColor = input('#000000');

  private lastPos: Point | null = null;
  private mouseDownFlag = false;

  override afterInit() {
    super.afterInit();
  }

  mouseDown(e: PointerEvent): void {
    this.mouseDownFlag = true;
    this.draw(e);
  }

  stopDrawing(): void {
    this.mouseDownFlag = false;
    this.lastPos = null;
  }

  handleMouseLeave(e: PointerEvent): void {
    if (this.mouseDownFlag) {
      const finalPosition = this.getGridPosition(e.clientX, e.clientY);
      
      const clampedX = Math.max(0, Math.min(finalPosition.x, this.grid_cells_x() - 1));
      const clampedY = Math.max(0, Math.min(finalPosition.y, this.grid_cells_y() - 1));
      
      if (this.lastPos) {
        const points = this.interpolatePoints(this.lastPos, { x: clampedX, y: clampedY });
        for (const point of points) {
          if (point.x >= 0 && point.y >= 0 && 
              point.x < this.grid_cells_x() && point.y < this.grid_cells_y()) {
            this.drawCell(point.x, point.y, this.selectedColor());
          }
        }
      }
    }
    this.mouseDownFlag = false;
  }

  handleMouseEnter(e: PointerEvent): void {
    if (e.buttons === 1) {
      this.mouseDownFlag = true;
      this.lastPos = null;
      this.draw(e);
    }
  }

  draw(e: PointerEvent): void {
    if (!this.mouseDownFlag) return;

    const mainPosition = this.getGridPosition(e.clientX, e.clientY);
    
    const samples: Point[] = [mainPosition];
    
    if (Math.abs(e.movementX) > this.pixel_size_x || Math.abs(e.movementY) > this.pixel_size_y) {
      const steps = Math.max(
        Math.ceil(Math.abs(e.movementX) / this.pixel_size_x),
        Math.ceil(Math.abs(e.movementY) / this.pixel_size_y)
      );
      
      for (let i = 1; i < steps; i++) {
        const x = e.clientX - (e.movementX * (i / steps));
        const y = e.clientY - (e.movementY * (i / steps));
        samples.push(this.getGridPosition(x, y));
      }
    }

    for (const position of samples) {
      const clampedPosition = {
        x: Math.max(0, Math.min(position.x, this.grid_cells_x() - 1)),
        y: Math.max(0, Math.min(position.y, this.grid_cells_y() - 1))
      };

      if (this.lastPos && (clampedPosition.x !== this.lastPos.x || clampedPosition.y !== this.lastPos.y)) {
        const points = this.interpolatePoints(this.lastPos, clampedPosition);
        for (const point of points) {
          if (point.x >= 0 && point.y >= 0 && 
              point.x < this.grid_cells_x() && point.y < this.grid_cells_y()) {
            this.drawCell(point.x, point.y, this.selectedColor());
          }
        }
      }
      this.lastPos = clampedPosition;
      this.drawCell(clampedPosition.x, clampedPosition.y, this.selectedColor());
    }
  }

  private getGridPosition(clientX: number, clientY: number): Point {
    const rect = this.canvas()?.nativeElement.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const xCell = Math.floor(x / this.pixel_size_x);
    const yCell = Math.floor(y / this.pixel_size_y);
    return { x: xCell, y: yCell };
  }

  private interpolatePoints(p1: Point, p2: Point): Point[] {
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
}

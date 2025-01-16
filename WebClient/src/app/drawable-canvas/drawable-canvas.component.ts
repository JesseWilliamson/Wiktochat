import { Component, input } from '@angular/core';
import { BaseCanvasComponent } from '../base-canvas/base-canvas.component';
import { Point } from '../models/types';

@Component({
  selector: 'app-drawable-canvas',
  templateUrl: './drawable-canvas.component.html',
  styleUrls: ['./drawable-canvas.component.less'],
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

  mouseDown(e: MouseEvent): void {
    this.mouseDownFlag = true;
    this.draw(e);
  }

  stopDrawing(): void {
    this.mouseDownFlag = false;
    this.lastPos = null;
  }

  draw(e: MouseEvent): void {
    if (!this.mouseDownFlag) return;

    const clampedPosition = this.getGridPosition(e.clientX, e.clientY);

    if (this.lastPos && clampedPosition !== this.lastPos) {
      const points = this.interpolatePoints(this.lastPos, clampedPosition);
      for (const point of points) {
        this.drawCell(point.x, point.y, this.selectedColor());
      }
    }
    this.lastPos = clampedPosition;

    this.drawCell(clampedPosition.x, clampedPosition.y, this.selectedColor());
  }

  private getGridPosition(clientX: number, clientY: number): Point {
    // if (!this.state || !this.canvas()) return { x: 0, y: 0 };

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

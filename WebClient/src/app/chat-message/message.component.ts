import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GridMessage } from '../models/types';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './message.component.html',
  styleUrl: './message.component.less',
})
export class MessageComponent {
  @Input() message!: GridMessage;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  private readonly CANVAS_WIDTH = 1200;
  private readonly CANVAS_HEIGHT = 600;
  private PIXEL_SIZE = 1;

  ngAfterViewInit() {
    const canvas = this.canvas.nativeElement;
    // const parentWidth = this.parentWidth(this.canvas);
    console.log("width", canvas.width);

    // Calculate pixel size based on parent width
    this.PIXEL_SIZE = this.CANVAS_WIDTH / canvas.width;
    console.log("pixel size", this.PIXEL_SIZE);

    // Set canvas dimensions to match parent
    // canvas.width = parentWidth;
    // canvas.height = (parentWidth * this.CANVAS_HEIGHT) / this.CANVAS_WIDTH; // maintain aspect ratio

    this.drawGrid(canvas);
    this.drawGivenGrid(canvas, this.message.grid);
  }

  drawGivenGrid(canvas: HTMLCanvasElement, grid: string[][]) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw each pixel in the grid
    for (let x = 0; x < this.CANVAS_WIDTH; x++) {
      for (let y = 0; y < this.CANVAS_HEIGHT; y++) {
        ctx.fillStyle = grid[x][y];
        ctx.fillRect(
          x * this.PIXEL_SIZE,
          y * this.PIXEL_SIZE,
          this.PIXEL_SIZE,
          this.PIXEL_SIZE
        );
      }
    }
  }

  drawGrid(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = this.CANVAS_WIDTH;
    canvas.height = this.CANVAS_HEIGHT;

    // Clear with white background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
  }

  parentWidth(elemenReft: ElementRef): number {
    return elemenReft.nativeElement.parentElement.clientWidth
  }

  parentHeight(elemenReft: ElementRef): number {
    return elemenReft.nativeElement.parentElement.clientHeight
  }

  remainingWidth(elemenReft: ElementRef): number {
    const element = elemenReft.nativeElement;
    const parent = element.parentElement;
    return parent.clientWidth - element.clientWidth;
  }

}

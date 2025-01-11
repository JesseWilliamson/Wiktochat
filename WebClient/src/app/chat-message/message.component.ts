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

  private readonly CANVAS_WIDTH: number = 1200;
  private readonly CANVAS_HEIGHT: number = 600;
  private readonly PIXEL_SIZE: number = 1; // Size of each drawable cell

  ngAfterViewInit() {
    // TODO: Put draw logic into a util library to share between components
    // TODO: Adjust size of canvas to fit parent container
    const canvas = this.canvas.nativeElement;
    console.log(this.parentWidth(this.canvas));
    this.drawGrid(canvas);
    this.drawGivenGrid(canvas, this.message.grid);
  }

  drawGivenGrid(canvas: HTMLCanvasElement, grid: string[][]) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = this.CANVAS_WIDTH;
    canvas.height = this.CANVAS_HEIGHT;

    // Draw each pixel in the grid
    for (let x = 0; x < this.CANVAS_WIDTH; x++) {
      for (let y = 0; y < this.CANVAS_HEIGHT; y++) {
        ctx.fillStyle = grid[x][y];
        ctx.fillRect(x * this.PIXEL_SIZE, y * this.PIXEL_SIZE, this.PIXEL_SIZE, this.PIXEL_SIZE);
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
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
  }

  parentWidth(elemenReft: ElementRef): number {
    return elemenReft.nativeElement.parentElement.clientWidth
  }

  remainingWidth(elemenReft: ElementRef): number {
    const element = elemenReft.nativeElement;
    const parent = element.parentElement;
    return parent.clientWidth - element.clientWidth;
  }

}

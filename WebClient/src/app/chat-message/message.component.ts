import { Component, ViewChild, ElementRef, Input, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GridMessage } from '../models/types';
import * as CanvasUtils from '../libs/canvas-utils';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './message.component.html',
  styleUrl: './message.component.less',
})
export class MessageComponent implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @Input() message!: GridMessage;

  ngAfterViewInit() {
    const canvas = this.canvas.nativeElement;
    this.drawMessage(canvas);
  }

  private drawMessage(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize canvas with white background
    CanvasUtils.initializeCanvas(canvas);

    // Draw the grid from the message
    if (this.message.grid) {
      for (let x = 0; x < CanvasUtils.CANVAS_WIDTH; x++) {
        for (let y = 0; y < CanvasUtils.CANVAS_HEIGHT; y++) {
          const color = this.message.grid[x][y];
          if (color && color !== '#FFFFFF') {
            CanvasUtils.drawCell(x, y, ctx, color);
          }
        }
      }
    }
  }
}

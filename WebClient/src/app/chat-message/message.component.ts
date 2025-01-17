import { Component, input, viewChild, afterNextRender } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GridMessage } from '../models/types';
import { BaseCanvasComponent } from '../base-canvas/base-canvas.component';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [DatePipe, BaseCanvasComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.less',
})
export class MessageComponent {
  message = input.required<GridMessage>();
  canvas = viewChild<BaseCanvasComponent>('canvas');

  constructor() {
    afterNextRender(() => {
      this.initializeCanvas();
    });
  }

  private initializeCanvas() {
    // setTimeout(0) moves the initialization code to the next event loop tick.
    // TODO: Try to find a better solution for this
    setTimeout(() => {
      const canvasRef = this.canvas();
      const messageData = this.message();

      console.log('Message grid dimensions:', {
        width: messageData.grid.length,
        height: messageData.grid[0]?.length,
      });

      if (canvasRef && messageData.grid) {
        console.log('Drawing grid to canvas');
        canvasRef.drawGrid(messageData.grid);
      } else {
        console.error('Failed to initialize:', {
          hasCanvas: !!canvasRef,
          hasGrid: !!messageData.grid,
        });
      }
    }, 0);
  }
}

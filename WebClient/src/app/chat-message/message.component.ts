import { Component, input, viewChild, afterNextRender } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GridMessage } from '../models/types';
import { ReadonlyCanvasComponent } from '../readonly-canvas/readonly-canvas.component';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [DatePipe, ReadonlyCanvasComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.less',
})
export class MessageComponent {
  message = input.required<GridMessage>();

  constructor() {
  }
}

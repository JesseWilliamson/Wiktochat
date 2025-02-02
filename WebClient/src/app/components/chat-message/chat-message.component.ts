import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GridMessage } from '@app/components/models/types';
import { ReadonlyCanvasComponent } from '../readonly-canvas/readonly-canvas.component';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [DatePipe, ReadonlyCanvasComponent],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.less',
})
export class ChatMessageComponent {
  message = input.required<GridMessage>();
}

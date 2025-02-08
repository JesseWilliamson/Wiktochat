import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GridMessage } from '@app/components/models/types';
import { ReadonlyCanvasComponent } from '../readonly-canvas/readonly-canvas.component';

@Component({
  selector: 'app-chat-message-thumbnail',
  standalone: true,
  imports: [DatePipe, ReadonlyCanvasComponent],
  templateUrl: './chat-message-thumbnail.component.html',
  styleUrl: './chat-message-thumbnail.component.less',
})
export class ChatMessageThumbnailComponent {
  message = input.required<GridMessage>();
}

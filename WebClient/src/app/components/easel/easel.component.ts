import { Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler.service';
import { OutGoingGridMessage } from '@app/components/models/types';
import { WritableCanvasComponent } from '../writable-canvas/writable-canvas.component';

@Component({
  selector: 'app-easel',
  standalone: true,
  imports: [FormsModule, WritableCanvasComponent],
  templateUrl: './easel.component.html',
  styleUrl: './easel.component.less',
})
export class EaselComponent {
  private readonly canvas = viewChild(WritableCanvasComponent);
  selectedColor = '#000000';

  constructor(protected chatService: ChatMessageHandlerService) {}

  clearGrid() {
    this.canvas()?.clearGrid();
  }

  sendGrid() {
    try {
      console.log('Sending grid message...');
      const gridData = this.canvas()?.getGrid() ?? [];
      
      // Ensure grid data is valid
      if (!gridData.length || !gridData[0]?.length) {
        console.warn('Cannot send empty grid');
        return;
      }
      
      console.log('Grid data:', {
        width: gridData.length,
        height: gridData[0]?.length || 0,
        sample: gridData[0]?.[0] || 'empty'
      });
      
      const message: OutGoingGridMessage = {
        grid: gridData,
        type: 'grid_message',
        senderSessionId: this.chatService['sessionId'],
        timeStamp: new Date()
      };
      
      console.log('Sending message:', message);
      this.chatService.sendMessage(message);
      console.log('Message sent successfully');
      
      // Clear the canvas after sending
      this.clearGrid();
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Show error to user using a notification service
    }
  }
}

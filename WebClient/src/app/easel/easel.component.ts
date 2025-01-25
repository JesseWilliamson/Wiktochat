import { Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler.service';
import { WritableCanvasComponent } from './writable-canvas/writable-canvas.component';

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
    console.log('Sending grid');
    console.log(this.canvas());
    console.log(this.canvas()?.getGrid());
    const gridData = this.canvas()?.getGrid() ?? [];
    this.chatService.sendGridMessage(gridData);
  }
}

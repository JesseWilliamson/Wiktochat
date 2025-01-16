import { Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DrawableCanvasComponent } from '../drawable-canvas/drawable-canvas.component';
import { ChatMessageHandlerService } from '../chat-message-handler.service';
import { MessageComponent } from "../chat-message/message.component";

@Component({
  selector: 'app-easel',
  standalone: true,
  imports: [FormsModule, DrawableCanvasComponent, MessageComponent],
  templateUrl: './easel.component.html',
  styleUrl: './easel.component.less',
})
export class EaselComponent {
  private canvas = viewChild(DrawableCanvasComponent);
  selectedColor = '#000000';

  constructor(private chatService: ChatMessageHandlerService) {}

  clearGrid() {
    this.canvas()?.clearGrid();
  }

  sendGrid() {
    const gridData = this.canvas()?.getGrid() ?? [];
    this.chatService.sendGridMessage(gridData);
  }
}

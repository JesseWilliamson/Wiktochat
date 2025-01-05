import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanvasComponent } from '../canvas/canvas.component';
import { ChatMessageHandlerService } from '../chat-message-handler.service';
import { GridMessage } from '../models/types';

@Component({
  selector: 'app-easel',
  standalone: true,
  imports: [FormsModule, CanvasComponent],
  templateUrl: './easel.component.html',
  styleUrl: './easel.component.less',
})
export class EaselComponent {
  @ViewChild(CanvasComponent) canvas!: CanvasComponent;
  selectedColor = '#000000';

  constructor(private chatService: ChatMessageHandlerService) {}

  clearGrid() {
    this.canvas.clearGrid();
  }

  sendGrid() {
    const gridData = this.canvas.getGrid();
    this.chatService.sendGrid(gridData);
  }
}

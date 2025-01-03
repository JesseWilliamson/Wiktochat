import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-easel',
  standalone: true,
  imports: [FormsModule, CanvasComponent],
  templateUrl: './easel.component.html',
  styleUrl: './easel.component.less',
})
export class EaselComponent {
  @ViewChild(CanvasComponent) canvas!: CanvasComponent;
  selectedColor = '#000000'; // Add default color

  clearGrid() {
    this.canvas.clearGrid();
  }

  sendGrid() {
    // Implement send functionality
    console.log('Sending grid...');
  }
}

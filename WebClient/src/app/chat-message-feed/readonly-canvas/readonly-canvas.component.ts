import { Component, ElementRef, input, viewChild, afterNextRender, computed } from '@angular/core';

@Component({
  selector: 'app-readonly-canvas',
  standalone: true,
  templateUrl: './readonly-canvas.component.html',
  styleUrl: './readonly-canvas.component.less'
})
export class ReadonlyCanvasComponent {
  protected canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  grid = input.required<string[][]>();
  canvas_width = computed(() => this.grid().length);
  canvas_height = computed(() => this.grid()[0].length);
  background_color = input('#FFFFFF');

  constructor() {
    afterNextRender(() => {
      this.initializeCanvas();
    });
  }

  private initializeCanvas() {
    const canvasRef = this.canvas();
    if (!canvasRef) return;

    const canvas = canvasRef.nativeElement;
    canvas.width = this.canvas_width();
    canvas.height = this.canvas_height();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.drawGrid();
  }

  private drawGrid() {
    this.grid().forEach((row, x) => {
      row.forEach((color, y) => {
        this.drawCell(x, y, color);
      });
    });
  }

  private drawCell(x: number, y: number, color: string) {
    const canvasRef = this.canvas();
    if (!canvasRef) return;
    const canvas = canvasRef.nativeElement;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }

  getGrid(): string[][] {
    return this.grid();
  }
}

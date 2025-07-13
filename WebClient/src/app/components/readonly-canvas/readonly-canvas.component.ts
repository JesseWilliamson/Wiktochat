import { Component, ElementRef, input, viewChild, afterNextRender, computed, effect } from '@angular/core';

// Default empty grid to prevent runtime errors
const DEFAULT_GRID: string[][] = [];

// Default color when an invalid color is provided
const DEFAULT_COLOR = '#FFFFFF';

// Helper function to validate color string
function isValidColor(color: string): boolean {
  if (!color) return false;
  // Check if it's a valid hex color
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

@Component({
  selector: 'app-readonly-canvas',
  standalone: true,
  templateUrl: './readonly-canvas.component.html',
  styleUrl: './readonly-canvas.component.less'
})
export class ReadonlyCanvasComponent {
  protected canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  
  // Make grid optional with a default empty array
  grid = input<string[][]>(DEFAULT_GRID);
  
  // Add null checks to computed properties
  canvas_width = computed(() => this.grid()?.length || 0);
  canvas_height = computed(() => this.grid()?.[0]?.length || 0);
  background_color = input(DEFAULT_COLOR);

  constructor() {
    // Reinitialize canvas when grid changes
    effect(() => {
      if (this.grid()) {
        this.scheduleCanvasUpdate();
      }
    });
  }

  private scheduleCanvasUpdate() {
    // Use requestAnimationFrame to batch multiple updates
    requestAnimationFrame(() => this.initializeCanvas());
  }

  private initializeCanvas() {
    const canvasRef = this.canvas();
    if (!canvasRef) return;

    const canvas = canvasRef.nativeElement;
    const width = this.canvas_width();
    const height = this.canvas_height();

    // Skip if canvas has zero dimensions
    if (width === 0 || height === 0) return;

    canvas.width = width;
    canvas.height = height;

    // Clear the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with background color
    ctx.fillStyle = this.background_color();
    ctx.fillRect(0, 0, width, height);

    this.drawGrid();
  }

  private drawGrid() {
    const grid = this.grid();
    if (!grid || !Array.isArray(grid)) return;

    try {
      grid.forEach((row, x) => {
        if (!Array.isArray(row)) return;
        row.forEach((color, y) => {
          this.drawCell(x, y, color);
        });
      });
    } catch (error) {
      console.error('Error drawing grid:', error);
    }
  }

  private drawCell(x: number, y: number, color: string) {
    if (x < 0 || y < 0) return;
    if (!isValidColor(color)) {
      console.warn(`Invalid color format: "${color}". Using default color.`);
      color = DEFAULT_COLOR;
    }

    const canvasRef = this.canvas();
    if (!canvasRef) return;
    
    const canvas = canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    } catch (error) {
      console.error('Error drawing cell:', { x, y, color, error });
    }
  }

  getGrid(): string[][] {
    // Return a deep copy to prevent external modifications
    return JSON.parse(JSON.stringify(this.grid() || []));
  }
}

import { Component, ElementRef, afterNextRender, input, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-base-canvas',
  templateUrl: './base-canvas.component.html',
  standalone: true
})
export class BaseCanvasComponent {
  protected canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  grid_cells_x = input(300);
  grid_cells_y = input(150);
  pixel_size_x = 0;
  pixel_size_y = 0;
  canvas_width = input(1200);
  canvas_height = input(600);
  protected grid = signal<string[][]>([]);

  protected readonly DEFAULT_COLOR = '#FFFFFF';

  constructor() {
    afterNextRender(() => {
      this.afterInit();
    });
  }

  protected afterInit() {
    const canvasRef = this.canvas();
    if (!canvasRef) return;

    const canvas = canvasRef.nativeElement;

    canvas.width = this.canvas_width();
    canvas.height = this.canvas_height();

    // add border radius
    // canvas.style.borderRadius = '20px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Initialize grid
    const initialGrid = Array(this.grid_cells_x()).fill(null).map(() =>
      Array(this.grid_cells_y()).fill(this.DEFAULT_COLOR)
    );
    this.grid.set(initialGrid);

    this.pixel_size_x = canvas.width / this.grid_cells_x();
    this.pixel_size_y = canvas.height / this.grid_cells_y();
  }

  protected drawCell(x: number, y: number, color: string): void {
    const currentGrid = this.grid();
    if (!currentGrid || !this.canvas()) return;

    const ctx = this.canvas()?.nativeElement.getContext('2d');
    if (!ctx) return;

    // Create a new grid array with the updated cell
    const newGrid = currentGrid.map((row, i) => {
      if (i === x) {
        return row.map((cell, j) => j === y ? color : cell);
      }
      return row;
    });

    // Update the signal with the new grid
    this.grid.set(newGrid);

    // Draw on canvas
    ctx.fillStyle = color;
    ctx.fillRect(
      this.pixel_size_x * x,
      this.pixel_size_y * y,
      this.pixel_size_x,
      this.pixel_size_y,
    );
  }

  public drawGrid(grid: string[][]): void {
    const currentGrid = this.grid();
    if (!currentGrid) {
      console.error('No current grid available');
      return;
    }

    console.log('Drawing grid with dimensions:', {
      gridWidth: grid.length,
      gridHeight: grid[0]?.length,
      currentGridWidth: currentGrid.length,
      currentGridHeight: currentGrid[0]?.length
    });

    // Create a new grid with the updated cells
    const newGrid = currentGrid.map((row, x) =>
      row.map((cell, y) => {
        const color = grid[x]?.[y];
        if (color && color !== this.DEFAULT_COLOR) {
          // Draw on canvas
          const ctx = this.canvas()?.nativeElement.getContext('2d');
          if (ctx) {
            ctx.fillStyle = color;
            ctx.fillRect(
              this.pixel_size_x * x,
              this.pixel_size_y * y,
              this.pixel_size_x,
              this.pixel_size_y,
            );
          }
          return color;
        }
        return cell;
      })
    );

    // Update the signal with the new grid
    this.grid.set(newGrid);
  }

  getGrid(): string[][] {
    return this.grid();
  }

  clearGrid(): void {
    if (!this.canvas()) return;
    const canvas = this.canvas()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset grid
    const newGrid = Array(this.grid_cells_x()).fill(null).map(() =>
      Array(this.grid_cells_y()).fill(this.DEFAULT_COLOR)
    );
    this.grid.set(newGrid);
  }
}

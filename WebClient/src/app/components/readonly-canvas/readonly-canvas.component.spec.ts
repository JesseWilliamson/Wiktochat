import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadonlyCanvasComponent } from './readonly-canvas.component';

describe('ReadonlyCanvasComponent', () => {
  let component: ReadonlyCanvasComponent;
  let fixture: ComponentFixture<ReadonlyCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadonlyCanvasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadonlyCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

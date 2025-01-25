import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WritableCanvasComponent } from './writable-canvas.component';

describe('WritableCanvasComponent', () => {
  let component: WritableCanvasComponent;
  let fixture: ComponentFixture<WritableCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WritableCanvasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WritableCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EaselComponent } from './easel.component';

describe('TrestleComponent', () => {
  let component: EaselComponent;
  let fixture: ComponentFixture<EaselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EaselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EaselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

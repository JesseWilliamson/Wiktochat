import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrestleComponent } from './trestle.component';

describe('TrestleComponent', () => {
  let component: TrestleComponent;
  let fixture: ComponentFixture<TrestleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrestleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrestleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

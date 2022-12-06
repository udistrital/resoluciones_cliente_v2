import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RpSelectorComponent } from './rp-selector.component';

describe('RpSelectorComponent', () => {
  let component: RpSelectorComponent;
  let fixture: ComponentFixture<RpSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RpSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RpSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

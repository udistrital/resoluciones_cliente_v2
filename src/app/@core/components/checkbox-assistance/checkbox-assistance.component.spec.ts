import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxAssistanceComponent } from './checkbox-assistance.component';

describe('CheckboxAssistanceComponent', () => {
  let component: CheckboxAssistanceComponent;
  let fixture: ComponentFixture<CheckboxAssistanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckboxAssistanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxAssistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsAssistanceComponent } from './actions-assistance.component';

describe('ActionsAssistanceComponent', () => {
  let component: ActionsAssistanceComponent;
  let fixture: ComponentFixture<ActionsAssistanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionsAssistanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionsAssistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

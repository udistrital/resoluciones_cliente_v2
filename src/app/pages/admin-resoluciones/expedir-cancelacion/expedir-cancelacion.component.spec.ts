import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpedirCancelacionComponent } from './expedir-cancelacion.component';

describe('ExpedirCancelacionComponent', () => {
  let component: ExpedirCancelacionComponent;
  let fixture: ComponentFixture<ExpedirCancelacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpedirCancelacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpedirCancelacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

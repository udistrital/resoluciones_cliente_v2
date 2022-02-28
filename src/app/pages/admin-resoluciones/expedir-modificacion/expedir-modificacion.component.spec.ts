import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpedirModificacionComponent } from './expedir-modificacion.component';

describe('ExpedirModificacionComponent', () => {
  let component: ExpedirModificacionComponent;
  let fixture: ComponentFixture<ExpedirModificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpedirModificacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpedirModificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

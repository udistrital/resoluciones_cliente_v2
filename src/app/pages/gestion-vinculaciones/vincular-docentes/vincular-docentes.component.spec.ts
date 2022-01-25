import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VincularDocentesComponent } from './vincular-docentes.component';

describe('VincularDocentesComponent', () => {
  let component: VincularDocentesComponent;
  let fixture: ComponentFixture<VincularDocentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VincularDocentesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VincularDocentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

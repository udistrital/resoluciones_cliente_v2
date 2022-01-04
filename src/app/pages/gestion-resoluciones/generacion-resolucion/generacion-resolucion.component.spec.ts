import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneracionResolucionComponent } from './generacion-resolucion.component';

describe('GeneracionResolucionComponent', () => {
  let component: GeneracionResolucionComponent;
  let fixture: ComponentFixture<GeneracionResolucionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneracionResolucionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneracionResolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

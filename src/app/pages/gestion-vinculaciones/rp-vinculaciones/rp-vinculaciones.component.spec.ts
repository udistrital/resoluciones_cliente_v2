import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RpVinculacionesComponent } from './rp-vinculaciones.component';

describe('RpVinculacionesComponent', () => {
  let component: RpVinculacionesComponent;
  let fixture: ComponentFixture<RpVinculacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RpVinculacionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RpVinculacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VinculacionRpComponent } from './vinculacion-rp.component';

describe('VinculacionRpComponent', () => {
  let component: VinculacionRpComponent;
  let fixture: ComponentFixture<VinculacionRpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VinculacionRpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VinculacionRpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

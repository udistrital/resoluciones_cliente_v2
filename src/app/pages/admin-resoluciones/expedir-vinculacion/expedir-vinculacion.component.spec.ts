import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpedirVinculacionComponent } from './expedir-vinculacion.component';

describe('ExpedirVinculacionComponent', () => {
  let component: ExpedirVinculacionComponent;
  let fixture: ComponentFixture<ExpedirVinculacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpedirVinculacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpedirVinculacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

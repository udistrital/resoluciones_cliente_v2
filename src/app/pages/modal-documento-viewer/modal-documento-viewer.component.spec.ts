import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDocumentoViewerComponent } from './modal-documento-viewer.component';

describe('ModalDocumentoViewerComponent', () => {
  let component: ModalDocumentoViewerComponent;
  let fixture: ComponentFixture<ModalDocumentoViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDocumentoViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDocumentoViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

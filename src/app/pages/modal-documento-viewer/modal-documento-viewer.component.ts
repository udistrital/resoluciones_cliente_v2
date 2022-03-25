import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-documento-viewer',
  templateUrl: './modal-documento-viewer.component.html',
})
export class ModalDocumentoViewerComponent implements OnInit {

  documento: any;

  constructor(
    public dialogRef: MatDialogRef<ModalDocumentoViewerComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  ngOnInit(): void {
    this.documento = this.data;
  }

}

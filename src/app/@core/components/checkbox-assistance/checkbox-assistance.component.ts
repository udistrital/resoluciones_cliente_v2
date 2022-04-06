import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-checkbox-assistance',
  templateUrl: './checkbox-assistance.component.html',
  styleUrls: ['./checkbox-assistance.component.scss']
})
export class CheckboxAssistanceComponent {

  @Input() rowData: any;
  modulo: any;

  @Output() icon: EventEmitter<any> = new EventEmitter();
  @Output() data: EventEmitter<any> = new EventEmitter();

  constructor() { }

  iconoSelect(event, rowData): void {
    this.icon.emit(event);
    this.data.emit(rowData);
  }

}

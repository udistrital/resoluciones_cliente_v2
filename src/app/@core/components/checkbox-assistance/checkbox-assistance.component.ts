import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-checkbox-assistance',
  templateUrl: './checkbox-assistance.component.html',
  styleUrls: ['./checkbox-assistance.component.scss']
})
export class CheckboxAssistanceComponent implements OnInit {

  @Input() rowData: any;
  modulo: any;

  @Output() icon: EventEmitter<any> = new EventEmitter();
  @Output() data: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {

  }

  iconoSelect(event, rowData) {
    this.icon.emit(event);
    this.data.emit(rowData);
  }

}

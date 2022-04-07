import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Resoluciones } from '../../models/resoluciones';


@Component({
  selector: 'app-actions-assistance',
  templateUrl: './actions-assistance.component.html',
  styleUrls: ['./actions-assistance.component.scss']
})
export class ActionsAssistanceComponent {

  @Input() rowData: Resoluciones;
  modulo: string;

  @Output() icon: EventEmitter<string> = new EventEmitter();
  @Output() data: EventEmitter<Resoluciones> = new EventEmitter();

  constructor() { }

  iconoSelect(event: string): void {
    this.icon.emit(event);
    this.data.emit(this.rowData);
  }

}

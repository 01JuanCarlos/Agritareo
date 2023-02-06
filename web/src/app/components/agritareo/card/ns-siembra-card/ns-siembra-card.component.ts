import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ns-siembra-card',
  templateUrl: './ns-siembra-card.component.html',
  styleUrls: ['./ns-siembra-card.component.scss']
})
export class NsSiembraCardComponent implements OnInit {
  @Input() codigo = 'codigo';
  @Input() estado: boolean;
  @Input() cultivo = 'cultivo';
  @Input() variedad = 'variedad';
  @Input() area = 'area';
  @Input() coordenadas = [];
  @Input() fechainicio = [];
  @Input() fechafin = [];
  @Input() lat = [];
  @Input() lng = [];

  @Output() setupClick = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }



}

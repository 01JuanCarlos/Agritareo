import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { select } from '@ngrx/store';
import * as moment from 'moment';
import { WeatherService } from './weather.service';

@Component({
  selector: 'ns-weather',
  templateUrl: './ns-weather.component.html',
  styleUrls: ['./ns-weather.component.scss'],
  providers: [
    WeatherService,
  ]
})
export class NsWeatherComponent implements OnInit, OnChanges {
  @Input() fundo: number;

  cel;
  myDate;
  selectedWeather;
  selectedFecha;
  temperature;
  constructor(
    private weatherService: WeatherService,
  ) { }


  ngOnInit(): void {
    this.getClimate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.fundo.currentValue) {
      this.getClimate();
    }

  }

  getClimate() {
    this.weatherService.getClima(this.fundo).subscribe(response => {
      const [lastItem] = response.slice(-1);

      this.selectedWeather = lastItem;
      const temp = this.selectedWeather?.temperatura
      const c = temp - 273
      this.cel = c + 'ºC'
      this.myDate = moment(this.selectedWeather.dia).format('LL');
    });
  }


}

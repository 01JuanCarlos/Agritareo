import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import * as moment from 'moment';
import { WeatherWidgetService } from './weather-widget.service';

@Component({
  selector: 'ns-weather-widget',
  templateUrl: './ns-weather-widget.component.html',
  styleUrls: ['./ns-weather-widget.component.scss'],
  providers: [
    WeatherWidgetService,
  ]
})
export class NsWeatherWidgetComponent implements OnInit, OnChanges {

  @Input() fundo: number;
  modalShow = false;

  cel;
  myDate;
  selectedWeather;
  selectedFecha;
  temperature;
  constructor(
    public http: AppHttpClientService,
    private weatherWidgetService: WeatherWidgetService,
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
    this.weatherWidgetService.getClima(this.fundo).subscribe(response => {
      const [lastItem] = response.slice(-1);

      this.selectedWeather = lastItem;
      const temp = this.selectedWeather?.temperatura
      const c = temp - 273
      this.cel = c + 'ºC'
      this.myDate = moment(this.selectedWeather.dia).format('LL');
    });
  }

}

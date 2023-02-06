import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NsWeatherWidgetComponent } from './ns-weather-widget.component';

describe('NsWeatherWidgetComponent', () => {
  let component: NsWeatherWidgetComponent;
  let fixture: ComponentFixture<NsWeatherWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NsWeatherWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NsWeatherWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

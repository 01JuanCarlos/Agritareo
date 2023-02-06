import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepClimaGraficoComponent } from './rep-clima-grafico.component';

describe('RepClimaGraficoComponent', () => {
  let component: RepClimaGraficoComponent;
  let fixture: ComponentFixture<RepClimaGraficoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepClimaGraficoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepClimaGraficoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

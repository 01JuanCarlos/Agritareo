import { Validators } from '@angular/forms';

export const CANTIDAD_NIVELES_EVALUACION = [
  {
    id: '',
    numero_nivel: 1,
    nombre_nivel: [{ value: 'Bajo', disabled: true }, Validators.required],
    rango_inicio: ['', [Validators.required]],
    rango_fin: ['', [Validators.required]],
  },
  {
    id: '',
    numero_nivel: 2,
    nombre_nivel: [{ value: 'Medio', disabled: true }, Validators.required],
    rango_inicio: ['', [Validators.required]],
    rango_fin: ['', [Validators.required]],
  },
  {
    id: '',
    numero_nivel: 3,
    nombre_nivel: [{ value: 'Alto', disabled: true }, Validators.required],
    rango_inicio: ['', [Validators.required]],
    rango_fin: ['', [Validators.required]],
  },
];

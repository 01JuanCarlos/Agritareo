import { isDevMode } from '@angular/core';
import { MapFactory } from '../classes';
import { UniqueID } from '../utils';
import { SetMetadata } from './metadata.decorator';

export const enum DocumentType {
  /** Alias of MOVEMENT */
  MOV,
  /** Alias of MAINTAINER */
  MNT
}


export const enum DocumentLayout {
  BASIC,
  TREE,
  ADJUST,
}

export interface NsDocumentOptions {
  readonly id?: string;
  /** Titulo personalizado del documento. */
  title?: string;
  /** Icono personalizado del documento */
  icon?: string;
  /** Ruta el Api que controla el CRUD de los formularios del documento. */
  readonly formControllerId?: string;
  /** ComponentId de la tabla que muestra los registros del documento. */
  readonly tableComponentId?: string;
  /** Identificador de la ventana */
  readonly viewComponentId?: string;
  /** Ruta disponible */
  readonly viewURL?: string;
  
  readonly viewURLZONAS?: string;

  readonly viewURLCULTIVOS?: string;
  
  /** Id de la sección del formulario de donde se envia la petición al Api */
  formTagId?: string;
  /** Inidica que el componente es de tipo documento, */
  readonly isDocument?: boolean;
  /** Indica que el componente es de tipo movimiento. */
  isMovement?: boolean;
  /** Indica que el componente es de tipo lista. */
  isList?: boolean;
  /** Indica que el componente es de tipo mantenedor */
  isMaintainer?: boolean;
  /** Indica que el componente se almacena para mostrarse en el layout */
  tracking?: boolean;
  /** Estilo con el que se muestra el documento. */
  layout?: DocumentLayout;
  /** Tipo de documento */
  type?: DocumentType;
  /** Cambiar el tipo de actualización de los campos del documento */
  partialUpdate?: boolean;
  /** Almancena la información el localstorage o indexdb para envitar que se pierda al actualizar. */
  readonly persistent?: boolean;
}


const initialOptions: NsDocumentOptions = {
  layout: DocumentLayout.BASIC,
  tracking: true,
  isDocument: true,
  isMovement: false,
  type: DocumentType.MNT,
  persistent: false,
};

export function NsDocument(options?: NsDocumentOptions) {
  return (target: any) => {
    const id = isDevMode() ? target.name : UniqueID();
    options = { ...initialOptions, ...options };

    if (options?.isMovement) {
      options.type = DocumentType.MOV;
      options.partialUpdate = false;
    }

    if (options?.isMaintainer) {
      options.type = DocumentType.MNT;
    }

    options.isMovement = DocumentType.MOV === options?.type;
    options.isMaintainer = DocumentType.MNT === options?.type;
    options.partialUpdate = options.partialUpdate ?? options.isMaintainer;

    SetMetadata(target, { id, ...options });

    if (false !== options?.tracking) {
      MapFactory.addComponent(id, target);
    }
  };
}

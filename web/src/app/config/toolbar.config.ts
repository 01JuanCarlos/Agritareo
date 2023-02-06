import { ToolAction } from './toolbar-actions';
import { ToolSection } from '@app/common/interfaces/toolbar.interface';

export const toolbarConfig: { [key: string]: ToolSection } = {};
export const FORM_TOOLBAR_ID = 'form.layout::toolbar';
export const TABLE_TOOLBAR_ID = 'table::toolbar';
export const TREE_TOOLBAR_ID = 'tree::toolbar';

// Barra de herramientas del formulario.
toolbarConfig[FORM_TOOLBAR_ID] = {
  id: FORM_TOOLBAR_ID,
  order: 1,
  toolGroup: [
    {
      tools: [
        {
          title: 'Nuevo',
          icon: 'icon-file-plus',
          action: ToolAction.NEW
        },
        {
          title: 'Editar',
          icon: 'far fa-edit',
          action: ToolAction.EDIT,
          settings: {
            iconStyle: {
              fontSize: '0.89rem'
            }
          }
        },
        {
          title: 'Cancelar',
          icon: 'icon-cross2',
          action: ToolAction.CANCEL
        },
        {
          title: 'Guardar',
          icon: 'icon-floppy-disk',
          action: ToolAction.SAVE
        },
        {
          title: 'Anular',
          icon: 'icon-file-minus',
          action: ToolAction.DISABLE,
          settings: {
            class: 'text-danger'
          },
        },
        {
          title: 'Activar',
          icon: 'icon-file-check',
          action: ToolAction.ENABLE,
          settings: {
            class: 'text-success'
          }
        },
        {
          title: 'Eliminar',
          icon: 'icon-trash',
          action: ToolAction.DELETE
        }
      ]
    },
    {
      tools: [
        {
          icon: 'icon-file-play',
          title: 'Previsualizar',
          action: ToolAction.PREVIEW
        },
        {
          icon: 'icon-printer2',
          title: 'Imprimir',
          action: ToolAction.PRINT
        },
        {
          icon: 'icon-notebook',
          title: 'Notas',
          action: ToolAction.FRM_NOTES
        },
        {
          title: 'Email',
          icon: 'icon-envelop3',
          action: ToolAction.FRM_EMAIL
        }
      ]
    }
  ]
};

// Barra de herramientas de la tabla.
toolbarConfig[TABLE_TOOLBAR_ID] = {
  id: TABLE_TOOLBAR_ID,
  order: 0,
  searchable: true,
  toolGroup: [
    {
      tools: [
        {
          title: 'Nuevo',
          icon: 'icon-file-plus',
          action: ToolAction.NEW
        },
        {
          title: 'Editar',
          icon: 'icon-pencil6',
          action: ToolAction.EDIT
        },
        {
          title: 'Eliminar',
          icon: 'icon-trash',
          action: ToolAction.DELETE
        },
        {
          title: 'Actualizar',
          icon: 'icon-reload-alt',
          action: ToolAction.UPDATE
        },
        {
          icon: 'icon-printer2',
          title: 'Imprimir',
          action: ToolAction.PRINT
        },
        {
          icon: 'icon-file-play',
          title: 'Previsualizar',
          action: ToolAction.PREVIEW
        },
        {
          title: 'Exportar',
          icon: 'icon-file-download',
          action: ToolAction.DOWNLOAD,
          items: [
            {
              icon: 'icon-file-pdf',
              title: 'PDF',
              action: ToolAction.DOWNLOAD_PDF,
              enabled: true
            },
            {
              icon: 'icon-file-excel',
              title: 'Excel',
              action: ToolAction.DOWNLOAD_EXCEL,
              enabled: true
            },
            {
              icon: 'icon-file-text2',
              title: 'Csv',
              action: ToolAction.DOWNLOAD_CSV,
              enabled: true
            }
          ]
        }
      ]
    }
  ]
};

toolbarConfig[TREE_TOOLBAR_ID] = {
  id: TREE_TOOLBAR_ID,
  order: 0,
  toolGroup: [
    {
      tools: [
        {
          title: 'Nuevo',
          icon: 'icon-folder-plus',
          action: ToolAction.NEW
        },
        // {
        //   title: 'Editar',
        //   icon: 'icon-folder-search',
        //   action: ToolBarActions.EDIT
        // },
        {
          title: 'Borrar',
          icon: 'icon-folder-minus',
          action: ToolAction.DELETE
        },
        {
          title: 'Expandir',
          icon: 'icon-folder5',
          action: ToolAction.EXPAND
        },
        {
          title: 'Contraer',
          icon: 'icon-folder-open2',
          action: ToolAction.COLLAPSE
        },
      ]
    }
  ]
};

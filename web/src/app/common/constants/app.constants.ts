export const APP_URL = 'http://nisira.com.pe'; // enviroment.apiBaseAddr

// NOTE: HEADERS
export const TRANSACTION_HEADER = 'Ns-Transaction';
export const MODULE_ID_HEADER = 'Ns-Module-Id';
export const COMPONENT_ID_HEADER = 'Ns-Component-Id';
export const CORPORATION_ID_HEADER = 'Ns-Corporation-Id';

// NOTE: DATA FIELDS
export const ID_FIELD = 'id';
export const TRANSACTION_UID_FIELD = 'transaction_uid';
export const COMPANY_ID_FIELD = 'idempresa';


// NOTE: API PATH
export const LOGOUT_API_PATH = '/logout';
export const LOGIN_API_PATH = '/login';
export const INITIAL_API_PATH = '/initial';
export const APP_API_PATH = '/app';
export const DATAHANDLER_API_PATH = '/data-handler';
export const MNTHANDLER_API_PATH = '/mnthandler';
export const MAIL_API_PATH = '/mail';
export const NOTE_API_PATH = '/note';
export const LOG_API_PATH = '/log';
export const LABEL_API_PATH = '/label'; // TODO: DEL
export const SUGGEST_API_PATH = '/suggest';
export const RENEW_API_PATH = '/renew-session';
export const DOCSERIE_API_PATH = '/document-serie';
export const COMPFORMAT_API_PATH = '/components-format';
export const REPORT_API_PATH = '/report';
export const USER_PREFERENCES_API_PATH = '/user-preferences';
export const PROFILE_API_PATH = '/profile';
export const FORM_MODULES_API_PATH = '/form-modules';
export const PASWORD_API_PATH = '/pwd';
export const ACTIVITY_API_PATH = '/activity';
export const UPDATE_COMPONENT_PATH = '/component';
export const FORMAT_PREVIEW_PATH = '/print-format-preview';
export const USER_API_PATH = '/user';
export const PRIVILEGE_API_PATH = '/privileges';
export const PROFILE_PRIVILEGES_API_PATH = '/permissionsprofile';

export const SEARCH_TOP_BAR = '/search';


// NOTE: WEB URL
export const LOGIN_PATH = '/login';
export const SECURE_PATH = '/agritareo';
export const REPORT_LIST_PATH = '/report-list';
export const REPORT_DESIGNER_PATH = '/report-designer';

// NOTE: HTTP PARAMS
export const PARAM_ID = 'id';
export const PARAM_TYPE_ID = 'tid';
export const PARAM_PROC_ID = 'pid';
export const PARAM_COMPONENT_ID = 'cid';
export const PARAM_ACTION_ID = 'aid';

export enum COMPONENT_TYPE { TABLE, FORM, LIST }
export enum COMPONENT_ACTION_TYPE { PRINT }

export const DEFAULT = {
  LANGUAGE: 'es',
  THEME: 'light',
  NAV_THEME: 'default',
  FONT_SIZE: 'medium',
  TEXT_DIR: 'ltr'
};

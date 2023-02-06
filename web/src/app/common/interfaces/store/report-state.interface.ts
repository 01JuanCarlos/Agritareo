export interface ReportParam {
  id: string;
  name: string;
  type: string;
  eval: boolean;
  editable: boolean;
  showOnlyNameType: boolean;
}

export interface ReportState {
  report: string;
  parameters: ReportParam[];
}

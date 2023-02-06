import { WindowsTab } from '../win-tab.interface';

export interface WinTabState {
  updateWinTab: number;
  winTab: { [key: string]: WindowsTab };
}

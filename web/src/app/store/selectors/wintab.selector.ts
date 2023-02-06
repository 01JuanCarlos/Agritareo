import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WinTabState } from '@app/common/interfaces/store';
import { WindowsTab } from '@app/common/interfaces';

export const getWinTabState = createFeatureSelector<WinTabState>('winTabs');

export const GetWindows = createSelector(getWinTabState, data => {
  const wintab = data.winTab ?? {};
  const keys = Object.keys(wintab);
  const result = keys.reduce((a, k) => a.concat(k in wintab ? wintab[k] : []), []);
  return result as WindowsTab[];
});

export const GetActiveWindow = createSelector(GetWindows, data => {
  const wtab = (data ?? []).find(e => e.active === true);
  return { ...wtab };
});

export const GetWindowTabs = createSelector(GetActiveWindow, data => {
  return data.tabs;
});

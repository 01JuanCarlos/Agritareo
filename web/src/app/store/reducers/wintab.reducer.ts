import { WinTab } from '@app/common/classes/wintabs.class';
import { Action, createReducer, on } from '@ngrx/store';
import { WinTabActions } from '../actions';
import { initialWinTabState } from '../state/wintab.state';
import { WinTabState } from '@app/common/interfaces/store';
import { WinTabDir } from '@app/common/enums';

export const reducer = createReducer<WinTabState>(
  initialWinTabState,

  on(WinTabActions.RegisterWindow, (state, { id, url, title, icon, layout }) => {
    return UpdateWinTab(state, winTab => {
      winTab.resetWindowStatus();
      if (winTab.windowExists(id) || !winTab) {
        winTab.updateWindowStatus(id, true);
      } else {
        winTab.registerWindow(id, url, layout, title, icon);
      }
    });
  }),

  on(WinTabActions.AddTab, (state, { wid, cid, options }) => {
    return UpdateWinTab(state, winTab => {
      winTab.resetTabs(wid, WinTabDir.LEFT);
      winTab.addTab(wid, cid, options);
    });
  }),

  on(WinTabActions.SetActiveTab, (state, { wid, tid, dir, status }) => {
    return UpdateWinTab(state, winTab => {
      winTab.resetTabs(wid, dir);
      winTab.changeActiveTab(wid, tid, status);
    });
  }),

  on(WinTabActions.ResetActiveTabs, (state, { wid, dir }) => {
    return UpdateWinTab(state, winTab => {
      winTab.resetTabs(wid, dir);
    });
  }),

  on(WinTabActions.RemoveTab, (state, { wid, tid }) => {
    return UpdateWinTab(state, winTab => {
      winTab.removeTab(wid, tid);
    });
  }),
  on(WinTabActions.SetDirTab, (state, { wid, tid, dir }) => {
    return UpdateWinTab(state, winTab => {
      winTab.changeTabDir(wid, tid, dir);
    });
  }),

  on(WinTabActions.SaveTabState, (s, { wid, tid, state }) => {
    const winTab = new WinTab(s);
    winTab.saveTabState(wid, tid, state);
    return s;
  }),

  on(WinTabActions.RemoveAllTabs, (state, { wid, dir }) => {
    return UpdateWinTab(state, winTab => {
      winTab.removeAllTabs(wid, dir);
    });
  }),

  on(WinTabActions.UpdateTabMode, (state, { wid, tid, mode }) => {
    return UpdateWinTab(state, wintab => {
      wintab.updateTabMode(wid, tid, mode);
    });
  }),

  on(WinTabActions.UpdateTab, (state, { wid, tid, tab }) => {
    return UpdateWinTab(state, wintab => {
      wintab.updateTab(wid, tid, tab);
    });
  })

);

function UpdateWinTab(state: WinTabState, callback: (winTab: WinTab) => void) {
  const winTab = new WinTab(state);
  callback(winTab);
  return winTab.update();
}

export function winTabsReducers(state: WinTabState | undefined, action: Action) {
  return reducer(state, action);
}

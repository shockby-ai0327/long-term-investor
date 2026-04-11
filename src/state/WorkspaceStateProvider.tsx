import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { eventReminders, mockSnapshot, stocks, watchlistItems } from "../data/mockData";
import { buildInvestmentWorkbench, type InvestmentWorkbench, type MarketOverviewState, type StockAnalysisRecord } from "../domain/investment";
import type {
  ReminderProgress,
  ReminderWorkspaceState,
  WatchlistFocusState,
  WatchlistWorkspaceState,
  WatchlistItem,
  WorkspaceReminder,
  WorkspaceWatchlistItem
} from "../types/investment";

const reminderWorkspaceStorageKey = "long-term-investor:reminder-workspace";
const watchlistWorkspaceStorageKey = "long-term-investor:watchlist-workspace";

interface WorkspaceStateContextValue {
  reminders: WorkspaceReminder[];
  watchlist: WorkspaceWatchlistItem[];
  watchlistUniverse: WorkspaceWatchlistItem[];
  analyses: StockAnalysisRecord[];
  trackedAnalyses: StockAnalysisRecord[];
  alerts: InvestmentWorkbench["alerts"];
  alertHistory: InvestmentWorkbench["alertHistory"];
  marketOverview: MarketOverviewState;
  setReminderProgress: (id: string, progress: ReminderProgress) => void;
  resetReminderProgress: (id: string) => void;
  setWatchlistFocus: (id: string, focusState: WatchlistFocusState) => void;
  toggleWatchlistTracking: (id: string) => void;
  getAnalysisByTicker: (ticker?: string) => StockAnalysisRecord;
}

const WorkspaceStateContext = createContext<WorkspaceStateContextValue | null>(null);

function getTodayStamp() {
  return mockSnapshot.asOfDate;
}

function parseStorage<T>(value: string | null) {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getDefaultFocusState(item: WatchlistItem): WatchlistFocusState {
  if (item.valuationSignal === "偏高觀察") {
    return "等待估值";
  }

  if (item.tags.includes("等待財報")) {
    return "等待事件";
  }

  if (item.tags.includes("研究中")) {
    return "本輪研究";
  }

  return "維持追蹤";
}

export function WorkspaceStateProvider({ children }: { children: ReactNode }) {
  const [reminderStateMap, setReminderStateMap] = useState<Record<string, ReminderWorkspaceState>>({});
  const [watchlistStateMap, setWatchlistStateMap] = useState<Record<string, WatchlistWorkspaceState>>({});

  useEffect(() => {
    const parsedReminderState = parseStorage<Record<string, ReminderWorkspaceState>>(
      window.localStorage.getItem(reminderWorkspaceStorageKey)
    );
    const parsedWatchlistState = parseStorage<Record<string, WatchlistWorkspaceState>>(
      window.localStorage.getItem(watchlistWorkspaceStorageKey)
    );

    if (parsedReminderState) {
      setReminderStateMap(parsedReminderState);
    }

    if (parsedWatchlistState) {
      setWatchlistStateMap(parsedWatchlistState);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(reminderWorkspaceStorageKey, JSON.stringify(reminderStateMap));
  }, [reminderStateMap]);

  useEffect(() => {
    window.localStorage.setItem(watchlistWorkspaceStorageKey, JSON.stringify(watchlistStateMap));
  }, [watchlistStateMap]);

  const reminders = useMemo<WorkspaceReminder[]>(
    () =>
      eventReminders.map((reminder) => {
        const localState = reminderStateMap[reminder.id];

        return {
          ...reminder,
          progress: localState?.progress ?? "未開始",
          progressUpdatedAt: localState?.updatedAt
        };
      }),
    [reminderStateMap]
  );

  const watchlistUniverse = useMemo<WorkspaceWatchlistItem[]>(
    () =>
      watchlistItems.map((item) => {
        const localState = watchlistStateMap[item.id];

        return {
          ...item,
          focusState: localState?.focusState ?? getDefaultFocusState(item),
          focusUpdatedAt: localState?.updatedAt,
          isTracked: localState?.isTracked ?? true,
          trackingUpdatedAt: localState?.trackingUpdatedAt
        };
      }),
    [watchlistStateMap]
  );

  const watchlist = useMemo(
    () => watchlistUniverse.filter((item) => item.isTracked),
    [watchlistUniverse]
  );

  const investmentWorkbench = useMemo(
    () =>
      buildInvestmentWorkbench(
        {
          stocks,
          reminders,
          watchlist: watchlistUniverse
        },
        mockSnapshot.asOfDate
      ),
    [reminders, watchlistUniverse]
  );

  function setReminderProgress(id: string, progress: ReminderProgress) {
    setReminderStateMap((current) => ({
      ...current,
      [id]: {
        progress,
        updatedAt: getTodayStamp()
      }
    }));
  }

  function resetReminderProgress(id: string) {
    setReminderStateMap((current) => {
      const nextState = { ...current };
      delete nextState[id];
      return nextState;
    });
  }

  function setWatchlistFocus(id: string, focusState: WatchlistFocusState) {
    setWatchlistStateMap((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? {}),
        focusState,
        updatedAt: getTodayStamp()
      }
    }));
  }

  function toggleWatchlistTracking(id: string) {
    setWatchlistStateMap((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? {}),
        focusState: current[id]?.focusState ?? getDefaultFocusState(watchlistItems.find((item) => item.id === id)!),
        updatedAt: current[id]?.updatedAt ?? getTodayStamp(),
        isTracked: !(current[id]?.isTracked ?? true),
        trackingUpdatedAt: getTodayStamp()
      }
    }));
  }

  function getAnalysisByTicker(ticker?: string) {
    return investmentWorkbench.analysesByTicker[ticker ?? ""] ?? investmentWorkbench.analyses[0];
  }

  return (
    <WorkspaceStateContext.Provider
      value={{
        reminders,
        watchlist,
        watchlistUniverse,
        analyses: investmentWorkbench.analyses,
        trackedAnalyses: investmentWorkbench.trackedAnalyses,
        alerts: investmentWorkbench.alerts,
        alertHistory: investmentWorkbench.alertHistory,
        marketOverview: investmentWorkbench.marketOverview,
        setReminderProgress,
        resetReminderProgress,
        setWatchlistFocus,
        toggleWatchlistTracking,
        getAnalysisByTicker
      }}
    >
      {children}
    </WorkspaceStateContext.Provider>
  );
}

export function useWorkspaceState() {
  const context = useContext(WorkspaceStateContext);

  if (!context) {
    throw new Error("useWorkspaceState must be used within WorkspaceStateProvider");
  }

  return context;
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { eventReminders, watchlistItems } from "../data/mockData";
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
  setReminderProgress: (id: string, progress: ReminderProgress) => void;
  resetReminderProgress: (id: string) => void;
  setWatchlistFocus: (id: string, focusState: WatchlistFocusState) => void;
}

const WorkspaceStateContext = createContext<WorkspaceStateContextValue | null>(null);

function getTodayStamp() {
  return new Date().toISOString().slice(0, 10);
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

  const watchlist = useMemo<WorkspaceWatchlistItem[]>(
    () =>
      watchlistItems.map((item) => {
        const localState = watchlistStateMap[item.id];

        return {
          ...item,
          focusState: localState?.focusState ?? getDefaultFocusState(item),
          focusUpdatedAt: localState?.updatedAt
        };
      }),
    [watchlistStateMap]
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
        focusState,
        updatedAt: getTodayStamp()
      }
    }));
  }

  return (
    <WorkspaceStateContext.Provider
      value={{
        reminders,
        watchlist,
        setReminderProgress,
        resetReminderProgress,
        setWatchlistFocus
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

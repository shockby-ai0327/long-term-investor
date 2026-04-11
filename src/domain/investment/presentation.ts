import type {
  ActionDisplay,
  ConfidenceDisplay,
  ConfidenceLevel,
  DecisionAction,
  DisplayTone,
  FitDisplay,
  FitLevel,
  MarketEnvironmentDisplay,
  MarketEnvironmentState,
  ValuationDisplay,
  ValuationStatus
} from "./types";

function makeDisplay<T extends string>(label: string, tone: DisplayTone, description?: string) {
  return { label, tone, description: description ?? label };
}

export function getActionDisplay(action: DecisionAction): ActionDisplay {
  switch (action) {
    case "study_now":
      return makeDisplay("值得研究", "positive", "符合研究門檻，可進入 thesis 與細部判斷。");
    case "watch":
      return makeDisplay("持續觀察", "neutral", "有跟蹤價值，但暫時不升級成優先研究。");
    case "wait_for_better_price":
      return makeDisplay("等更佳價格", "negative", "公司品質不差，但價格還不夠友善。");
    case "avoid_for_now":
      return makeDisplay("先不要碰", "negative", "分數或風險條件不支持新增研究。");
    default:
      return makeDisplay("資料不足", "info", "先補資料，再決定是否進入研究。");
  }
}

export function getValuationDisplay(status: ValuationStatus): ValuationDisplay {
  switch (status) {
    case "undervalued":
      return makeDisplay("低估 / 可關注", "positive", "估值已進入 target zone 或合理低檔。");
    case "fair":
      return makeDisplay("合理 / 觀察", "neutral", "估值可接受，但還需要看品質與風險。");
    case "overvalued":
      return makeDisplay("高估 / 先不追價", "negative", "估值高於合理帶。");
    default:
      return makeDisplay("資料不足", "info", "缺少足夠估值資料。");
  }
}

export function getConfidenceDisplay(level: ConfidenceLevel): ConfidenceDisplay {
  if (level === "high") return { label: "高", tone: "positive" };
  if (level === "medium") return { label: "中", tone: "neutral" };
  return { label: "低", tone: "negative" };
}

export function getFitDisplay(level: FitLevel): FitDisplay {
  if (level === "strong_fit") return { label: "Strong fit", tone: "positive" };
  if (level === "moderate_fit") return { label: "Moderate fit", tone: "neutral" };
  return { label: "Weak fit", tone: "negative" };
}

export function getMarketEnvironmentDisplay(state: MarketEnvironmentState): MarketEnvironmentDisplay {
  switch (state) {
    case "risk_on":
      return { label: "Risk On", tone: "positive" };
    case "defensive":
      return { label: "Defensive", tone: "negative" };
    case "neutral":
      return { label: "Neutral", tone: "neutral" };
    default:
      return { label: "Insufficient Data", tone: "info" };
  }
}

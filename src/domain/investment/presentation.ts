import type {
  AlertRuleType,
  AlertSeverity,
  AlertState,
  InvestmentAlert,
  ActionDisplay,
  ConfidenceDisplay,
  ConfidenceLevel,
  DecisionAction,
  DisplayTone,
  FitDisplay,
  FitLevel,
  MarketEnvironmentDisplay,
  MarketEnvironmentState,
  StockAnalysisRecord,
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
  if (level === "strong_fit") return { label: "高度符合", tone: "positive" };
  if (level === "moderate_fit") return { label: "部分符合", tone: "neutral" };
  return { label: "弱符合", tone: "negative" };
}

export function getMarketEnvironmentDisplay(state: MarketEnvironmentState): MarketEnvironmentDisplay {
  switch (state) {
    case "risk_on":
      return { label: "可逐步布局", tone: "positive" };
    case "defensive":
      return { label: "偏防守", tone: "negative" };
    case "neutral":
      return { label: "偏觀察", tone: "neutral" };
    default:
      return { label: "資料不足", tone: "info" };
  }
}

export function getAlertRuleDisplay(rule: AlertRuleType) {
  switch (rule) {
    case "target_zone":
      return { label: "價格帶", description: "價格已進入或接近既有研究區間。" };
    case "valuation_status_change":
      return { label: "估值變化", description: "估值狀態相較前一個觀測點已轉換。" };
    case "overall_score_change":
      return { label: "總分變動", description: "整體長線判斷已有顯著分數差異。" };
    case "stability_deterioration":
      return { label: "穩定度", description: "風險輪廓或穩定度弱於前一個參考點。" };
    case "data_update_reprice":
      return { label: "事件後重估", description: "近期事件已推動 thesis 或估值重估。" };
    case "style_fit":
      return { label: "風格匹配", description: "更接近 Buffett 或 Lynch 的研究框架。" };
    default:
      return { label: "提醒", description: "規則已觸發新的決策提醒。" };
  }
}

export function getAlertStateDisplay(state: AlertState) {
  if (state === "active") {
    return { label: "需處理", tone: "info" as const };
  }

  return { label: "監控中", tone: "neutral" as const };
}

export function getAlertSeverityDisplay(severity: AlertSeverity) {
  if (severity === "positive") {
    return { label: "可關注", tone: "positive" as const };
  }

  if (severity === "negative") {
    return { label: "需警示", tone: "negative" as const };
  }

  return { label: "持續監控", tone: "neutral" as const };
}

export function getDecisionSectionDisplay(action: DecisionAction) {
  switch (action) {
    case "study_now":
      return {
        label: "值得研究",
        description: "品質、估值與風險報酬比都足以升級研究。",
        tone: "positive" as const
      };
    case "watch":
      return {
        label: "持續觀察",
        description: "理由足以繼續追蹤，但還不到投入優先研究資源。",
        tone: "neutral" as const
      };
    case "wait_for_better_price":
      return {
        label: "等更佳價格",
        description: "公司不差，但估值還沒提供足夠安全邊際。",
        tone: "negative" as const
      };
    case "avoid_for_now":
      return {
        label: "先不要碰",
        description: "風險、品質或穩定度不支持新增研究或部位。",
        tone: "negative" as const
      };
    default:
      return {
        label: "資料不足",
        description: "關鍵資訊不足，暫時不給過強結論。",
        tone: "info" as const
      };
  }
}

export function getPrimaryAlert(record: StockAnalysisRecord) {
  return record.alerts.find((alert) => alert.state === "active") ?? record.alerts[0];
}

export function getAlertIndicatorDisplay(alert?: InvestmentAlert) {
  if (!alert) {
    return {
      label: "暫無新警示",
      tone: "neutral" as const,
      detail: "目前沒有新的規則提醒。"
    };
  }

  const severityDisplay = getAlertSeverityDisplay(alert.severity);
  return {
    label: severityDisplay.label,
    tone: severityDisplay.tone,
    detail: alert.title
  };
}

export function getResearchPriorityScore(record: StockAnalysisRecord) {
  const actionBase = {
    study_now: 130,
    watch: 100,
    wait_for_better_price: 74,
    avoid_for_now: 36,
    insufficient_data: 8
  }[record.decision.action];

  const valuationBonus = {
    undervalued: 16,
    fair: 8,
    overvalued: -10,
    insufficient_data: -16
  }[record.decision.valuationStatus];

  const confidenceBonus = {
    high: 10,
    medium: 5,
    low: -12
  }[record.decision.confidenceLevel];

  const alertBonus = record.alerts.some((alert) => alert.severity === "positive")
    ? 6
    : record.alerts.some((alert) => alert.severity === "negative")
      ? 2
      : 0;

  const riskPenalty = Math.min(record.decision.riskFlags.length, 3) * 4;

  return actionBase + valuationBonus + confidenceBonus + alertBonus + record.overallScore - riskPenalty;
}

export function getPriorityPanelDisplay(record: StockAnalysisRecord) {
  if (record.decision.action === "study_now") {
    return {
      label: "本輪優先研究",
      description: "已通過研究門檻，現在值得投入更多研究時間。"
    };
  }

  if (record.decision.action === "watch" && record.overallScore >= 70) {
    return {
      label: "最接近研究門檻",
      description: "目前沒有完全達標的標的，先看最接近升級研究的公司。"
    };
  }

  if (record.decision.action === "wait_for_better_price") {
    return {
      label: "公司值得追蹤",
      description: "問題主要在估值，不在公司品質。"
    };
  }

  if (record.decision.action === "avoid_for_now") {
    return {
      label: "先保留觀察距離",
      description: "先把研究資源留給更有風險報酬比的標的。"
    };
  }

  return {
    label: "先補資料",
    description: "關鍵資訊不足，暫時不要放大結論。"
  };
}

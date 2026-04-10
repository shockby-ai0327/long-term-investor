import type {
  EventReminder,
  InvestmentThesis,
  MarketSummaryItem,
  MockSnapshotInfo,
  PortfolioHolding,
  Stock,
  WatchlistItem
} from "../types/investment";

export const stocks: Stock[] = [
  {
    id: "stock-msft",
    ticker: "MSFT",
    companyName: "Microsoft",
    market: "NASDAQ",
    sector: "軟體平台",
    industry: "Cloud / Productivity Software",
    region: "北美",
    headquarters: "Redmond, Washington",
    foundedYear: 1975,
    website: "https://www.microsoft.com",
    currency: "USD",
    currentPrice: 468.2,
    marketCapBillion: 3480,
    summary:
      "Microsoft 的核心價值在於把作業系統、企業軟體、雲端與 AI 基礎設施連成一個高黏著的生態系。對長線投資者來說，重點不是單季題材，而是其現金流品質、客戶切換成本與資本配置紀律。",
    businessModel:
      "公司主要透過訂閱制軟體、雲端基礎設施、企業授權與開發工具收費。收入結構具備高續約率與跨產品滲透率，能讓單一企業客戶隨著數位化程度提高而持續擴大支出。",
    revenueSegments: [
      {
        name: "Intelligent Cloud",
        share: 43,
        detail: "Azure、Server Products 與企業級雲端服務，是成長與現金流品質的雙引擎。"
      },
      {
        name: "Productivity & Business Processes",
        share: 32,
        detail: "Microsoft 365、Dynamics、LinkedIn，提供高黏著且可持續加價的訂閱收入。"
      },
      {
        name: "More Personal Computing",
        share: 25,
        detail: "Windows、Gaming 與搜尋廣告，波動較高但仍具戰略入口價值。"
      }
    ],
    positioning: [
      "企業 IT 支出中，Microsoft 同時占據基礎設施、協作與資料工作流三個關鍵節點。",
      "Azure 與 Microsoft 365 的綁定效果，使客戶很難單點替換其中一個產品。",
      "AI 功能的變現能力來自既有企業分發通路，而不是單純模型曝光度。"
    ],
    moat: [
      {
        label: "切換成本",
        score: 9.5,
        summary: "Office、Azure、Identity 與資料流程深度整合，替換成本很高。"
      },
      {
        label: "生態系與分發",
        score: 9.1,
        summary: "龐大企業客群與全球通路，能放大新產品採用速度。"
      },
      {
        label: "規模經濟",
        score: 8.8,
        summary: "大規模資料中心與研發投資能力，讓 AI 與雲端具備成本優勢。"
      }
    ],
    financialMetrics: {
      revenueCagr3Y: 15.4,
      revenueCagr5Y: 14.1,
      revenueCagr10Y: 13.2,
      epsCagr3Y: 18.8,
      epsCagr5Y: 17.5,
      epsCagr10Y: 16.1,
      grossMargin: 69.4,
      operatingMargin: 44.8,
      roe: 35.7,
      roic: 26.9,
      freeCashFlowBillion: 72.4,
      debtToEquity: 0.33
    },
    valuationMetrics: {
      pe: {
        low: 22,
        median: 29,
        high: 39,
        current: 31.5,
        historical: [24, 26, 28, 27, 32, 34, 31, 30, 31.5]
      },
      pb: {
        low: 8.1,
        median: 11.2,
        high: 16.4,
        current: 12.6,
        historical: [8.7, 9.4, 10.2, 11.1, 12.8, 14.1, 13.2, 12.3, 12.6]
      },
      peg: {
        low: 1.3,
        median: 1.8,
        high: 2.4,
        current: 1.9,
        historical: [1.4, 1.5, 1.7, 1.8, 2.1, 2.3, 2.0, 1.8, 1.9]
      },
      summary: "估值位於歷史中上緣，但尚未進入極端區間。若成長維持雙位數，合理偏貴仍可接受。"
    },
    riskProfile: {
      industryCycle: {
        level: "中",
        summary: "企業 IT 預算若轉弱，非核心專案延後會先影響部分雲端增量需求。",
        watchpoint: "留意 Azure 成長率與企業席次擴張是否同步放緩。"
      },
      policy: {
        level: "中",
        summary: "全球 AI 與雲端監管逐步增強，可能影響定價與資料治理要求。",
        watchpoint: "觀察歐盟與美國對 Copilot、資料使用與壟斷的限制。"
      },
      customerConcentration: {
        level: "低",
        summary: "客戶群高度分散，不依賴單一大客戶，但大型企業預算方向仍重要。",
        watchpoint: "大型企業續約與席次成長若轉弱，將是需求溫度下降訊號。"
      },
      financial: {
        level: "低",
        summary: "現金流強、資產負債表穩健，財務槓桿風險可控。",
        watchpoint: "若大規模 AI 資本支出顯著壓縮 FCF，需重新檢查報酬率。"
      }
    },
    recentEvents: [
      {
        id: "msft-event-1",
        date: "2026-04-02",
        title: "企業版 Copilot 採用率再提升",
        summary: "管理層指出大型企業從試點轉向正式席次部署，代表 AI 變現開始轉化為經常性收入。",
        category: "產品",
        impact: "正向"
      },
      {
        id: "msft-event-2",
        date: "2026-01-29",
        title: "雲端營收維持雙位數增長",
        summary: "Azure 成長保持韌性，且毛利率改善，顯示規模效益仍在擴大。",
        category: "財報",
        impact: "正向"
      },
      {
        id: "msft-event-3",
        date: "2025-12-18",
        title: "AI 基礎建設資本支出上修",
        summary: "支出節奏加快對短期自由現金流有壓力，但若持續帶來高品質需求，長期可接受。",
        category: "資本配置",
        impact: "需留意"
      }
    ],
    scores: {
      quality: {
        label: "品質評分",
        score: 9.3,
        summary: "續約率、現金流與資本報酬率都屬於大型平台企業中的頂尖水準。"
      },
      growth: {
        label: "成長評分",
        score: 8.9,
        summary: "核心成長仍由雲端與 AI 驅動，且能靠既有分發網路放大。"
      },
      valuation: {
        label: "估值評分",
        score: 6.8,
        summary: "不算便宜，但若 thesis 是高品質複利，現價仍屬可研究區間。"
      },
      risk: {
        label: "風險評分",
        score: 8.1,
        summary: "主要風險在資本支出回收效率，不在財務結構本身。"
      },
      overall: {
        label: "綜合判斷",
        score: 8.5,
        summary: "適合作為核心持股，但加碼要有估值紀律。"
      }
    },
    conclusion:
      "Microsoft 屬於『品質極高、成長仍在、估值偏貴但可接受』的典型長線複利股。決策重點不是猜短期漲跌，而是持續檢查 AI 資本支出是否真能轉成長期高報酬現金流。",
    lastReviewed: "2026-04-06"
  },
  {
    id: "stock-tsm",
    ticker: "TSM",
    companyName: "Taiwan Semiconductor",
    market: "NYSE",
    sector: "半導體製造",
    industry: "Foundry",
    region: "亞洲",
    headquarters: "Hsinchu, Taiwan",
    foundedYear: 1987,
    website: "https://www.tsmc.com",
    currency: "USD",
    currentPrice: 186.5,
    marketCapBillion: 965,
    summary:
      "台積電的長線吸引力來自先進製程領先、客戶關係深、資本回收能力高。它不是單一題材股，而是整個高效能運算供應鏈的關鍵基礎設施。",
    businessModel:
      "公司透過晶圓代工向全球 IC 設計公司收費，核心優勢是先進製程、良率控制、客戶共同開發能力與擴產紀律。隨製程更先進，客戶轉換成本與合作深度通常同步提高。",
    revenueSegments: [
      {
        name: "HPC",
        share: 46,
        detail: "AI、伺服器與高效能運算晶片，是先進製程需求最強勁的來源。"
      },
      {
        name: "Smartphone",
        share: 33,
        detail: "仍是重要營收來源，但波動性高於 HPC，需關注旗艦機升級循環。"
      },
      {
        name: "IoT / Auto / Others",
        share: 21,
        detail: "提供分散化需求與較長期的產能利用率支撐。"
      }
    ],
    positioning: [
      "先進製程量產能力與良率優勢，使其在 3nm/2nm 節點維持領先。",
      "與 Apple、NVIDIA、AMD 等核心客戶形成深度共同開發模式。",
      "越高階的晶片設計越依賴其供應可靠度與封裝協同能力。"
    ],
    moat: [
      {
        label: "製程技術",
        score: 9.6,
        summary: "先進製程量產與良率執行能力構成最深的技術護城河。"
      },
      {
        label: "客戶嵌入度",
        score: 9.0,
        summary: "設計流程、驗證與量產排程深度整合，客戶轉單成本很高。"
      },
      {
        label: "資本效率",
        score: 8.3,
        summary: "雖然資本支出龐大，但長期 ROIC 仍具韌性。"
      }
    ],
    financialMetrics: {
      revenueCagr3Y: 21.8,
      revenueCagr5Y: 18.2,
      revenueCagr10Y: 16.4,
      epsCagr3Y: 25.2,
      epsCagr5Y: 20.6,
      epsCagr10Y: 18.5,
      grossMargin: 54.7,
      operatingMargin: 43.2,
      roe: 29.6,
      roic: 22.4,
      freeCashFlowBillion: 36.1,
      debtToEquity: 0.24
    },
    valuationMetrics: {
      pe: {
        low: 13,
        median: 18,
        high: 28,
        current: 21.4,
        historical: [15, 17, 19, 16, 20, 24, 23, 22, 21.4]
      },
      pb: {
        low: 3,
        median: 5.2,
        high: 8.4,
        current: 6.1,
        historical: [3.8, 4.3, 5.1, 4.7, 5.9, 7.2, 6.8, 6.2, 6.1]
      },
      peg: {
        low: 0.8,
        median: 1.1,
        high: 1.8,
        current: 1.2,
        historical: [0.9, 1.0, 1.1, 0.9, 1.2, 1.5, 1.4, 1.3, 1.2]
      },
      summary: "估值高於過去景氣低點，但若 AI 基礎設施需求延續，仍在合理偏上區間。"
    },
    riskProfile: {
      industryCycle: {
        level: "中",
        summary: "半導體仍有景氣循環，若終端需求不如預期，利用率會先反映。",
        watchpoint: "觀察 5nm 以下產能利用率與智慧手機需求修復速度。"
      },
      policy: {
        level: "高",
        summary: "地緣政治與出口管制是不能忽視的非財務風險。",
        watchpoint: "關注美中政策、海外廠成本結構與先進製程限制。"
      },
      customerConcentration: {
        level: "中",
        summary: "前幾大客戶占比較高，但彼此分屬不同應用領域，風險可分散。",
        watchpoint: "若單一 AI 客戶需求轉弱，是否有其他節點補上。"
      },
      financial: {
        level: "低",
        summary: "資本支出大但資產負債表穩健，財務風險主要來自回收週期而非槓桿。",
        watchpoint: "留意海外擴產是否稀釋長期毛利率與 ROIC。"
      }
    },
    recentEvents: [
      {
        id: "tsm-event-1",
        date: "2026-04-08",
        title: "先進封裝需求續強",
        summary: "CoWoS 相關需求維持滿載，顯示 AI 供應鏈訂單延續性仍強。",
        category: "需求",
        impact: "正向"
      },
      {
        id: "tsm-event-2",
        date: "2026-01-16",
        title: "管理層維持資本支出紀律",
        summary: "雖然先進製程擴產仍積極，但對成熟製程投資態度更謹慎。",
        category: "資本配置",
        impact: "中性"
      },
      {
        id: "tsm-event-3",
        date: "2025-11-20",
        title: "海外廠成本爬升",
        summary: "短期可能對整體毛利率造成些許壓力，需要持續追蹤。",
        category: "法規",
        impact: "需留意"
      }
    ],
    scores: {
      quality: {
        label: "品質評分",
        score: 9.1,
        summary: "技術、良率與客戶關係構成全球最強代工平台之一。"
      },
      growth: {
        label: "成長評分",
        score: 8.8,
        summary: "AI 與 HPC 需求提供結構性增長，但仍受產業波動影響。"
      },
      valuation: {
        label: "估值評分",
        score: 7.2,
        summary: "比景氣谷底時昂貴，但對結構性龍頭而言仍可接受。"
      },
      risk: {
        label: "風險評分",
        score: 6.2,
        summary: "主要風險集中在地緣政治與海外擴產效率。"
      },
      overall: {
        label: "綜合判斷",
        score: 8.1,
        summary: "適合放在核心觀察或核心持有，但要保留地緣風險折價。"
      }
    },
    conclusion:
      "台積電是典型的『高品質週期股』。長期價值很強，但風險不能只用財報數字看，必須把政策與地緣因素納入必要折價。",
    lastReviewed: "2026-04-09"
  },
  {
    id: "stock-cost",
    ticker: "COST",
    companyName: "Costco",
    market: "NASDAQ",
    sector: "消費防禦",
    industry: "Warehouse Retail",
    region: "北美",
    headquarters: "Issaquah, Washington",
    foundedYear: 1983,
    website: "https://www.costco.com",
    currency: "USD",
    currentPrice: 788.3,
    marketCapBillion: 350,
    summary:
      "Costco 的投資價值並不在零售題材，而在會員制飛輪、極低營運成本與高信任品牌。長線投資判斷核心是會員續約、同店銷售與國際展店效率。",
    businessModel:
      "公司以會員年費作為高品質獲利來源，透過低毛利高周轉的零售模式拉高價格競爭力，再以會員黏著度與自有品牌強化規模優勢。真正重要的是會員經濟，而不只是賣場營收。",
    revenueSegments: [
      {
        name: "核心賣場銷售",
        share: 88,
        detail: "低毛利、高週轉，提供價格優勢與會員留存基礎。"
      },
      {
        name: "會員年費",
        share: 5,
        detail: "雖然占營收小，但對營業利益貢獻高，是最關鍵的品質來源。"
      },
      {
        name: "其他服務",
        share: 7,
        detail: "加油、藥局、旅遊與電商，提升單位會員價值。"
      }
    ],
    positioning: [
      "會員制創造出顧客先付費再進場的經濟模式，建立行為黏著。",
      "規模採購與精簡 SKU 策略降低成本，讓價格優勢可持續。",
      "自有品牌 Kirkland 增強品牌信任與毛利彈性。"
    ],
    moat: [
      {
        label: "會員飛輪",
        score: 9.2,
        summary: "高續約率與高頻消費形成自我強化的會員經濟。"
      },
      {
        label: "成本領先",
        score: 8.8,
        summary: "極簡營運與規模採購讓 Costco 能長期維持價格優勢。"
      },
      {
        label: "品牌信任",
        score: 8.4,
        summary: "消費者對品質與價格的信任，使 Costco 更像長期習慣而非促銷渠道。"
      }
    ],
    financialMetrics: {
      revenueCagr3Y: 10.9,
      revenueCagr5Y: 11.4,
      revenueCagr10Y: 10.6,
      epsCagr3Y: 12.1,
      epsCagr5Y: 13.2,
      epsCagr10Y: 12.7,
      grossMargin: 12.7,
      operatingMargin: 3.6,
      roe: 29.4,
      roic: 18.3,
      freeCashFlowBillion: 8.6,
      debtToEquity: 0.31
    },
    valuationMetrics: {
      pe: {
        low: 24,
        median: 34,
        high: 48,
        current: 45.1,
        historical: [30, 31, 35, 37, 39, 43, 47, 44, 45.1]
      },
      pb: {
        low: 7.8,
        median: 11.2,
        high: 18.5,
        current: 16.4,
        historical: [9.1, 9.8, 10.7, 12.1, 13.8, 15.9, 17.2, 16.1, 16.4]
      },
      peg: {
        low: 1.7,
        median: 2.2,
        high: 3.3,
        current: 3.0,
        historical: [1.9, 2.0, 2.1, 2.3, 2.5, 2.8, 3.2, 2.9, 3.0]
      },
      summary: "品質極高，但估值已反映大部分優點。更像值得耐心等價位的優秀公司。"
    },
    riskProfile: {
      industryCycle: {
        level: "低",
        summary: "屬於消費防禦型資產，景氣波動對基本消費需求影響較小。",
        watchpoint: "留意低收入消費者壓力是否擴大到整體客單價。"
      },
      policy: {
        level: "低",
        summary: "政策風險相對有限，主要是勞動成本與國際擴張法規差異。",
        watchpoint: "觀察新市場進入成本與勞動結構變化。"
      },
      customerConcentration: {
        level: "低",
        summary: "會員基礎分散，沒有明顯單一客戶依賴問題。",
        watchpoint: "關注續約率與高價會員滲透率是否開始走平。"
      },
      financial: {
        level: "低",
        summary: "財務相對穩健，真正風險是估值壓縮而非資本結構。",
        watchpoint: "若年費成長放緩，估值可能先反映。"
      }
    },
    recentEvents: [
      {
        id: "cost-event-1",
        date: "2026-03-27",
        title: "國際會員續約率維持高檔",
        summary: "國際市場續約率穩定，支持長期展店 thesis。",
        category: "需求",
        impact: "正向"
      },
      {
        id: "cost-event-2",
        date: "2026-01-10",
        title: "自有品牌占比提升",
        summary: "Kirkland 貢獻提升，有助於穩定會員感知價值。",
        category: "產品",
        impact: "正向"
      },
      {
        id: "cost-event-3",
        date: "2025-12-06",
        title: "估值進入歷史高檔",
        summary: "市場願意為品質付價，但回報空間更依賴未來持續執行。",
        category: "財報",
        impact: "需留意"
      }
    ],
    scores: {
      quality: {
        label: "品質評分",
        score: 9.0,
        summary: "會員經濟與營運紀律讓公司品質非常穩定。"
      },
      growth: {
        label: "成長評分",
        score: 7.4,
        summary: "成長不爆發，但能靠展店與會員效率穩定複利。"
      },
      valuation: {
        label: "估值評分",
        score: 4.9,
        summary: "目前價格已很充分，適合等待或只在市場波動時分批。"
      },
      risk: {
        label: "風險評分",
        score: 8.6,
        summary: "營運風險低，最需要小心的是買太貴。"
      },
      overall: {
        label: "綜合判斷",
        score: 7.5,
        summary: "公司值得長期持有，但進場價格必須克制。"
      }
    },
    conclusion:
      "Costco 屬於『公司非常好，但價格常常太好』的代表。若 thesis 是防禦型複利，應把估值紀律放在第一位。",
    lastReviewed: "2026-04-03"
  },
  {
    id: "stock-asml",
    ticker: "ASML",
    companyName: "ASML",
    market: "NASDAQ",
    sector: "半導體設備",
    industry: "Lithography Equipment",
    region: "歐洲",
    headquarters: "Veldhoven, Netherlands",
    foundedYear: 1984,
    website: "https://www.asml.com",
    currency: "USD",
    currentPrice: 1086.4,
    marketCapBillion: 428,
    summary:
      "ASML 是半導體先進製程不可替代的設備供應商。長線決策關鍵不在短期設備週期，而在其技術壟斷是否持續、客戶資本支出是否回到正常軌道。",
    businessModel:
      "公司主要銷售 EUV、DUV 微影設備與高毛利服務合約。設備一次性收入大，但服務與升級帶來持續現金流。若先進製程節奏延續，ASML 的需求不只來自景氣，還來自製程演進剛需。",
    revenueSegments: [
      {
        name: "EUV Systems",
        share: 44,
        detail: "最重要的技術壟斷來源，對先進節點不可替代。"
      },
      {
        name: "DUV Systems",
        share: 34,
        detail: "仍是大量成熟與過渡製程的設備基礎。"
      },
      {
        name: "Installed Base Management",
        share: 22,
        detail: "高毛利服務與升級收入，提升現金流品質。"
      }
    ],
    positioning: [
      "EUV 技術具備全球唯一量產供應能力，形成高度壟斷。",
      "與晶圓代工與 IDM 客戶的長期路線圖緊密綁定。",
      "設備銷售雖具波動，但需求根基來自製程演進而非單純景氣。"
    ],
    moat: [
      {
        label: "技術壟斷",
        score: 9.8,
        summary: "EUV 幾乎是無可替代的技術節點設備。"
      },
      {
        label: "客戶嵌入度",
        score: 9.0,
        summary: "客戶的製程規劃與產能布局都高度依賴 ASML 路線圖。"
      },
      {
        label: "售後服務",
        score: 8.5,
        summary: "Installed base 讓一次性設備生意轉化為更穩定的服務收入。"
      }
    ],
    financialMetrics: {
      revenueCagr3Y: 18.5,
      revenueCagr5Y: 16.9,
      revenueCagr10Y: 15.3,
      epsCagr3Y: 22.4,
      epsCagr5Y: 20.3,
      epsCagr10Y: 17.8,
      grossMargin: 51.6,
      operatingMargin: 34.5,
      roe: 54.1,
      roic: 33.7,
      freeCashFlowBillion: 9.7,
      debtToEquity: 0.19
    },
    valuationMetrics: {
      pe: {
        low: 20,
        median: 31,
        high: 46,
        current: 34.2,
        historical: [24, 28, 33, 30, 36, 41, 38, 33, 34.2]
      },
      pb: {
        low: 8,
        median: 13,
        high: 23,
        current: 15.8,
        historical: [9.4, 10.8, 12.6, 12.9, 15.7, 19.4, 17.1, 15.4, 15.8]
      },
      peg: {
        low: 1.0,
        median: 1.5,
        high: 2.3,
        current: 1.7,
        historical: [1.1, 1.3, 1.5, 1.4, 1.8, 2.1, 1.9, 1.6, 1.7]
      },
      summary: "估值不便宜，但和技術壟斷程度相比仍合理；更重要的是設備週期是否造成波動。"
    },
    riskProfile: {
      industryCycle: {
        level: "中",
        summary: "設備訂單波動大，客戶資本支出延後時會明顯反映在營收節奏。",
        watchpoint: "追蹤 backlog 轉化與 2026-2027 訂單能見度。"
      },
      policy: {
        level: "高",
        summary: "出口限制與地緣政治會直接影響可服務市場範圍。",
        watchpoint: "留意 EUV/DUV 出口限制變化與中國曝險調整。"
      },
      customerConcentration: {
        level: "中",
        summary: "主要客戶集中於少數大型晶圓製造商，但皆為長期合作夥伴。",
        watchpoint: "若前幾大客戶同時延後資本支出，波動會放大。"
      },
      financial: {
        level: "低",
        summary: "財務結構穩健，風險主要在需求時間差而非槓桿。",
        watchpoint: "觀察服務收入占比是否持續提升以平滑波動。"
      }
    },
    recentEvents: [
      {
        id: "asml-event-1",
        date: "2026-04-04",
        title: "服務收入比重再提升",
        summary: "Installed base 服務成長有助於降低設備交機波動對現金流的影響。",
        category: "財報",
        impact: "正向"
      },
      {
        id: "asml-event-2",
        date: "2026-02-14",
        title: "High-NA EUV 進度符合預期",
        summary: "下一代設備時程維持，支撐更長期的技術壟斷論點。",
        category: "產品",
        impact: "正向"
      },
      {
        id: "asml-event-3",
        date: "2025-11-08",
        title: "出口政策仍具不確定性",
        summary: "市場可服務範圍若再受限，可能影響短期需求能見度。",
        category: "法規",
        impact: "需留意"
      }
    ],
    scores: {
      quality: {
        label: "品質評分",
        score: 9.4,
        summary: "技術壟斷與高 ROIC 讓品質非常突出。"
      },
      growth: {
        label: "成長評分",
        score: 8.2,
        summary: "成長節奏受設備週期影響，但長期受益於製程升級。"
      },
      valuation: {
        label: "估值評分",
        score: 6.7,
        summary: "合理偏貴，適合在週期壓力出現時加大研究與布局。"
      },
      risk: {
        label: "風險評分",
        score: 6.5,
        summary: "主要風險在政策限制與設備支出波動。"
      },
      overall: {
        label: "綜合判斷",
        score: 8.0,
        summary: "值得長線追蹤，但要接受景氣與政策造成的股價波動。"
      }
    },
    conclusion:
      "ASML 的長期價值非常高，但市場常在設備週期低點給出更好價格。對長線投資者來說，關鍵是辨識壟斷是否受損，而不是被季度波動嚇出場。",
    lastReviewed: "2026-04-05"
  },
  {
    id: "stock-v",
    ticker: "V",
    companyName: "Visa",
    market: "NYSE",
    sector: "支付平台",
    industry: "Payments Network",
    region: "北美",
    headquarters: "San Francisco, California",
    foundedYear: 1958,
    website: "https://www.visa.com",
    currency: "USD",
    currentPrice: 321.4,
    marketCapBillion: 635,
    summary:
      "Visa 本質上是全球支付網路收費平台，不承擔主要信用風險。對長線投資者而言，關鍵問題是交易量與支付數位化是否持續，以及監管是否改變其網路經濟。",
    businessModel:
      "公司向發卡行、收單機構與商戶生態收取支付處理與跨境交易費用。其模型的迷人之處在於高毛利、低資本強度與全球網路效應，不需要像銀行一樣承擔大量資產負債表風險。",
    revenueSegments: [
      {
        name: "Service Revenue",
        share: 32,
        detail: "來自支付量基礎的經常性收入，是整體成長的底盤。"
      },
      {
        name: "Data Processing",
        share: 39,
        detail: "交易數與處理規模越大，網路效應越強。"
      },
      {
        name: "International Transactions & Others",
        share: 29,
        detail: "跨境交易帶來更高利潤，但受旅遊與匯率影響較大。"
      }
    ],
    positioning: [
      "全球支付清算網路的雙邊平台地位難以被單點挑戰。",
      "隨現金支付逐步數位化，Visa 能持續受益於交易電子化滲透。",
      "跨境交易與增值服務使成長不只來自刷卡量。"
    ],
    moat: [
      {
        label: "網路效應",
        score: 9.4,
        summary: "發卡行、收單端與商戶同時依賴其全球網路。"
      },
      {
        label: "品牌與信任",
        score: 8.8,
        summary: "支付場景最重視穩定性與接受度，Visa 在這點有先發優勢。"
      },
      {
        label: "資本輕盈",
        score: 8.7,
        summary: "不需大量資本投入即可維持高現金流與高報酬率。"
      }
    ],
    financialMetrics: {
      revenueCagr3Y: 12.7,
      revenueCagr5Y: 11.4,
      revenueCagr10Y: 10.8,
      epsCagr3Y: 15.9,
      epsCagr5Y: 14.1,
      epsCagr10Y: 13.5,
      grossMargin: 79.8,
      operatingMargin: 67.1,
      roe: 45.6,
      roic: 31.8,
      freeCashFlowBillion: 19.4,
      debtToEquity: 0.52
    },
    valuationMetrics: {
      pe: {
        low: 21,
        median: 29,
        high: 38,
        current: 30.7,
        historical: [24, 26, 29, 27, 31, 34, 32, 30, 30.7]
      },
      pb: {
        low: 9,
        median: 13,
        high: 18,
        current: 14.7,
        historical: [10.4, 11.1, 12.5, 12.1, 13.8, 15.6, 15.2, 14.3, 14.7]
      },
      peg: {
        low: 1.3,
        median: 1.9,
        high: 2.7,
        current: 2.0,
        historical: [1.4, 1.5, 1.9, 1.7, 2.1, 2.4, 2.2, 1.9, 2.0]
      },
      summary: "估值接近歷史中位數偏上，若跨境交易恢復與增值服務延續，仍可接受。"
    },
    riskProfile: {
      industryCycle: {
        level: "低",
        summary: "支付量與消費活動相關，但不像景氣循環股那樣劇烈。",
        watchpoint: "關注跨境交易成長與消費疲弱是否連動下修。"
      },
      policy: {
        level: "中",
        summary: "監管與 interchange 政策變化可能影響支付生態獲利分配。",
        watchpoint: "觀察歐盟、美國對支付網路費率與競爭的政策動向。"
      },
      customerConcentration: {
        level: "低",
        summary: "生態系分散，不依賴單一客戶；但大型銀行合作關係仍重要。",
        watchpoint: "大型發卡行若推動自有網路替代，需觀察長期影響。"
      },
      financial: {
        level: "低",
        summary: "高現金流與輕資產模型使財務風險低。",
        watchpoint: "留意回購節奏與估值是否過度抬升。"
      }
    },
    recentEvents: [
      {
        id: "visa-event-1",
        date: "2026-03-18",
        title: "跨境支付維持高個位數成長",
        summary: "跨境業務恢復對整體獲利貢獻仍具支撐。",
        category: "需求",
        impact: "正向"
      },
      {
        id: "visa-event-2",
        date: "2026-01-24",
        title: "增值服務滲透率提升",
        summary: "資料、風控與增值服務增強了網路之外的獲利來源。",
        category: "產品",
        impact: "正向"
      },
      {
        id: "visa-event-3",
        date: "2025-10-30",
        title: "支付監管討論升溫",
        summary: "雖然短期影響有限，但長期仍要納入監管折價。",
        category: "法規",
        impact: "需留意"
      }
    ],
    scores: {
      quality: {
        label: "品質評分",
        score: 9.2,
        summary: "高毛利、低資本強度與網路效應兼具。"
      },
      growth: {
        label: "成長評分",
        score: 7.9,
        summary: "支付數位化提供長期增量，但屬於穩健型而非爆發型。"
      },
      valuation: {
        label: "估值評分",
        score: 6.9,
        summary: "價格不便宜，但尚未脫離長期合理區間。"
      },
      risk: {
        label: "風險評分",
        score: 8.3,
        summary: "主要風險在監管，不在資產負債表。"
      },
      overall: {
        label: "綜合判斷",
        score: 8.2,
        summary: "適合核心持股與定期檢查型長線配置。"
      }
    },
    conclusion:
      "Visa 是非常標準的高品質複利資產。決策重點在於支付網路效應是否維持，以及監管是否改變其超額獲利結構。",
    lastReviewed: "2026-04-01"
  }
];

export const investmentTheses: InvestmentThesis[] = [
  {
    id: "thesis-msft",
    stockId: "stock-msft",
    ticker: "MSFT",
    companyName: "Microsoft",
    whyOwn:
      "持有 Microsoft 的核心理由是它同時擁有企業工作流入口、雲端平台與 AI 分發通路。這讓它不只是單一產品公司，而是企業數位化支出的底層平台。",
    growthDrivers: [
      "Azure 與 AI 服務可持續推升企業客單價。",
      "Microsoft 365 / Security 仍有漲價與交叉銷售空間。",
      "AI 助理若轉為高續約率產品，將提高整體 ARPU。"
    ],
    keyRisks: [
      "AI 資本支出若回收不如預期，FCF 會先受壓。",
      "監管對 bundling 或資料使用的限制可能影響變現模式。",
      "企業 IT 預算轉弱會讓雲端增量需求放緩。"
    ],
    expectedHoldingPeriod: "5 年以上",
    invalidationConditions: [
      "Azure 成長長時間跌落到無法支撐高估值的水準。",
      "Copilot 等 AI 產品無法形成可觀且可持續的付費採用。",
      "資本支出顯著上升但 ROIC 持續惡化。"
    ],
    addConditions: [
      "PE 回到歷史中位數附近且基本面無虞。",
      "Azure 與 AI 相關收入加速但估值未同步擴張。"
    ],
    trimConditions: [
      "估值進入歷史極端高區且成長開始放緩。",
      "單一持股權重超過 24%。"
    ],
    sellConditions: [
      "企業競爭優勢明顯弱化或主要成長引擎失靈。",
      "Thesis 失效且估值仍未反映風險。"
    ],
    reviewCadence: "每季財報後 + 重大資本支出調整時",
    createdAt: "2026-02-10",
    updatedAt: "2026-04-06",
    lastReviewed: "2026-04-06"
  },
  {
    id: "thesis-tsm",
    stockId: "stock-tsm",
    ticker: "TSM",
    companyName: "Taiwan Semiconductor",
    whyOwn:
      "持有台積電是因為它是先進晶片供應鏈最關鍵的製造平台。只要高階晶片需求存在，技術領先與良率執行就會持續轉化為高品質現金流。",
    growthDrivers: [
      "AI / HPC 持續拉動 3nm、2nm 需求。",
      "先進封裝需求擴張提高整體客單價與服務深度。",
      "長期晶片複雜度提升，讓代工價值持續增大。"
    ],
    keyRisks: [
      "地緣政治與出口管制。",
      "海外廠成本拉高整體毛利率壓力。",
      "終端需求下行導致利用率回落。"
    ],
    expectedHoldingPeriod: "3 到 5 年，視地緣風險折價調整",
    invalidationConditions: [
      "先進製程技術領先被實質追近。",
      "海外擴產使長期 ROIC 顯著下滑。",
      "高階客戶分流導致議價能力明顯削弱。"
    ],
    addConditions: [
      "估值回到景氣中下緣，但高階產能利用率仍健康。",
      "地緣風險升高造成短期情緒賣壓，而基本面未變。"
    ],
    trimConditions: [
      "AI 樂觀情緒把估值推到高區且訂單能見度沒有同步提升。",
      "部位權重超過 20%。"
    ],
    sellConditions: [
      "技術壟斷論點失效。",
      "政策與地緣風險導致可服務市場永久性縮小。"
    ],
    reviewCadence: "每季法說 + 先進製程與封裝產能更新時",
    createdAt: "2026-01-22",
    updatedAt: "2026-04-09",
    lastReviewed: "2026-04-09"
  },
  {
    id: "thesis-cost",
    stockId: "stock-cost",
    ticker: "COST",
    companyName: "Costco",
    whyOwn:
      "Costco 的核心吸引力是會員制飛輪，不是零售熱點。公司有能力用價格信任與高續約率把消費防禦資產做成長期複利機器。",
    growthDrivers: [
      "國際展店與會員滲透率提升。",
      "會員年費與自有品牌提升單位會員價值。",
      "電商與服務延伸提高每位會員總消費。"
    ],
    keyRisks: [
      "估值長期維持高檔，導致報酬率受限。",
      "會員增長或續約率若走平，市場可能快速重估。",
      "勞動與物流成本上升壓縮效率。"
    ],
    expectedHoldingPeriod: "5 年以上，但只在估值合理時加碼",
    invalidationConditions: [
      "會員續約率與同店銷售明顯走弱。",
      "國際展店效率低於預期並拖累回報。",
      "公司為了擴張犧牲既有成本紀律。"
    ],
    addConditions: [
      "股價回落到歷史估值中位附近。",
      "市場因短期消費疑慮修正，但會員續約仍穩。"
    ],
    trimConditions: [
      "PE/PB 持續位於歷史高檔且獲利成長沒有同步加速。",
      "單一持股權重超過 18%。"
    ],
    sellConditions: [
      "會員飛輪失效。",
      "品質優勢被競爭對手永久性削弱。"
    ],
    reviewCadence: "每季財報 + 會員續約率變化時",
    createdAt: "2026-02-02",
    updatedAt: "2026-04-03",
    lastReviewed: "2026-04-03"
  },
  {
    id: "thesis-asml",
    stockId: "stock-asml",
    ticker: "ASML",
    companyName: "ASML",
    whyOwn:
      "ASML 的投資邏輯來自技術壟斷與半導體製程演進剛需。只要 EUV 仍是先進節點必需設備，長期價值就相當清晰。",
    growthDrivers: [
      "EUV 與 High-NA EUV 出貨擴張。",
      "Installed base 服務收入提升，讓現金流品質更穩定。",
      "客戶長期製程演進不可逆。"
    ],
    keyRisks: [
      "出口限制與政策風險。",
      "設備出貨具有週期性，短期財務波動高。",
      "客戶延後資本支出造成估值壓縮。"
    ],
    expectedHoldingPeriod: "3 到 5 年，偏向週期波動中持有",
    invalidationConditions: [
      "EUV 技術壟斷出現可商業量產替代。",
      "高階設備需求長期不再隨製程升級擴大。",
      "政策限制讓可服務市場明顯縮小。"
    ],
    addConditions: [
      "設備週期下行導致估值回到合理偏低區間。",
      "backlog 穩定但市場短期情緒偏空。"
    ],
    trimConditions: [
      "設備景氣高峰、估值高檔且市場對 High-NA 過度樂觀。",
      "權重超過 16%。"
    ],
    sellConditions: [
      "技術壟斷削弱。",
      "長期成長引擎不再來自製程升級。"
    ],
    reviewCadence: "每季接單與產品路線圖更新時",
    createdAt: "2026-02-16",
    updatedAt: "2026-04-05",
    lastReviewed: "2026-04-05"
  },
  {
    id: "thesis-v",
    stockId: "stock-v",
    ticker: "V",
    companyName: "Visa",
    whyOwn:
      "Visa 是全球支付數位化最直接的高品質平台之一。它的價值來自網路效應、資本輕盈與高現金流，而不是單一信用週期。",
    growthDrivers: [
      "全球支付電子化持續滲透。",
      "跨境交易恢復與增值服務提升。",
      "支付網路延伸到更多 B2B 與數位場景。"
    ],
    keyRisks: [
      "支付監管與費率壓力。",
      "大型平台或即時支付系統分流部分交易。",
      "高估值下報酬更依賴持續執行。"
    ],
    expectedHoldingPeriod: "5 年以上",
    invalidationConditions: [
      "支付網路效應被新系統系統性削弱。",
      "監管明顯改變網路經濟。",
      "跨境與增值服務增長趨勢反轉。"
    ],
    addConditions: [
      "PE 回落至歷史中位附近。",
      "監管新聞造成短期波動，但核心交易量仍穩。"
    ],
    trimConditions: [
      "估值進入高檔而交易量增速放緩。",
      "權重超過 14%。"
    ],
    sellConditions: [
      "網路效應不再穩固。",
      "長期超額獲利結構被改寫。"
    ],
    reviewCadence: "每季財報 + 監管重大變化時",
    createdAt: "2026-02-24",
    updatedAt: "2026-04-01",
    lastReviewed: "2026-04-01"
  }
];

export const portfolioHoldings: PortfolioHolding[] = [
  {
    id: "holding-msft",
    stockId: "stock-msft",
    ticker: "MSFT",
    companyName: "Microsoft",
    shares: 595,
    avgCost: 392.6,
    currentPrice: 468.2,
    marketValue: 278579,
    costBasis: 233597,
    weight: 23,
    sector: "軟體平台",
    region: "北美",
    thesisStatus: "符合預期",
    note: "核心持股，持續觀察 AI 資本支出回收。"
  },
  {
    id: "holding-tsm",
    stockId: "stock-tsm",
    ticker: "TSM",
    companyName: "Taiwan Semiconductor",
    shares: 1224,
    avgCost: 145.3,
    currentPrice: 186.5,
    marketValue: 228276,
    costBasis: 177847,
    weight: 18,
    sector: "半導體製造",
    region: "亞洲",
    thesisStatus: "符合預期",
    note: "維持核心曝險，但保留地緣折價。"
  },
  {
    id: "holding-cost",
    stockId: "stock-cost",
    ticker: "COST",
    companyName: "Costco",
    shares: 257,
    avgCost: 653.2,
    currentPrice: 788.3,
    marketValue: 202193,
    costBasis: 167872,
    weight: 16,
    sector: "消費防禦",
    region: "北美",
    thesisStatus: "估值偏高",
    note: "公司品質佳，但目前偏向持有而非積極加碼。"
  },
  {
    id: "holding-asml",
    stockId: "stock-asml",
    ticker: "ASML",
    companyName: "ASML",
    shares: 161,
    avgCost: 914.7,
    currentPrice: 1086.4,
    marketValue: 174910,
    costBasis: 147267,
    weight: 14,
    sector: "半導體設備",
    region: "歐洲",
    thesisStatus: "需追蹤",
    note: "追蹤設備景氣與政策風險，暫不提高部位。"
  },
  {
    id: "holding-v",
    stockId: "stock-v",
    ticker: "V",
    companyName: "Visa",
    shares: 474,
    avgCost: 271.8,
    currentPrice: 321.4,
    marketValue: 152344,
    costBasis: 128833,
    weight: 12,
    sector: "支付平台",
    region: "北美",
    thesisStatus: "符合預期",
    note: "作為高品質現金流與支付數位化曝險。"
  }
];

export const cashPosition = {
  value: 231698,
  weight: 17
};

export const watchlistItems: WatchlistItem[] = [
  {
    id: "watch-msft",
    stockId: "stock-msft",
    ticker: "MSFT",
    companyName: "Microsoft",
    currentPrice: 468.2,
    targetRange: "USD 420 - 445",
    valuationSignal: "合理區間",
    tags: ["高品質公司", "核心持股", "AI 基建"],
    qualityScore: 9.3,
    nextCatalyst: "FY26 Q3 財報與 Azure 成長率更新",
    lastReviewed: "2026-04-06"
  },
  {
    id: "watch-tsm",
    stockId: "stock-tsm",
    ticker: "TSM",
    companyName: "Taiwan Semiconductor",
    currentPrice: 186.5,
    targetRange: "USD 165 - 178",
    valuationSignal: "合理區間",
    tags: ["高品質公司", "等待財報", "研究中"],
    qualityScore: 9.1,
    nextCatalyst: "月營收與先進封裝利用率",
    lastReviewed: "2026-04-09"
  },
  {
    id: "watch-cost",
    stockId: "stock-cost",
    ticker: "COST",
    companyName: "Costco",
    currentPrice: 788.3,
    targetRange: "USD 680 - 720",
    valuationSignal: "偏高觀察",
    tags: ["高品質公司", "觀察估值"],
    qualityScore: 9.0,
    nextCatalyst: "會員續約率與同店銷售更新",
    lastReviewed: "2026-04-03"
  },
  {
    id: "watch-asml",
    stockId: "stock-asml",
    ticker: "ASML",
    companyName: "ASML",
    currentPrice: 1086.4,
    targetRange: "USD 950 - 1020",
    valuationSignal: "合理區間",
    tags: ["研究中", "等待財報", "半導體設備"],
    qualityScore: 9.4,
    nextCatalyst: "接單與 High-NA EUV 時程",
    lastReviewed: "2026-04-05"
  },
  {
    id: "watch-v",
    stockId: "stock-v",
    ticker: "V",
    companyName: "Visa",
    currentPrice: 321.4,
    targetRange: "USD 290 - 305",
    valuationSignal: "合理區間",
    tags: ["高品質公司", "觀察估值"],
    qualityScore: 9.2,
    nextCatalyst: "跨境支付與監管動態",
    lastReviewed: "2026-04-01"
  }
];

export const mockSnapshot: MockSnapshotInfo = {
  asOfDate: "2026-04-10",
  label: "Mock Snapshot",
  marketDataNote: "這不是即時行情，也不是即時新聞。",
  thesisStorageNote: "投資假設、提醒處理狀態與觀察名單工作標記只存於目前瀏覽器的 localStorage。",
  freshnessNote: "所有提醒與研究內容都以 2026-04-10 的假資料快照呈現。"
};

export const eventReminders: EventReminder[] = [
  {
    id: "reminder-1",
    stockId: "stock-tsm",
    ticker: "TSM",
    title: "3 月營收公布",
    type: "營收",
    date: "2026-04-10",
    status: "需處理",
    note: "先確認這次月營收是否仍支持 AI / HPC 需求延續的 thesis，而不是只看單月數字高低。",
    reason: "這是今天到期的營收更新，最快反映需求溫度，會直接影響成長判斷。",
    verificationFocus: [
      "AI / HPC 是否繼續拉高營收占比",
      "智慧手機需求是否拖累整體營收 mix",
      "單月營收變化是否支持法說會成長敘事"
    ],
    affectsDecision: "會改變 TSM 的成長判斷，以及目前估值區間是否仍可接受。",
    nextStep: "先看個股分析的成長與風險區塊，再回 Thesis 檢查需求假設是否需要下修。",
    actions: [
      {
        label: "看個股",
        to: "/stocks/TSM",
        emphasis: "primary"
      },
      {
        label: "看 Thesis",
        to: "/thesis/TSM",
        emphasis: "secondary"
      },
      {
        label: "看組合",
        to: "/portfolio",
        emphasis: "ghost"
      }
    ]
  },
  {
    id: "reminder-2",
    stockId: "stock-msft",
    ticker: "MSFT",
    title: "FY26 Q3 財報前預檢",
    type: "財報",
    date: "2026-04-24",
    status: "即將到來",
    note: "先把財報前要核對的關鍵假設排好，避免看到 headline 才臨時反應。",
    reason: "這是下一次最重要的核心持股事件，會重新校準 AI 資本支出回收與成長品質。",
    verificationFocus: [
      "Azure 成長率與企業需求是否同步",
      "Copilot 席次變現是否開始拉高 ARPU",
      "資本支出上升是否壓縮自由現金流品質"
    ],
    affectsDecision: "會改變 Microsoft 的品質 / 成長評分，以及核心持股權重是否仍合理。",
    nextStep: "財報前先把 thesis 與組合權重一起檢查，避免財報後只根據價格動作做決策。",
    actions: [
      {
        label: "看個股",
        to: "/stocks/MSFT",
        emphasis: "primary"
      },
      {
        label: "看 Thesis",
        to: "/thesis/MSFT",
        emphasis: "secondary"
      },
      {
        label: "看組合",
        to: "/portfolio",
        emphasis: "ghost"
      }
    ]
  },
  {
    id: "reminder-3",
    stockId: "stock-cost",
    ticker: "COST",
    title: "估值偏高提醒",
    type: "估值",
    date: "2026-04-11",
    status: "需處理",
    note: "這不是看空提醒，而是提示你停止把好公司和好價格混為一談。",
    reason: "COST 已接近歷史高估值區，現在最需要檢查的是風險報酬比，不是故事品質。",
    verificationFocus: [
      "PE / PB 是否已明顯高於歷史中位",
      "會員續約與同店銷售是否足以支撐高估值",
      "是否需要從加碼名單移回等待名單"
    ],
    affectsDecision: "會改變 Costco 的估值判斷，以及是否暫停新增部位或加碼。",
    nextStep: "先更新個股估值區間，再回 Watchlist 確認它應該處於觀察估值而不是待進場。",
    actions: [
      {
        label: "看個股",
        to: "/stocks/COST",
        emphasis: "primary"
      },
      {
        label: "看 Thesis",
        to: "/thesis/COST",
        emphasis: "secondary"
      },
      {
        label: "看觀察名單",
        to: "/watchlist",
        emphasis: "ghost"
      }
    ]
  },
  {
    id: "reminder-4",
    stockId: "stock-asml",
    ticker: "ASML",
    title: "Q1 財報與接單更新",
    type: "財報",
    date: "2026-04-17",
    status: "即將到來",
    note: "這次重點不是單季好壞，而是 backlog 與服務收入是否能讓週期波動更可預測。",
    reason: "ASML 屬於高品質但週期波動大的資產，財報前要先想清楚哪個數字會真正改變 thesis。",
    verificationFocus: [
      "backlog 轉單能見度是否維持",
      "High-NA EUV 時程有沒有延後",
      "服務收入占比能否繼續平滑設備波動"
    ],
    affectsDecision: "會改變 ASML 的風險評分，以及你是否接受更高的景氣波動曝險。",
    nextStep: "把接單與產品路線圖先對回 Thesis，再看是否需要調整部位耐受區間。",
    actions: [
      {
        label: "看個股",
        to: "/stocks/ASML",
        emphasis: "primary"
      },
      {
        label: "看 Thesis",
        to: "/thesis/ASML",
        emphasis: "secondary"
      }
    ]
  },
  {
    id: "reminder-5",
    stockId: "stock-v",
    ticker: "V",
    title: "支付監管年度檢查",
    type: "新聞",
    date: "2026-04-26",
    status: "即將到來",
    note: "把監管訊號整理成長線風險假設，而不是把新聞標題直接轉成買賣動作。",
    reason: "Visa 的主要不確定性來自支付監管，這類事件不常發生，但一旦成形會改變長期超額報酬結構。",
    verificationFocus: [
      "監管是否直接影響支付網路費率",
      "是否改變大型發卡行與商戶的議價結構",
      "新聞內容屬於噪音，還是需要寫進 thesis 的新條件"
    ],
    affectsDecision: "會改變 Visa 的風險折價，以及監管風險是否應提高到核心追蹤項。",
    nextStep: "先更新 Thesis 的風險段落，再決定是否需要調整組合中的支付平台曝險。",
    actions: [
      {
        label: "看個股",
        to: "/stocks/V",
        emphasis: "primary"
      },
      {
        label: "看 Thesis",
        to: "/thesis/V",
        emphasis: "secondary"
      },
      {
        label: "看組合",
        to: "/portfolio",
        emphasis: "ghost"
      }
    ]
  },
  {
    id: "reminder-6",
    stockId: "stock-msft",
    ticker: "MSFT",
    title: "重新檢查 thesis",
    type: "Thesis",
    date: "2026-04-30",
    status: "即將到來",
    note: "這不是例行填表，而是把你目前對 AI 回收週期的假設重新寫清楚。",
    reason: "Microsoft 權重最高，thesis 若不定期重寫，很容易把價格漲跌誤當成基本面更新。",
    verificationFocus: [
      "AI 投資是否仍能對應到更高的企業黏著度",
      "資本支出拉升後 ROIC 是否仍在可接受範圍",
      "加碼 / 減碼條件是否需要重寫"
    ],
    affectsDecision: "會改變 Microsoft 的持有理由、加減碼紀律，以及組合集中度容忍範圍。",
    nextStep: "進 Thesis 頁更新失效條件，然後回 Portfolio 檢查 23% 權重是否仍有充分理由。",
    actions: [
      {
        label: "看 Thesis",
        to: "/thesis/MSFT",
        emphasis: "primary"
      },
      {
        label: "看個股",
        to: "/stocks/MSFT",
        emphasis: "secondary"
      },
      {
        label: "看組合",
        to: "/portfolio",
        emphasis: "ghost"
      }
    ]
  }
];

export const marketSummary: MarketSummaryItem[] = [
  {
    id: "summary-1",
    title: "品質溢價仍存在，但要求更高",
    takeaway: "市場願意給高品質公司溢價，但前提是現金流與資本紀律都持續被驗證。",
    implication: "研究重點應放在 ROIC 與自由現金流，而不是只看敘事熱度。"
  },
  {
    id: "summary-2",
    title: "AI 基建仍強，但估值分化更明顯",
    takeaway: "供應鏈內部開始出現『真正受益者』與『只是故事受惠者』的差異。",
    implication: "長線決策要檢查需求可持續性與定價權，而非追逐短線題材。"
  },
  {
    id: "summary-3",
    title: "防禦型複利股價格偏高",
    takeaway: "消費防禦與高品質平台股常被市場當作避風港，因此估值壓縮空間有限。",
    implication: "對這類標的要更依賴等待區間，而不是急著參與。"
  }
];

export const portfolioNotes = [
  "目前組合刻意集中在高品質平台與半導體基礎設施，接受部分集中度以換取更高 thesis 清晰度。",
  "現金比重維持 17%，用途是等估值回落，而不是追逐市場情緒。",
  "半導體曝險雖高，但分成製造與設備兩種經濟模型，不等同押單一景氣彈性。",
  "若單一持股超過 20% 且 thesis 沒有更強，就優先考慮減碼到紀律範圍。"
];

export const recentChecks = ["TSM", "MSFT", "ASML", "COST", "V"];

export const thesisStorageKey = "long-term-investor:theses";

export function getStockByTicker(ticker?: string) {
  return stocks.find((stock) => stock.ticker === ticker) ?? stocks[0];
}

export function getThesisByTicker(ticker?: string) {
  return investmentTheses.find((thesis) => thesis.ticker === ticker) ?? investmentTheses[0];
}

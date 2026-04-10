import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { SectionBlock } from "../components/SectionBlock";
import { investmentTheses, thesisStorageKey } from "../data/mockData";
import type { InvestmentThesis } from "../types/investment";
import { formatDate } from "../utils/format";

interface ThesisDraft {
  whyOwn: string;
  growthDrivers: string;
  keyRisks: string;
  expectedHoldingPeriod: string;
  invalidationConditions: string;
  addConditions: string;
  trimConditions: string;
  sellConditions: string;
  reviewCadence: string;
}

function thesisToDraft(thesis: InvestmentThesis): ThesisDraft {
  return {
    whyOwn: thesis.whyOwn,
    growthDrivers: thesis.growthDrivers.join("\n"),
    keyRisks: thesis.keyRisks.join("\n"),
    expectedHoldingPeriod: thesis.expectedHoldingPeriod,
    invalidationConditions: thesis.invalidationConditions.join("\n"),
    addConditions: thesis.addConditions.join("\n"),
    trimConditions: thesis.trimConditions.join("\n"),
    sellConditions: thesis.sellConditions.join("\n"),
    reviewCadence: thesis.reviewCadence
  };
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function getTodayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function ThesisPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [theses, setTheses] = useState<InvestmentThesis[]>(investmentTheses);
  const [savedMessage, setSavedMessage] = useState("尚未更新");

  useEffect(() => {
    const cached = window.localStorage.getItem(thesisStorageKey);
    if (!cached) return;

    try {
      const parsed = JSON.parse(cached) as InvestmentThesis[];
      setTheses(parsed);
    } catch {
      window.localStorage.removeItem(thesisStorageKey);
    }
  }, []);

  const selectedTicker = params.ticker ?? theses[0]?.ticker ?? "MSFT";
  const selectedThesis = theses.find((thesis) => thesis.ticker === selectedTicker) ?? theses[0];
  const [draft, setDraft] = useState<ThesisDraft>(() => thesisToDraft(selectedThesis));

  useEffect(() => {
    setDraft(thesisToDraft(selectedThesis));
    setSavedMessage(`上次更新：${formatDate(selectedThesis.updatedAt)}`);
  }, [selectedThesis]);

  function updateField(field: keyof ThesisDraft, value: string) {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  }

  function saveDraft() {
    const today = getTodayStamp();
    const nextThesis: InvestmentThesis = {
      ...selectedThesis,
      whyOwn: draft.whyOwn.trim(),
      growthDrivers: parseLines(draft.growthDrivers),
      keyRisks: parseLines(draft.keyRisks),
      expectedHoldingPeriod: draft.expectedHoldingPeriod.trim(),
      invalidationConditions: parseLines(draft.invalidationConditions),
      addConditions: parseLines(draft.addConditions),
      trimConditions: parseLines(draft.trimConditions),
      sellConditions: parseLines(draft.sellConditions),
      reviewCadence: draft.reviewCadence.trim(),
      updatedAt: today,
      lastReviewed: today
    };

    const nextTheses = theses.map((thesis) =>
      thesis.id === selectedThesis.id ? nextThesis : thesis
    );

    setTheses(nextTheses);
    window.localStorage.setItem(thesisStorageKey, JSON.stringify(nextTheses));
    setSavedMessage(`已儲存到瀏覽器：${formatDate(today)}`);
  }

  function markReviewedToday() {
    const today = getTodayStamp();
    const nextTheses = theses.map((thesis) =>
      thesis.id === selectedThesis.id
        ? {
            ...thesis,
            lastReviewed: today,
            updatedAt: today
          }
        : thesis
    );

    setTheses(nextTheses);
    window.localStorage.setItem(thesisStorageKey, JSON.stringify(nextTheses));
    setSavedMessage(`已標記為今日複查：${formatDate(today)}`);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Thesis / Notes"
        title="投資假設工作區"
        description="把持有理由、成長動能、失效條件與加減碼紀律寫成可以反覆檢查的紀錄。這裡只處理 Thesis，不處理盤中判斷。"
        actions={
          <>
            <button
              type="button"
              onClick={markReviewedToday}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
            >
              標記今日複查
            </button>
            <button
              type="button"
              onClick={saveDraft}
              className="rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
            >
              儲存假設
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <SectionBlock
          title="投資假設清單"
          subtitle="先選一檔股票，再更新 Thesis。內容只會存到目前瀏覽器。"
        >
          <div className="space-y-3">
            {theses.map((thesis) => (
              <button
                key={thesis.id}
                type="button"
                onClick={() => navigate(`/thesis/${thesis.ticker}`)}
                className={`w-full rounded-lg border px-4 py-4 text-left transition ${
                  thesis.id === selectedThesis.id
                    ? "border-ink-900 bg-ink-900 text-white"
                    : "border-slate-200 bg-white/80 text-ink-900 hover:border-slate-300"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.28em] text-current/65">{thesis.ticker}</p>
                <p className="mt-2 text-base font-semibold">{thesis.companyName}</p>
                <p className="mt-2 text-sm leading-6 text-current/75">
                  最後更新 {formatDate(thesis.updatedAt)}
                </p>
              </button>
            ))}
          </div>
        </SectionBlock>

        <div className="space-y-4">
          <SectionBlock
            title={`${selectedThesis.companyName} 投資假設`}
            subtitle="每個欄位都在回答一個決策問題。填不出來的地方，就是下一輪研究要補的地方。"
            action={
              <p className="text-sm font-medium text-sage-600">{savedMessage}</p>
            }
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-900">為什麼買這家公司</span>
                <textarea
                  rows={6}
                  className="field-shell w-full resize-y"
                  value={draft.whyOwn}
                  onChange={(event) => updateField("whyOwn", event.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-900">預期持有期間</span>
                <input
                  className="field-shell w-full"
                  value={draft.expectedHoldingPeriod}
                  onChange={(event) => updateField("expectedHoldingPeriod", event.target.value)}
                />
                <span className="mt-6 mb-2 block text-sm font-medium text-ink-900">檢查節奏</span>
                <input
                  className="field-shell w-full"
                  value={draft.reviewCadence}
                  onChange={(event) => updateField("reviewCadence", event.target.value)}
                />
                <div className="mt-6 rounded-xl border border-slate-200/80 bg-sand-50/70 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">時間標記</p>
                  <p className="mt-3 text-sm text-slate-600">建立日期：{formatDate(selectedThesis.createdAt)}</p>
                  <p className="mt-1 text-sm text-slate-600">最後更新：{formatDate(selectedThesis.updatedAt)}</p>
                  <p className="mt-1 text-sm text-slate-600">最近複查：{formatDate(selectedThesis.lastReviewed)}</p>
                </div>
              </label>
            </div>
          </SectionBlock>

          <SectionBlock
            title="成長與風險"
            subtitle="不要只寫多頭論點，也要把 thesis 出錯的位置寫清楚。"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-900">看好的成長動能</span>
                <textarea
                  rows={8}
                  className="field-shell w-full resize-y"
                  value={draft.growthDrivers}
                  onChange={(event) => updateField("growthDrivers", event.target.value)}
                />
                <p className="mt-2 text-xs text-slate-500">每行一點，方便日後逐條核對。</p>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-900">主要風險</span>
                <textarea
                  rows={8}
                  className="field-shell w-full resize-y"
                  value={draft.keyRisks}
                  onChange={(event) => updateField("keyRisks", event.target.value)}
                />
                <p className="mt-2 text-xs text-slate-500">只保留真正會改變長線判斷的風險。</p>
              </label>
            </div>
          </SectionBlock>

          <SectionBlock
            title="失效與執行條件"
            subtitle="長線投資的紀律不是停損訊號，而是 thesis 失效時的明確條件。"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-900">失效條件</span>
                <textarea
                  rows={8}
                  className="field-shell w-full resize-y"
                  value={draft.invalidationConditions}
                  onChange={(event) => updateField("invalidationConditions", event.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-900">何時加碼</span>
                <textarea
                  rows={8}
                  className="field-shell w-full resize-y"
                  value={draft.addConditions}
                  onChange={(event) => updateField("addConditions", event.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-900">何時減碼</span>
                <textarea
                  rows={8}
                  className="field-shell w-full resize-y"
                  value={draft.trimConditions}
                  onChange={(event) => updateField("trimConditions", event.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-ink-900">何時賣出</span>
                <textarea
                  rows={8}
                  className="field-shell w-full resize-y"
                  value={draft.sellConditions}
                  onChange={(event) => updateField("sellConditions", event.target.value)}
                />
              </label>
            </div>
          </SectionBlock>

          <div className="panel flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-ink-900">下一步</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                更新完 thesis 後，最好回到個股分析頁與投資組合頁，確認估值與配置仍支持這個假設。
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/stocks/${selectedThesis.ticker}`}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400 hover:bg-white"
              >
                回到個股分析
              </Link>
              <Link
                to="/portfolio"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400 hover:bg-white"
              >
                檢查組合配置
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

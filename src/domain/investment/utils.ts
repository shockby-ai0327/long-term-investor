import { coverageThresholds, fitThresholds } from "./config";
import type { ConfidenceLevel, FitLevel, ScoreContribution } from "./types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function normalizeScore(value: number, min: number, max: number, invert = false) {
  if (!Number.isFinite(value)) return 0;
  const normalized = clamp((value - min) / (max - min || 1), 0, 1);
  return round((invert ? 1 - normalized : normalized) * 100, 1);
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function averageWeighted(entries: Array<{ value: number; weight: number }>) {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);

  if (!totalWeight) return 0;

  return entries.reduce((sum, entry) => sum + entry.value * entry.weight, 0) / totalWeight;
}

export function coverageFromContributions(contributions: ScoreContribution[]) {
  const totalWeight = contributions.reduce((sum, contribution) => sum + contribution.weight, 0);
  const availableWeight = contributions
    .filter((contribution) => !contribution.missing)
    .reduce((sum, contribution) => sum + contribution.weight, 0);

  if (!totalWeight) return 0;

  return round((availableWeight / totalWeight) * 100, 1);
}

export function scoreFromContributions(contributions: ScoreContribution[]) {
  const available = contributions.filter((contribution) => !contribution.missing);
  const weightedScore = averageWeighted(
    available.map((contribution) => ({
      value: contribution.score,
      weight: contribution.weight
    }))
  );

  return round(weightedScore, 1);
}

export function listMissingFlags(contributions: ScoreContribution[]) {
  return contributions
    .filter((contribution) => contribution.missing && contribution.missingFlag)
    .map((contribution) => contribution.missingFlag!);
}

export function getFitLevel(score: number): FitLevel {
  if (score >= fitThresholds.strong) return "strong_fit";
  if (score >= fitThresholds.moderate) return "moderate_fit";
  return "weak_fit";
}

export function getConfidenceLevel(weightedCoverage: number, hasCriticalMissing: boolean): ConfidenceLevel {
  if (!hasCriticalMissing && weightedCoverage >= coverageThresholds.highConfidence) {
    return "high";
  }

  if (weightedCoverage >= coverageThresholds.mediumConfidence) {
    return "medium";
  }

  return "low";
}

export function daysBetween(snapshotDate: string, targetDate: string) {
  const snapshot = new Date(`${snapshotDate}T00:00:00`);
  const target = new Date(`${targetDate}T00:00:00`);
  return Math.round((target.getTime() - snapshot.getTime()) / (1000 * 60 * 60 * 24));
}

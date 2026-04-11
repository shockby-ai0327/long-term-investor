import { Badge } from "./Badge";
import type { DisplayTone } from "../domain/investment";

function toBadgeTone(tone: DisplayTone) {
  if (tone === "positive") return "positive" as const;
  if (tone === "negative") return "negative" as const;
  if (tone === "info") return "info" as const;
  return "neutral" as const;
}

interface DecisionPillProps {
  label: string;
  tone: DisplayTone;
}

export function DecisionPill({ label, tone }: DecisionPillProps) {
  return <Badge tone={toBadgeTone(tone)}>{label}</Badge>;
}

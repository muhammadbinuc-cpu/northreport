const MOMENTUM_WEIGHT = 0.6;
const RISK_WEIGHT = 0.4;
const RECENCY_HALF_LIFE_HOURS = 12;

const SEVERITY_MAP: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

interface ScoringItem {
  createdAt: Date;
  upvotes?: number;
  commentCount?: number;
  repostCount?: number;
  severity?: string | null;
  corroborationCount?: number;
}

function momentumScore(item: ScoringItem): number {
  const ageHours = (Date.now() - new Date(item.createdAt).getTime()) / 3_600_000;
  const recency = Math.exp((-0.693 * ageHours) / RECENCY_HALF_LIFE_HOURS);
  const engagement = Math.log2(
    1 + (item.upvotes || 0) + (item.commentCount || 0) * 1.5 + (item.repostCount || 0) * 2
  );
  return recency * (1 + engagement);
}

function riskScore(item: ScoringItem): number {
  const sev = SEVERITY_MAP[item.severity || ''] || 0;
  const corr = Math.min(item.corroborationCount || 0, 5);
  return (sev / 4) * (1 + corr * 0.2);
}

export function computeFeedScore(item: ScoringItem): number {
  return MOMENTUM_WEIGHT * momentumScore(item) + RISK_WEIGHT * riskScore(item);
}

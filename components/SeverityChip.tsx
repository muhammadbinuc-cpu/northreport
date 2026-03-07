'use client';

interface SeverityChipProps {
  severity: string | null;
}

export default function SeverityChip({ severity }: SeverityChipProps) {
  if (!severity) return null;

  const chipClass = `chip-severity chip-${severity}`;

  return (
    <span className={chipClass}>
      {severity === 'critical' && '●'} {severity}
    </span>
  );
}

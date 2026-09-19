import { WEEKLY_GOAL } from "@/lib/fitness";

interface FitnessStatsRailProps {
  weekCount: number;
  streak: number;
  averagePerWeek: number;
  daysSinceThreeMiss: number | null;
}

export function FitnessStatsRail({ weekCount, streak, averagePerWeek, daysSinceThreeMiss }: FitnessStatsRailProps) {
  const items = [
    { label: "Meta semanal", value: `${weekCount} / ${WEEKLY_GOAL}`, color: "var(--color-accent)" },
    { label: "Sequência atual", value: `${streak} ${streak === 1 ? "dia" : "dias"}`, color: "var(--color-accent)" },
    { label: "Média por semana", value: averagePerWeek.toFixed(1), color: "var(--color-text)" },
    {
      label: "Sem 3 dias seguidos sem treinar",
      value: daysSinceThreeMiss === null ? "—" : `${daysSinceThreeMiss} ${daysSinceThreeMiss === 1 ? "dia" : "dias"}`,
      color: "var(--color-text)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border px-3.5 py-3"
          style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
        >
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tabular" style={{ color: item.color }}>
            {item.value}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

import { cn } from "@/lib/utils";

interface SuccessBadgeProps {
  probability: number;
  className?: string;
  showLabel?: boolean;
}

export function SuccessBadge({ probability, className, showLabel = true }: SuccessBadgeProps) {
  const level = probability >= 70 ? "high" : probability >= 40 ? "medium" : "competitive";

  const config = {
    high: { emoji: "🟢", label: "High Chance", bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
    medium: { emoji: "🟡", label: "Medium Chance", bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
    competitive: { emoji: "🔴", label: "Competitive", bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  };

  const c = config[level];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", c.bg, c.text, c.border, className)}>
      <span>{c.emoji}</span>
      {showLabel && <span>{c.label}</span>}
      <span className="font-bold">{probability}%</span>
    </span>
  );
}

import { useBudget } from '@/context/BudgetContext';
import { motion } from 'framer-motion';

export function HealthRing() {
  const { savingsRate, totalIncome, totalExpenses, remainingBudget } = useBudget();

  const clampedRate = Math.max(0, Math.min(100, savingsRate));
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (clampedRate / 100) * circumference;

  const healthColor = clampedRate >= 20 ? 'hsl(var(--success))' : clampedRate >= 10 ? 'hsl(var(--warning))' : 'hsl(var(--danger))';
  const healthLabel = clampedRate >= 20 ? 'Healthy' : clampedRate >= 10 ? 'Fair' : 'Tight';

  return (
    <div className="flex h-full flex-col rounded-lg bg-card p-8 shadow-warm">
      <h2 className="mb-6 text-center text-lg font-semibold tracking-tight text-foreground">Budget Health</h2>
      <div className="relative mx-auto flex-shrink-0">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--border))" strokeWidth="12" />
          <motion.circle
            cx="100" cy="100" r="80" fill="none"
            stroke={healthColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono-data text-3xl font-semibold text-foreground">{Math.round(clampedRate)}%</span>
          <span className="text-sm text-muted-foreground">{healthLabel}</span>
        </div>
      </div>
      <div className="mt-6 grid w-full grid-cols-3 divide-x divide-border">
        <div className="min-w-0 px-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Income</p>
          <p className="font-mono-data text-[11px] font-semibold leading-tight text-foreground break-all">€{totalIncome.toFixed(2)}</p>
        </div>
        <div className="min-w-0 px-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Spent</p>
          <p className="font-mono-data text-[11px] font-semibold leading-tight text-foreground break-all">€{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="min-w-0 px-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Left</p>
          <p className="font-mono-data text-[11px] font-semibold leading-tight break-all" style={{ color: remainingBudget >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))' }}>
            €{remainingBudget.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

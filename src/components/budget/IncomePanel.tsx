import { useBudget } from '@/context/BudgetContext';
import { AddIncomeDialog } from '@/components/budget/AddIncomeDialog';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export function IncomePanel() {
  const { incomes, incomeByPartner, totalIncome, partnerNames, removeIncome } = useBudget();

  const p1Pct = totalIncome > 0 ? (incomeByPartner.partner1 / totalIncome) * 100 : 50;

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Income</h2>
        <AddIncomeDialog />
      </div>

      {/* Contribution bar */}
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>{partnerNames.partner1} ({Math.round(p1Pct)}%)</span>
          <span>{partnerNames.partner2} ({Math.round(100 - p1Pct)}%)</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="rounded-l-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${p1Pct}%` }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          />
          <motion.div
            className="rounded-r-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${100 - p1Pct}%` }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {incomes.map(inc => (
          <div key={inc.id} className="group flex items-center justify-between rounded-md bg-surface-alt px-3 py-2 transition-colors hover:bg-muted">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: inc.partner === 'partner1' ? 'hsl(var(--primary))' : 'hsl(var(--accent))' }} />
              <span className="text-sm text-foreground">{inc.source}</span>
              <span className="text-xs text-muted-foreground">({partnerNames[inc.partner]})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-sm font-medium text-foreground">€{inc.amount.toLocaleString()}</span>
              <button
                onClick={() => removeIncome(inc.id)}
                className="rounded p-0.5 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                aria-label="Remove income"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between border-t border-border pt-3">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className="font-mono-data text-lg font-semibold text-foreground">€{totalIncome.toLocaleString()}</span>
      </div>
    </div>
  );
}

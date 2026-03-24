import { useBudget } from '@/context/BudgetContext';
import { CATEGORY_CONFIG } from '@/types/budget';
import { Trash2 } from 'lucide-react';

export function RecentExpenses() {
  const { expenses, partnerNames, removeExpense, currentMonth } = useBudget();

  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const sorted = [...currentMonthExpenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Expenses</h2>
      <div className="space-y-1">
        {sorted.slice(0, 10).map(exp => {
          const config = CATEGORY_CONFIG.find(c => c.category === exp.category)!;
          return (
            <div key={exp.id} className="group flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-surface-alt">
              <div className="flex items-center gap-3">
                <span className="text-base">{config.icon}</span>
                <div>
                  <p className="text-sm text-foreground">{exp.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {partnerNames[exp.paidBy]} · {exp.shared ? 'Shared' : 'Personal'} · {exp.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono-data text-sm font-medium text-foreground">€{exp.amount}</span>
                <button
                  onClick={() => removeExpense(exp.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

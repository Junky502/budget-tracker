import { useBudget } from '@/context/BudgetContext';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export function MonthComparison() {
  const { totalExpenses, expensesByCategory, previousMonth, categories } = useBudget();

  const diff = totalExpenses - previousMonth.totalExpenses;
  const diffPct = previousMonth.totalExpenses > 0 ? (diff / previousMonth.totalExpenses) * 100 : 0;

  const changes = categories
    .map(c => {
      const current = expensesByCategory[c.category] || 0;
      const prev = previousMonth.expensesByCategory[c.category] || 0;
      const change = current - prev;
      return { ...c, current, prev, change, changePct: prev > 0 ? (change / prev) * 100 : current > 0 ? 100 : 0 };
    })
    .filter(c => c.current > 0 || c.prev > 0)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 6);

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">vs. Last Month</h2>
        <div className="flex items-center gap-1">
          {diff > 0 ? <ArrowUp className="h-4 w-4 text-destructive" /> : diff < 0 ? <ArrowDown className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-muted-foreground" />}
          <span className={`font-mono-data text-sm font-medium ${diff > 0 ? 'text-destructive' : diff < 0 ? 'text-primary' : 'text-muted-foreground'}`}>
            {diff > 0 ? '+' : ''}€{Math.abs(diff).toFixed(2)} ({diffPct > 0 ? '+' : ''}{diffPct.toFixed(1)}%)
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {changes.map(c => (
          <div key={c.category} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{c.icon} {c.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-xs text-muted-foreground">€{Number(c.prev).toFixed(2)}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-mono-data text-xs text-foreground">€{Number(c.current).toFixed(2)}</span>
              <span className={`font-mono-data text-xs ${c.change > 0 ? 'text-destructive' : c.change < 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                {c.change > 0 ? '+' : ''}{Number(c.change).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

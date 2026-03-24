import { useBudget } from '@/context/BudgetContext';
import { Trash2 } from 'lucide-react';

interface CategoryExpensesProps {
  category: string;
  onClose: () => void;
}

export function CategoryExpenses({ category, onClose }: CategoryExpensesProps) {
  const { expenses, partnerNames, removeExpense, currentMonth, categories } = useBudget();

  const config = categories.find(c => c.category === category);
  const categoryExpenses = expenses
    .filter(e => e.category === category && e.date.startsWith(currentMonth))
    .sort((a, b) => b.date.localeCompare(a.date));

  const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {config?.icon} {config?.label} Expenses
        </h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-mono-data font-medium text-foreground">€{total.toFixed(2)}</span>
        </p>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {categoryExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No expenses in this category for {currentMonth}
          </p>
        ) : (
          categoryExpenses.map(exp => (
            <div key={exp.id} className="group flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-surface-alt">
              <div className="flex items-center gap-3">
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
          ))
        )}
      </div>
    </div>
  );
}
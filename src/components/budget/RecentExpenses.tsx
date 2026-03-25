import { useBudget } from '@/context/BudgetContext';
import { useState } from 'react';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import { Expense } from '@/types/budget';
import { ExpenseDialog } from '@/components/budget/ExpenseDialog';

export function RecentExpenses() {
  const { expenses, partnerNames, removeExpense, currentMonth, categories } = useBudget();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [duplicatingExpense, setDuplicatingExpense] = useState<Expense | null>(null);

  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const sorted = [...currentMonthExpenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Expenses</h2>
      <div className="space-y-1">
        {sorted.slice(0, 10).map(exp => {
          const config = categories.find(c => c.category === exp.category);
          return (
            <div key={exp.id} className="group flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-surface-alt">
              <div className="flex items-center gap-3">
                <span className="text-base">{config?.icon ?? '⚠'}</span>
                <div>
                  <p className="text-sm text-foreground">{exp.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {partnerNames[exp.paidBy]} · {exp.shared ? 'Shared' : 'Personal'}
                    {exp.recurring ? (
                      <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Recurring
                      </span>
                    ) : null}
                    <span className="ml-2">· {exp.date}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono-data text-sm font-medium text-foreground">€{exp.amount}</span>
                <button
                  onClick={() => setEditingExpense(exp)}
                  className="rounded p-0.5 opacity-0 transition-opacity hover:bg-primary/10 group-hover:opacity-100"
                  aria-label="Edit expense"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                </button>
                <button
                  onClick={() => setDuplicatingExpense(exp)}
                  className="rounded p-0.5 opacity-0 transition-opacity hover:bg-accent/10 group-hover:opacity-100"
                  aria-label="Duplicate expense"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-accent" />
                </button>
                <button
                  onClick={() => removeExpense(exp.id)}
                  className="rounded p-0.5 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {editingExpense ? (
        <ExpenseDialog
          mode="edit"
          expense={editingExpense}
          open={Boolean(editingExpense)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingExpense(null);
            }
          }}
        />
      ) : null}
      {duplicatingExpense ? (
        <ExpenseDialog
          mode="duplicate"
          expense={duplicatingExpense}
          open={Boolean(duplicatingExpense)}
          onOpenChange={(open) => {
            if (!open) {
              setDuplicatingExpense(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useBudget } from '@/context/BudgetContext';
import { BudgetGoal } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { GoalDialog } from '@/components/budget/GoalDialog';

export function GoalsPanel() {
  const { goalProgress, goals, removeGoal } = useBudget();
  const [editingGoal, setEditingGoal] = useState<BudgetGoal | null>(null);

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Budget Goals</h2>
        <GoalDialog
          trigger={
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Goal
            </Button>
          }
        />
      </div>

      {goalProgress.length === 0 ? (
        <p className="text-sm text-muted-foreground">Set a category goal to track monthly progress and pacing.</p>
      ) : (
        <div className="space-y-3">
          {goalProgress.map(progress => {
            const storedGoal = goals.find(goal => goal.id === progress.id);
            const progressWidth = Math.min(progress.progressPct, 100);
            const statusColor = progress.status === 'exceeded'
              ? 'bg-destructive'
              : progress.status === 'at-risk'
                ? 'bg-accent'
                : 'bg-primary';

            return (
              <div key={progress.id} className="rounded-md border border-border bg-surface-alt p-3">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{progress.icon} {progress.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {progress.targetType === 'fixed' ? `Goal €${Math.round(progress.targetAmount)}` : `${progress.configuredValue}% of income`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {storedGoal ? (
                      <button
                        onClick={() => setEditingGoal(storedGoal)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        aria-label="Edit goal"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => removeGoal(progress.id)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Remove goal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${statusColor}`} style={{ width: `${progressWidth}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Spent <span className="font-mono-data text-foreground">€{Math.round(progress.currentAmount)}</span></span>
                  <span>{progress.progressPct.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingGoal ? (
        <GoalDialog
          goal={editingGoal}
          open={Boolean(editingGoal)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingGoal(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}

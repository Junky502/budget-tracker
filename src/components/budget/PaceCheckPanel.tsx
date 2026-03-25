import { useBudget } from '@/context/BudgetContext';

export function PaceCheckPanel() {
  const { pacingAlerts, currentMonth } = useBudget();

  if (pacingAlerts.length === 0) {
    return (
      <div className="rounded-lg bg-card p-6 shadow-warm">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Pace Check</h2>
        <p className="text-sm text-muted-foreground">You are on pace across your tracked goals for {currentMonth}.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Pace Check</h2>
      <div className="space-y-3">
        {pacingAlerts.slice(0, 6).map(goal => {
          const stateClass = goal.status === 'exceeded'
            ? 'border-destructive/30 bg-destructive/5'
            : 'border-accent/30 bg-accent/5';
          const stateText = goal.status === 'exceeded' ? 'Over goal' : 'Running hot';

          return (
            <div key={goal.id} className={`rounded-md border p-3 ${stateClass}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{goal.icon} {goal.label}</p>
                  <p className="text-xs text-muted-foreground">Expected by now €{goal.expectedByNow.toFixed(0)} · Actual €{goal.currentAmount.toFixed(0)}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-foreground">{stateText}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

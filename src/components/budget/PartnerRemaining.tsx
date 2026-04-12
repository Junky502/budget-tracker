import { useBudget } from '@/context/BudgetContext';

export function PartnerRemaining() {
  const { incomeByPartner, expensesByPartner, partnerNames } = useBudget();

  const remainingP1 = incomeByPartner.partner1 - expensesByPartner.partner1;
  const remainingP2 = incomeByPartner.partner2 - expensesByPartner.partner2;

  const getColor = (remaining: number) => {
    return remaining >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))';
  };

  const getStatusLabel = (remaining: number) => {
    return remaining >= 0 ? 'Remaining' : 'Deficit';
  };

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Money Per Person</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-md bg-surface-alt p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">{partnerNames.partner1}</h3>
          <p className="text-xs text-muted-foreground mb-2">Income</p>
          <p className="font-mono-data text-sm font-semibold text-foreground mb-3">€{incomeByPartner.partner1.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mb-1">Expenses</p>
          <p className="font-mono-data text-sm font-semibold text-foreground mb-4">€{expensesByPartner.partner1.toFixed(2)}</p>
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground mb-1">{getStatusLabel(remainingP1)}</p>
            <p className="font-mono-data text-base font-semibold" style={{ color: getColor(remainingP1) }}>
              €{remainingP1.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="rounded-md bg-surface-alt p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">{partnerNames.partner2}</h3>
          <p className="text-xs text-muted-foreground mb-2">Income</p>
          <p className="font-mono-data text-sm font-semibold text-foreground mb-3">€{incomeByPartner.partner2.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mb-1">Expenses</p>
          <p className="font-mono-data text-sm font-semibold text-foreground mb-4">€{expensesByPartner.partner2.toFixed(2)}</p>
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground mb-1">{getStatusLabel(remainingP2)}</p>
            <p className="font-mono-data text-base font-semibold" style={{ color: getColor(remainingP2) }}>
              €{remainingP2.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground text-center">
        <p>This helps identify if you've forgotten to add an expense</p>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { useBudget } from '@/context/BudgetContext';

export function SettleUpWidget() {
  const { expenses, currentMonth, partnerNames } = useBudget();

  const settlement = useMemo(() => {
    const monthExpenses = expenses.filter(expense => {
      const expenseMonth = expense.date.slice(0, 7);
      if (!expense.shared) {
        return false;
      }
      if (expense.recurring) {
        return expenseMonth <= currentMonth;
      }
      return expenseMonth === currentMonth;
    });

    let partner1Paid = 0;
    let partner2Paid = 0;
    let partner1Owes = 0;
    let partner2Owes = 0;

    monthExpenses.forEach(expense => {
      const fallbackSplit = {
        partner1: expense.amount / 2,
        partner2: expense.amount / 2,
      };
      const split = expense.splitAmounts || fallbackSplit;

      if (expense.paidBy === 'partner1') {
        partner1Paid += expense.amount;
      } else {
        partner2Paid += expense.amount;
      }

      partner1Owes += split.partner1;
      partner2Owes += split.partner2;
    });

    const partner1Net = partner1Paid - partner1Owes;
    const partner2Net = partner2Paid - partner2Owes;
    const amount = Math.abs(partner1Net);

    if (amount < 0.01) {
      return {
        partner1Paid,
        partner2Paid,
        partner1Owes,
        partner2Owes,
        amount: 0,
        from: null,
        to: null,
        expenseCount: monthExpenses.length,
      };
    }

    return {
      partner1Paid,
      partner2Paid,
      partner1Owes,
      partner2Owes,
      amount,
      from: partner1Net > 0 ? 'partner2' : 'partner1',
      to: partner1Net > 0 ? 'partner1' : 'partner2',
      expenseCount: monthExpenses.length,
    };
  }, [currentMonth, expenses]);

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Settle-Up</h2>
        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
      </div>

      {settlement.expenseCount === 0 ? (
        <p className="text-sm text-muted-foreground">No shared expenses tracked for this month yet.</p>
      ) : settlement.amount === 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary">You are fully balanced this month.</p>
          <p className="text-xs text-muted-foreground">Shared spending is already split evenly across both partners.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Suggested settlement</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {partnerNames[settlement.from!]} owes {partnerNames[settlement.to!]} <span className="font-mono-data">€{settlement.amount.toFixed(2)}</span>
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-surface-alt p-3">
              <p className="text-xs text-muted-foreground">{partnerNames.partner1} paid / share</p>
              <p className="mt-1 font-mono-data text-sm font-semibold text-foreground">
                €{settlement.partner1Paid.toFixed(2)} / €{settlement.partner1Owes.toFixed(2)}
              </p>
            </div>
            <div className="rounded-md bg-surface-alt p-3">
              <p className="text-xs text-muted-foreground">{partnerNames.partner2} paid / share</p>
              <p className="mt-1 font-mono-data text-sm font-semibold text-foreground">
                €{settlement.partner2Paid.toFixed(2)} / €{settlement.partner2Owes.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Based on {settlement.expenseCount} shared expense{settlement.expenseCount === 1 ? '' : 's'} in the selected month.</p>
        </div>
      )}
    </div>
  );
}

import { useBudget } from '@/context/BudgetContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function PartnerView() {
  const { expenses, partnerNames, categories, currentMonth } = useBudget();

  const currentMonthExpenses = expenses.filter(expense => {
    const expenseMonth = expense.date.slice(0, 7);
    if (expense.recurring) {
      return expenseMonth <= currentMonth;
    }
    return expenseMonth === currentMonth;
  });

  const sharedTotal = currentMonthExpenses.filter(e => e.shared).reduce((s, e) => s + e.amount, 0);
  const personalP1 = currentMonthExpenses.filter(e => !e.shared && e.paidBy === 'partner1').reduce((s, e) => s + e.amount, 0);
  const personalP2 = currentMonthExpenses.filter(e => !e.shared && e.paidBy === 'partner2').reduce((s, e) => s + e.amount, 0);

  const topCategories = categories
    .map(c => {
      const p1 = currentMonthExpenses.filter(e => e.category === c.category && e.paidBy === 'partner1').reduce((s, e) => s + e.amount, 0);
      const p2 = currentMonthExpenses.filter(e => e.category === c.category && e.paidBy === 'partner2').reduce((s, e) => s + e.amount, 0);
      return { name: c.label, [partnerNames.partner1]: p1, [partnerNames.partner2]: p2 };
    })
    .filter(c => (c[partnerNames.partner1] as number) > 0 || (c[partnerNames.partner2] as number) > 0)
    .sort((a, b) => ((b[partnerNames.partner1] as number) + (b[partnerNames.partner2] as number)) - ((a[partnerNames.partner1] as number) + (a[partnerNames.partner2] as number)))
    .slice(0, 6);

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Partner Breakdown</h2>

      <div className="mb-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-md bg-surface-alt p-3">
          <p className="text-xs text-muted-foreground">Shared</p>
          <p className="font-mono-data text-base font-semibold text-foreground">€{sharedTotal.toFixed(2)}</p>
        </div>
        <div className="rounded-md bg-surface-alt p-3">
          <p className="text-xs text-muted-foreground">{partnerNames.partner1}</p>
          <p className="font-mono-data text-base font-semibold text-foreground">€{personalP1.toFixed(2)}</p>
        </div>
        <div className="rounded-md bg-surface-alt p-3">
          <p className="text-xs text-muted-foreground">{partnerNames.partner2}</p>
          <p className="font-mono-data text-base font-semibold text-foreground">€{personalP2.toFixed(2)}</p>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topCategories} barGap={2}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `€${Number(v).toFixed(2)}`} />
            <Tooltip
              formatter={(value: number) => `€${value.toFixed(2)}`}
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
            />
            <Bar dataKey={partnerNames.partner1} fill="hsl(105, 45%, 21%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey={partnerNames.partner2} fill="hsl(36, 91%, 43%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

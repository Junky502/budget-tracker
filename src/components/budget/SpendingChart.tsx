import { useBudget } from '@/context/BudgetContext';
import { CATEGORY_CONFIG } from '@/types/budget';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  'hsl(105, 45%, 21%)', 'hsl(36, 91%, 43%)', 'hsl(30, 84%, 38%)',
  'hsl(160, 40%, 35%)', 'hsl(200, 40%, 40%)', 'hsl(280, 30%, 45%)',
  'hsl(340, 35%, 45%)', 'hsl(50, 60%, 45%)', 'hsl(105, 30%, 40%)',
  'hsl(20, 50%, 50%)', 'hsl(180, 35%, 35%)', 'hsl(240, 25%, 50%)',
  'hsl(70, 40%, 40%)', 'hsl(310, 30%, 40%)', 'hsl(140, 35%, 30%)',
  'hsl(10, 45%, 45%)', 'hsl(90, 35%, 50%)',
];

export function SpendingChart() {
  const { expensesByCategory } = useBudget();

  const data = CATEGORY_CONFIG
    .filter(c => (expensesByCategory[c.category] || 0) > 0)
    .map(c => ({ name: c.label, value: expensesByCategory[c.category] || 0, icon: c.icon }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Spending Distribution</h2>
      <div className="flex items-center gap-6">
        <div className="h-[220px] w-[220px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2} dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `€${value.toLocaleString()}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '13px', fontFamily: '"JetBrains Mono", monospace' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-1.5 overflow-hidden">
          {data.slice(0, 7).map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="truncate text-xs text-muted-foreground">{item.icon} {item.name}</span>
              <span className="ml-auto font-mono-data text-xs text-foreground">€{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

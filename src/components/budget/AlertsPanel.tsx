import { useBudget } from '@/context/BudgetContext';
import { CATEGORY_CONFIG } from '@/types/budget';
import { motion } from 'framer-motion';

const statusStyles = {
  green: 'bg-primary/10 text-primary border-primary/20',
  yellow: 'bg-accent/10 text-accent border-accent/20',
  red: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusDot = {
  green: 'bg-primary',
  yellow: 'bg-accent',
  red: 'bg-destructive',
};

export function AlertsPanel() {
  const { alerts } = useBudget();

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Category Health</h2>
      <div className="space-y-2">
        {alerts.slice(0, 8).map((alert, i) => {
          const config = CATEGORY_CONFIG.find(c => c.category === alert.category)!;
          return (
            <motion.div
              key={alert.category}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className={`flex items-center justify-between rounded-md border px-3 py-2.5 ${statusStyles[alert.status]}`}
            >
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${statusDot[alert.status]}`} />
                <span className="text-sm">{config.icon} {alert.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono-data text-xs">€{Math.round(alert.spent)}</span>
                <span className="font-mono-data text-xs opacity-60">{alert.percentage.toFixed(1)}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

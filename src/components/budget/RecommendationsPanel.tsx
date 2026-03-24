import { useBudget } from '@/context/BudgetContext';
import { CATEGORY_CONFIG } from '@/types/budget';
import { motion } from 'framer-motion';

export function RecommendationsPanel() {
  const { recommendations } = useBudget();

  if (recommendations.length === 0) {
    return (
      <div className="rounded-lg bg-card p-6 shadow-warm">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Cut-Back Ideas</h2>
        <p className="text-sm text-muted-foreground">Looking good! No cut-backs needed right now. 🌿</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Cut-Back Ideas</h2>
      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const config = CATEGORY_CONFIG.find(c => c.category === rec.category)!;
          return (
            <motion.div
              key={rec.category}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-md border border-border bg-surface-alt p-4"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{config.icon} {rec.label}</span>
                <span className="font-mono-data text-sm font-semibold text-primary">Save €{Math.round(rec.savings)}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{rec.message}</p>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span>Now: <span className="font-mono-data text-foreground">€{Math.round(rec.currentSpend)}</span></span>
                <span>Target: <span className="font-mono-data text-primary">€{Math.round(rec.suggestedSpend)}</span></span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

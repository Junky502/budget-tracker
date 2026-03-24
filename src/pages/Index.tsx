import { BudgetProvider } from '@/context/BudgetContext';
import { HealthRing } from '@/components/budget/HealthRing';
import { IncomePanel } from '@/components/budget/IncomePanel';
import { AlertsPanel } from '@/components/budget/AlertsPanel';
import { RecommendationsPanel } from '@/components/budget/RecommendationsPanel';
import { SpendingChart } from '@/components/budget/SpendingChart';
import { MonthComparison } from '@/components/budget/MonthComparison';
import { PartnerView } from '@/components/budget/PartnerView';
import { AddExpenseDialog } from '@/components/budget/AddExpenseDialog';
import { RecentExpenses } from '@/components/budget/RecentExpenses';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] as const } },
};

export default function Index() {
  return (
    <BudgetProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Hearth</h1>
                <p className="text-xs text-muted-foreground">March 2026</p>
              </div>
            </div>
            <AddExpenseDialog />
          </div>
        </header>

        {/* Dashboard */}
        <motion.main
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-7xl px-6 py-8"
        >
          {/* Top row */}
          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div variants={fadeUp}>
              <HealthRing />
            </motion.div>
            <motion.div variants={fadeUp}>
              <IncomePanel />
            </motion.div>
            <motion.div variants={fadeUp}>
              <AlertsPanel />
            </motion.div>
          </div>

          {/* Charts row */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <motion.div variants={fadeUp}>
              <SpendingChart />
            </motion.div>
            <motion.div variants={fadeUp}>
              <PartnerView />
            </motion.div>
          </div>

          {/* Bottom row */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <motion.div variants={fadeUp}>
              <RecommendationsPanel />
            </motion.div>
            <motion.div variants={fadeUp}>
              <MonthComparison />
            </motion.div>
            <motion.div variants={fadeUp}>
              <RecentExpenses />
            </motion.div>
          </div>
        </motion.main>
      </div>
    </BudgetProvider>
  );
}

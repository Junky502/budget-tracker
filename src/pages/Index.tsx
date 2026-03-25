import { BudgetProvider, useBudget } from '@/context/BudgetContext';
import { useAuth } from '@/context/AuthContext';
import { HealthRing } from '@/components/budget/HealthRing';
import { IncomePanel } from '@/components/budget/IncomePanel';
import { AlertsPanel } from '@/components/budget/AlertsPanel';
import { RecommendationsPanel } from '@/components/budget/RecommendationsPanel';
import { SpendingChart } from '@/components/budget/SpendingChart';
import { MonthComparison } from '@/components/budget/MonthComparison';
import { PartnerView } from '@/components/budget/PartnerView';
import { ExpenseDialog } from '@/components/budget/ExpenseDialog';
import { SeasonalRecap } from '@/components/budget/SeasonalRecap';
import { CategoryManager } from '@/components/budget/CategoryManager';
import { RecentExpenses } from '@/components/budget/RecentExpenses';
import { GoalsPanel } from '@/components/budget/GoalsPanel';
import { PaceCheckPanel } from '@/components/budget/PaceCheckPanel';
import { SettleUpWidget } from '@/components/budget/SettleUpWidget';
import { BillsCalendar } from '@/components/budget/BillsCalendar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Wallet, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { format } from 'date-fns';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] as const } },
};

function Header() {
  const { currentMonth, setCurrentMonth } = useBudget();
  const { logout } = useAuth();

  const changeMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonth);
  };

  const monthName = format(new Date(currentMonth + '-01'), 'MMMM yyyy');

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Budget</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => changeMonth('prev')} className="text-xs text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-xs text-muted-foreground">{monthName}</p>
              <button onClick={() => changeMonth('next')} className="text-xs text-muted-foreground hover:text-foreground">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
          <CategoryManager />
          <ExpenseDialog
            mode="add"
            trigger={
              <Button className="gap-2">
                Add Expense
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            title="Logout"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function IndexContent() {
  const { loading } = useBudget();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="h-10 w-40 animate-pulse rounded-lg bg-muted"></div>
          </div>
        </div>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-muted"></div>
            ))}
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-lg bg-muted"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

        {/* Dashboard */}
        <motion.main
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-sm grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
                <motion.div variants={fadeUp}>
                  <HealthRing />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <IncomePanel />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <GoalsPanel />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <AlertsPanel />
                </motion.div>
              </div>

              <div className="grid gap-6 xl:grid-cols-3">
                <motion.div variants={fadeUp}>
                  <SpendingChart />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <PartnerView />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <SettleUpWidget />
                </motion.div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
                <motion.div variants={fadeUp}>
                  <PaceCheckPanel />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <RecommendationsPanel />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <MonthComparison />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <SeasonalRecap />
                </motion.div>
              </div>

              <motion.div variants={fadeUp}>
                <RecentExpenses />
              </motion.div>
            </TabsContent>

            <TabsContent value="calendar">
              <motion.div variants={fadeUp}>
                <BillsCalendar />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.main>
      </div>
    );
}

export default function Index() {
  return (
    <BudgetProvider>
      <IndexContent />
    </BudgetProvider>
  );
}

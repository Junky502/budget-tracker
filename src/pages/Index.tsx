import { BudgetProvider, useBudget } from '@/context/BudgetContext';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef, useState } from 'react';
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
import { BillsCalendar } from '@/components/budget/BillsCalendar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { Wallet, ChevronLeft, ChevronRight, LogOut, CalendarDays, BarChart3, List, Plus } from 'lucide-react';
import { format } from 'date-fns';

type DashboardTab = 'calendar' | 'overview' | 'categories';
const mobileTabOrder: DashboardTab[] = ['calendar', 'overview', 'categories'];

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
    <header className="sticky top-0 z-10 hidden border-b border-border bg-background/80 backdrop-blur-md sm:block">
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
  const { loading, currentMonth, setCurrentMonth, savingsRate, totalIncome, totalExpenses, remainingBudget } = useBudget();
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isMobile && activeTab === 'categories') {
      setActiveTab('overview');
    }
  }, [activeTab, isMobile]);

  const moveTab = (direction: 'prev' | 'next') => {
    const currentIndex = mobileTabOrder.indexOf(activeTab);
    if (currentIndex === -1) {
      return;
    }
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= mobileTabOrder.length) {
      return;
    }
    setActiveTab(mobileTabOrder[targetIndex]);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) {
      return;
    }
    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || !touchStartRef.current) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const minSwipeDistance = 50;

    if (absX < minSwipeDistance || absX < absY * 1.2) {
      return;
    }

    if (deltaX < 0) {
      moveTab('next');
    } else {
      moveTab('prev');
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 hidden border-b border-border bg-background/80 backdrop-blur-md sm:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="h-10 w-40 animate-pulse rounded-lg bg-muted"></div>
          </div>
        </div>
        <main className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 sm:pb-8">
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
        className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 sm:pb-8"
      >
        {/* Mobile sticky top bar */}
        <div className="-mx-4 -mt-6 mb-4 flex items-center border-b border-border bg-background/95 px-3 py-2 backdrop-blur-md sm:hidden">
          {/* Month controls */}
          <div className="flex items-center gap-1">
            <button onClick={() => changeMonth('prev')} className="rounded-md p-1 text-muted-foreground hover:text-foreground" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-xs font-medium text-muted-foreground">{monthName}</p>
            <button onClick={() => changeMonth('next')} className="rounded-md p-1 text-muted-foreground hover:text-foreground" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Vertical divider */}
          <div className="mx-2 h-6 w-px flex-shrink-0 bg-border" />

          {/* Mini health ring */}
          {(() => {
            const clampedRate = Math.max(0, Math.min(100, savingsRate));
            const r = 15;
            const circ = 2 * Math.PI * r;
            const offset = circ - (clampedRate / 100) * circ;
            const ringColor = clampedRate >= 20 ? 'hsl(var(--success))' : clampedRate >= 10 ? 'hsl(var(--warning))' : 'hsl(var(--danger))';
            return (
              <div className="relative flex-shrink-0">
                <svg width="38" height="38" viewBox="0 0 38 38">
                  <circle cx="19" cy="19" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                  <circle
                    cx="19" cy="19" r={r} fill="none"
                    stroke={ringColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    transform="rotate(-90 19 19)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] font-bold leading-none text-foreground">{Math.round(clampedRate)}%</span>
                </div>
              </div>
            );
          })()}

          {/* Income / Spent / Left — evenly spread across remaining space */}
          <div className="ml-2 flex flex-1 items-center justify-around">
            <div className="text-center">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Income</p>
              <p className="text-xs font-semibold text-foreground">€{totalIncome.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Spent</p>
              <p className="text-xs font-semibold text-foreground">€{totalExpenses.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Left</p>
              <p className="text-xs font-semibold" style={{ color: remainingBudget >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))' }}>€{remainingBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)} className="space-y-6">
          <TabsList className="hidden w-full max-w-sm grid-cols-2 sm:grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <div className="touch-pan-y" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <motion.div variants={fadeUp} className="hidden sm:block">
                  <HealthRing />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <IncomePanel />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <GoalsPanel />
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
                  <PaceCheckPanel />
                </motion.div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
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

              <div className="grid gap-6 lg:grid-cols-2">
                <motion.div variants={fadeUp}>
                  <AlertsPanel />
                </motion.div>
                <motion.div variants={fadeUp}>
                  <RecentExpenses />
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <motion.div variants={fadeUp}>
                <BillsCalendar />
              </motion.div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <motion.div variants={fadeUp}>
                <div className="rounded-lg bg-card p-6 shadow-warm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Manage Categories</h2>
                    <CategoryManager
                      trigger={
                        <Button variant="outline" size="sm">
                          Open Manager
                        </Button>
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Review category health below and use the manager to add, edit, or remove categories.</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <AlertsPanel />
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </motion.main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Open calendar view"
          >
            <CalendarDays className="h-5 w-5" />
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Open spending distribution"
          >
            <BarChart3 className="h-5 w-5" />
          </button>

          <ExpenseDialog
            mode="add"
            trigger={
              <button
                className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
                aria-label="Add expense"
              >
                <Plus className="h-7 w-7" />
              </button>
            }
          />

          <CategoryManager
            trigger={
              <button
                className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Manage categories"
              >
                <List className="h-5 w-5" />
              </button>
            }
          />

          <button
            onClick={logout}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>
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

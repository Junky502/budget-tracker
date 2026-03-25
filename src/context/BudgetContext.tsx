import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { Income, Expense, Partner, BudgetAlert, CutbackRecommendation, ExpenseCategory, StoredCategory, BudgetGoal, GoalProgress } from '@/types/budget';
import { supabase } from '@/lib/supabase';
import { getCurrentMonthKey, parseMonthKey } from '@/lib/periods';

interface BudgetContextType {
  incomes: Income[];
  expenses: Expense[];
  goals: BudgetGoal[];
  partnerNames: Record<Partner, string>;
  setPartnerNames: (names: Record<Partner, string>) => Promise<void>;
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  removeIncome: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Omit<Expense, 'id'>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  addGoal: (goal: Omit<BudgetGoal, 'id'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Omit<BudgetGoal, 'id'>>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  totalIncome: number;
  incomeByPartner: Record<Partner, number>;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  expensesByPartner: Record<Partner, number>;
  goalProgress: GoalProgress[];
  pacingAlerts: GoalProgress[];
  savingsRate: number;
  remainingBudget: number;
  alerts: BudgetAlert[];
  recommendations: CutbackRecommendation[];
  previousMonth: { totalExpenses: number; expensesByCategory: Record<string, number> };
  seasonalData: { current: { totalExpenses: number; expensesByCategory: Record<string, number> }; previous: { totalExpenses: number; expensesByCategory: Record<string, number> } };
  currentMonth: string; // YYYY-MM
  setCurrentMonth: (month: string) => void;
  categories: StoredCategory[];
  addCategory: (category: Omit<StoredCategory, 'id'>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<StoredCategory>) => Promise<void>;
  loading: boolean;
}

const BudgetContext = createContext<BudgetContextType | null>(null);

const SUPABASE_ERROR_INCOME: Income = {
  id: 'supabase-error-income',
  partner: 'partner1',
  source: 'Salary 404',
  amount: 0,
  recurring: false,
};

const supabaseErrorExpense = (): Expense => ({
  id: 'supabase-error-expense',
  category: 'discretionary',
  description: 'SUPABASE',
  amount: 0,
  date: `${getCurrentMonthKey()}-01`,
  recurring: false,
  paidBy: 'partner1',
  shared: false,
});

const DEFAULT_PARTNER_NAMES: Record<Partner, string> = {
  partner1: 'Mārtiņš',
  partner2: 'Marta',
};

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<BudgetGoal[]>([]);
  const [partnerNames, setPartnerNamesState] = useState<Record<Partner, string>>(DEFAULT_PARTNER_NAMES);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonthState] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [categories, setCategories] = useState<StoredCategory[]>([]);

  // Load data from Supabase on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        console.log('Starting to load data from Supabase...');
        
        // Fetch incomes
        const { data: dbIncomes, error: incomesError } = await supabase.from('incomes').select('*');
        if (incomesError) throw incomesError;
        
        if (dbIncomes && dbIncomes.length > 0) {
          console.log('Loaded incomes from DB:', dbIncomes.length);
          setIncomes(dbIncomes.map(r => ({
            id: r.id,
            partner: r.partner as Partner,
            source: r.source,
            amount: Number(r.amount),
            recurring: r.recurring,
          })));
        } else {
          console.log('No incomes in DB');
          setIncomes([]);
        }

        // Fetch expenses
        const { data: dbExpenses, error: expensesError } = await supabase.from('expenses').select('*');
        if (expensesError) throw expensesError;
        
        if (dbExpenses && dbExpenses.length > 0) {
          console.log('Loaded expenses from DB:', dbExpenses.length);
          setExpenses(dbExpenses.map(r => ({
            id: r.id,
            category: r.category as ExpenseCategory,
            description: r.description,
            amount: Number(r.amount),
            date: r.date,
            recurring: Boolean(r.recurring),
            paidBy: r.paid_by as Partner,
            shared: r.shared,
            splitAmounts: r.split_amounts ? JSON.parse(r.split_amounts) : undefined,
          })));
        } else {
          console.log('No expenses in DB');
          setExpenses([]);
        }

        // Fetch partner names
        const { data: settings, error: settingsError } = await supabase.from('settings').select('*');
        if (settingsError) throw settingsError;
        
        if (settings && settings.length > 0) {
          console.log('Loaded settings from DB');
          const names = { ...DEFAULT_PARTNER_NAMES };
          settings.forEach(s => {
            if (s.key === 'partner1_name') names.partner1 = s.value;
            if (s.key === 'partner2_name') names.partner2 = s.value;
          });
          setPartnerNamesState(names);
        } else {
          console.log('No settings in DB');
        }

        // Fetch categories
        const { data: dbCategories, error: categoriesError } = await supabase.from('categories').select('*');
        if (categoriesError) throw categoriesError;

        if (dbCategories && dbCategories.length > 0) {
          console.log('Loaded categories from DB:', dbCategories.length);
          setCategories(dbCategories.map(c => ({
            id: c.id,
            category: c.category,
            label: c.label,
            icon: c.icon,
            recommended: Number(c.recommended),
          })));
        } else {
          console.log('No categories in DB');
          setCategories([]);
        }

        // Fetch goals
        const { data: dbGoals, error: goalsError } = await supabase
          .from('budget_goals')
          .select('*')
          .order('created_at', { ascending: true });
        if (goalsError) throw goalsError;

        if (dbGoals && dbGoals.length > 0) {
          setGoals(dbGoals.map(goal => ({
            id: goal.id,
            category: goal.category as ExpenseCategory,
            targetType: goal.target_type,
            value: Number(goal.value),
            startMonth: goal.start_month,
          })));
        } else {
          setGoals([]);
        }
      } catch (err) {
        console.error('Failed to load from Supabase:', err);
        setIncomes([SUPABASE_ERROR_INCOME]);
        setExpenses([supabaseErrorExpense()]);
        setPartnerNamesState(DEFAULT_PARTNER_NAMES);
        setCategories([]);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const addIncome = useCallback(async (income: Omit<Income, 'id'>) => {
    const { data, error } = await supabase.from('incomes').insert({
      partner: income.partner,
      source: income.source,
      amount: income.amount,
      recurring: income.recurring,
    }).select().single();
    
    if (data && !error) {
      setIncomes(prev => [...prev, {
        id: data.id, partner: data.partner as Partner, source: data.source,
        amount: Number(data.amount), recurring: data.recurring,
      }]);
    }
  }, []);

  const removeIncome = useCallback(async (id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
    await supabase.from('incomes').delete().eq('id', id);
  }, []);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    try {
      console.log('Adding expense:', expense);
      
      // Build insert object conditionally
      const insertData: any = {
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        recurring: Boolean(expense.recurring),
        paid_by: expense.paidBy,
        shared: expense.shared,
      };
      
      // Only include split_amounts if it exists
      if (expense.splitAmounts) {
        insertData.split_amounts = JSON.stringify(expense.splitAmounts);
      }
      
      const { data, error } = await supabase.from('expenses').insert(insertData).select().single();
      
      if (error) {
        console.error('Error adding expense to Supabase:', error);
        alert('Error adding expense: ' + (error.message || 'Unknown error'));
        return;
      }
      
      if (data) {
        console.log('Expense added successfully:', data);
        setExpenses(prev => [...prev, {
          id: data.id, 
          category: data.category as ExpenseCategory, 
          description: data.description,
          amount: Number(data.amount), 
          date: data.date, 
          recurring: Boolean(data.recurring),
          paidBy: data.paid_by as Partner, 
          shared: data.shared,
          splitAmounts: data.split_amounts ? JSON.parse(data.split_amounts) : undefined,
        }]);
      }
    } catch (err) {
      console.error('Exception while adding expense:', err);
      alert('Error adding expense: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, []);

  const updateExpense = useCallback(async (id: string, expense: Omit<Expense, 'id'>) => {
    const previousExpense = expenses.find(existingExpense => existingExpense.id === id);
    if (!previousExpense) {
      return;
    }

    const updatedExpense: Expense = { id, ...expense };
    setExpenses(prev => prev.map(existingExpense => (existingExpense.id === id ? updatedExpense : existingExpense)));

    try {
      const updateData: Record<string, unknown> = {
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        recurring: Boolean(expense.recurring),
        paid_by: expense.paidBy,
        shared: expense.shared,
        split_amounts: expense.splitAmounts ? JSON.stringify(expense.splitAmounts) : null,
      };

      const { error } = await supabase.from('expenses').update(updateData).eq('id', id);
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Exception while updating expense:', err);
      setExpenses(prev => prev.map(existingExpense => (existingExpense.id === id ? previousExpense : existingExpense)));
      alert('Error updating expense: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [expenses]);

  const removeExpense = useCallback(async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    await supabase.from('expenses').delete().eq('id', id);
  }, []);

  const addGoal = useCallback(async (goal: Omit<BudgetGoal, 'id'>) => {
    try {
      const { data, error } = await supabase.from('budget_goals').insert({
        category: goal.category,
        target_type: goal.targetType,
        value: goal.value,
        start_month: goal.startMonth,
      }).select().single();

      if (error) {
        throw error;
      }

      if (data) {
        setGoals(prev => [...prev, {
          id: data.id,
          category: data.category as ExpenseCategory,
          targetType: data.target_type,
          value: Number(data.value),
          startMonth: data.start_month,
        }]);
      }
    } catch (err) {
      console.error('Supabase addGoal failed:', err);
      alert('Error adding goal: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, []);

  const updateGoal = useCallback(async (id: string, updates: Partial<Omit<BudgetGoal, 'id'>>) => {
    const previousGoal = goals.find(goal => goal.id === id);
    if (!previousGoal) {
      return;
    }

    setGoals(prev => prev.map(goal => (goal.id === id ? { ...goal, ...updates } : goal)));

    try {
      const updateData: Record<string, unknown> = {};
      if (updates.category) updateData.category = updates.category;
      if (updates.targetType) updateData.target_type = updates.targetType;
      if (typeof updates.value === 'number') updateData.value = updates.value;
      if (updates.startMonth) updateData.start_month = updates.startMonth;

      const { error } = await supabase.from('budget_goals').update(updateData).eq('id', id);
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Supabase updateGoal failed:', err);
      setGoals(prev => prev.map(goal => (goal.id === id ? previousGoal : goal)));
      alert('Error updating goal: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [goals]);

  const removeGoal = useCallback(async (id: string) => {
    const previousGoals = goals;
    setGoals(prev => prev.filter(goal => goal.id !== id));

    try {
      const { error } = await supabase.from('budget_goals').delete().eq('id', id);
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Supabase removeGoal failed:', err);
      setGoals(previousGoals);
      alert('Error removing goal: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [goals]);

  const setPartnerNames = useCallback(async (names: Record<Partner, string>) => {
    setPartnerNamesState(names);
    await supabase.from('settings').upsert(
      { key: 'partner1_name', value: names.partner1 },
      { onConflict: 'key' }
    );
    await supabase.from('settings').upsert(
      { key: 'partner2_name', value: names.partner2 },
      { onConflict: 'key' }
    );
  }, []);

  const setCurrentMonth = useCallback((month: string) => {
    setCurrentMonthState(month);
  }, []);

  const addCategory = useCallback(async (category: Omit<StoredCategory, 'id'>) => {
    try {
      const { data, error } = await supabase.from('categories').insert({
        category: category.category,
        label: category.label,
        icon: category.icon,
        recommended: category.recommended,
      }).select().single();

      if (data && !error) {
        setCategories(prev => [...prev, {
          id: data.id,
          category: data.category,
          label: data.label,
          icon: data.icon,
          recommended: Number(data.recommended),
        }]);
      }
    } catch (err) {
      console.error('Supabase addCategory failed:', err);
      alert('Error adding category: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, []);

  const removeCategory = useCallback(async (id: string) => {
    const previousCategories = categories;
    setCategories(prev => prev.filter(c => c.id !== id));

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Supabase removeCategory failed:', err);
      setCategories(previousCategories);
      alert('Error removing category: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [categories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<StoredCategory>) => {
    const previousCategories = categories;
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    try {
      const { error } = await supabase.from('categories').update(updates).eq('id', id);
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Supabase updateCategory failed:', err);
      setCategories(previousCategories);
      alert('Error updating category: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [categories]);

  const computed = useMemo(() => {
    const expenseAppliesToMonth = (expense: Expense, month: string) => {
      const expenseMonth = expense.date.slice(0, 7);
      if (expense.recurring) {
        return expenseMonth <= month;
      }
      return expenseMonth === month;
    };

    const aggregateForMonths = (months: string[]) => {
      const totalsByCategory: Record<string, number> = {};
      let total = 0;

      months.forEach(month => {
        expenses.forEach(expense => {
          if (!expenseAppliesToMonth(expense, month)) {
            return;
          }
          total += expense.amount;
          totalsByCategory[expense.category] = (totalsByCategory[expense.category] || 0) + expense.amount;
        });
      });

      return { total, totalsByCategory };
    };

    // Filter expenses by current month, including recurring expenses from their start month onward.
    const currentMonthExpenses = expenses.filter(e => expenseAppliesToMonth(e, currentMonth));
    
    // Get previous month
    const [year, month] = currentMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1); // month is 0-based, so month-2 gives previous month
    const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthExpenses = expenses.filter(e => expenseAppliesToMonth(e, prevMonthStr));

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const incomeByPartner: Record<Partner, number> = {
      partner1: incomes.filter(i => i.partner === 'partner1').reduce((s, i) => s + i.amount, 0),
      partner2: incomes.filter(i => i.partner === 'partner2').reduce((s, i) => s + i.amount, 0),
    };
    const totalExpenses = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);

    const expensesByCategory: Record<string, number> = {};
    currentMonthExpenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    const expensesByPartner: Record<Partner, number> = {
      partner1: currentMonthExpenses.filter(e => e.paidBy === 'partner1').reduce((s, e) => s + e.amount, 0),
      partner2: currentMonthExpenses.filter(e => e.paidBy === 'partner2').reduce((s, e) => s + e.amount, 0),
    };

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const remainingBudget = totalIncome - totalExpenses;

    const alerts: BudgetAlert[] = categories
      .map(cat => {
        const spent = expensesByCategory[cat.category] || 0;
        const recommendedAmount = (cat.recommended / 100) * totalIncome;
        const percentage = totalIncome > 0 ? (spent / totalIncome) * 100 : 0;
        let status: 'green' | 'yellow' | 'red' = 'green';
        if (percentage > cat.recommended * 1.2) status = 'red';
        else if (percentage > cat.recommended * 0.9) status = 'yellow';
        return { category: cat.category as ExpenseCategory, label: cat.label, spent, recommended: recommendedAmount, percentage, status };
      })
      .filter(a => a.spent > 0)
      .sort((a, b) => {
        const order = { red: 0, yellow: 1, green: 2 };
        return order[a.status] - order[b.status];
      });

    const recommendations: CutbackRecommendation[] = alerts
      .filter(a => a.status === 'red' || a.status === 'yellow')
      .map(a => {
        const config = categories.find(c => c.category === a.category);
        if (!config) return null;
        const suggestedSpend = (config.recommended / 100) * totalIncome;
        const savings = a.spent - suggestedSpend;
        return {
          category: a.category, label: a.label, currentSpend: a.spent,
          suggestedSpend, savings,
          message: `Reduce ${a.label.toLowerCase()} by €${Math.round(savings)} to stay within the recommended ${config.recommended}% budget.`,
        };
      })
      .filter((r) => r !== null && r.savings > 0) as CutbackRecommendation[];

    const previousMonth = {
      totalExpenses: prevMonthExpenses.reduce((s, e) => s + e.amount, 0),
      expensesByCategory: prevMonthExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>),
    };

    // Calculate seasonal data (quarters)
    const getQuarter = (monthStr: string) => {
      const month = parseInt(monthStr.split('-')[1]);
      return Math.ceil(month / 3);
    };
    const currentQuarter = getQuarter(currentMonth);
    const currentYear = parseInt(currentMonth.split('-')[0]);
    const quarterMonths = [1, 2, 3].map(offset => {
      const monthNum = (currentQuarter - 1) * 3 + offset;
      return `${currentYear}-${String(monthNum).padStart(2, '0')}`;
    });
    const previousYearQuarterMonths = quarterMonths.map(monthStr => `${currentYear - 1}-${monthStr.split('-')[1]}`);

    const currentQuarterAgg = aggregateForMonths(quarterMonths);
    const previousQuarterAgg = aggregateForMonths(previousYearQuarterMonths);

    const { year: currentYearNumber, monthIndex: currentMonthIndex } = parseMonthKey(currentMonth);
    const daysInMonth = new Date(currentYearNumber, currentMonthIndex + 1, 0).getDate();
    const today = new Date();
    const todayMonthKey = getCurrentMonthKey();
    const isCurrentMonthView = currentMonth === todayMonthKey;
    const isFutureMonthView = currentMonth > todayMonthKey;
    const daysElapsed = isFutureMonthView ? 0 : isCurrentMonthView ? today.getDate() : daysInMonth;

    const goalProgress: GoalProgress[] = goals
      .filter(goal => goal.startMonth <= currentMonth)
      .map(goal => {
        const categoryData = categories.find(category => category.category === goal.category);
        const currentAmount = expensesByCategory[goal.category] || 0;
        const targetAmount = goal.targetType === 'fixed'
          ? goal.value
          : (goal.value / 100) * totalIncome;
        const progressPct = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
        const expectedByNow = targetAmount > 0 ? targetAmount * (daysElapsed / Math.max(daysInMonth, 1)) : 0;
        const variance = currentAmount - expectedByNow;

        let status: GoalProgress['status'] = 'on-track';
        if (targetAmount > 0 && currentAmount > targetAmount) {
          status = 'exceeded';
        } else if (targetAmount > 0 && variance > Math.max(targetAmount * 0.05, 10)) {
          status = 'at-risk';
        }

        return {
          id: goal.id,
          category: goal.category,
          label: categoryData?.label || goal.category,
          icon: categoryData?.icon || '•',
          targetType: goal.targetType,
          configuredValue: goal.value,
          targetAmount,
          currentAmount,
          progressPct,
          expectedByNow,
          variance,
          daysElapsed,
          daysInMonth,
          status,
          isCurrentMonth: isCurrentMonthView,
        };
      })
      .sort((left, right) => right.progressPct - left.progressPct);

    const pacingAlerts = goalProgress.filter(goal => goal.status !== 'on-track');

    const seasonalData = {
      current: {
        totalExpenses: currentQuarterAgg.total,
        expensesByCategory: currentQuarterAgg.totalsByCategory,
      },
      previous: {
        totalExpenses: previousQuarterAgg.total,
        expensesByCategory: previousQuarterAgg.totalsByCategory,
      },
    };

    return { totalIncome, incomeByPartner, totalExpenses, expensesByCategory, expensesByPartner, goalProgress, pacingAlerts, savingsRate, remainingBudget, alerts, recommendations, previousMonth, seasonalData };
  }, [incomes, expenses, currentMonth, categories, goals]);

  return (
    <BudgetContext.Provider value={{ incomes, expenses, goals, partnerNames, setPartnerNames, addIncome, removeIncome, addExpense, updateExpense, removeExpense, addGoal, updateGoal, removeGoal, loading, currentMonth, setCurrentMonth, categories, addCategory, removeCategory, updateCategory, ...computed }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider');
  return ctx;
}

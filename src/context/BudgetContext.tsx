import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { Income, Expense, Partner, BudgetAlert, CutbackRecommendation, ExpenseCategory, StoredCategory, DEFAULT_CATEGORIES } from '@/types/budget';
import { supabase } from '@/lib/supabase';

interface BudgetContextType {
  incomes: Income[];
  expenses: Expense[];
  partnerNames: Record<Partner, string>;
  setPartnerNames: (names: Record<Partner, string>) => void;
  addIncome: (income: Omit<Income, 'id'>) => void;
  removeIncome: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  totalIncome: number;
  incomeByPartner: Record<Partner, number>;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  expensesByPartner: Record<Partner, number>;
  savingsRate: number;
  remainingBudget: number;
  alerts: BudgetAlert[];
  recommendations: CutbackRecommendation[];
  previousMonth: { totalExpenses: number; expensesByCategory: Record<string, number> };
  seasonalData: { current: { totalExpenses: number; expensesByCategory: Record<string, number> }; previous: { totalExpenses: number; expensesByCategory: Record<string, number> } };
  currentMonth: string; // YYYY-MM
  setCurrentMonth: (month: string) => void;
  categories: StoredCategory[];
  addCategory: (category: Omit<StoredCategory, 'id'>) => void;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, updates: Partial<StoredCategory>) => void;
  loading: boolean;
}

const BudgetContext = createContext<BudgetContextType | null>(null);

const SAMPLE_INCOMES: Income[] = [
  { id: '1', partner: 'partner1', source: 'Salary', amount: 4200, recurring: true },
  { id: '2', partner: 'partner2', source: 'Salary', amount: 3800, recurring: true },
  { id: '3', partner: 'partner1', source: 'Freelance', amount: 600, recurring: false },
];

const SAMPLE_EXPENSES: Expense[] = [
  { id: '1', category: 'housing', description: 'Rent', amount: 1800, date: '2026-03-01', paidBy: 'partner1', shared: true, splitAmounts: { partner1: 900, partner2: 900 } },
  { id: '2', category: 'utilities', description: 'Electricity', amount: 120, date: '2026-03-03', paidBy: 'partner2', shared: true, splitAmounts: { partner1: 60, partner2: 60 } },
  { id: '3', category: 'groceries', description: 'Weekly shop', amount: 185, date: '2026-03-05', paidBy: 'partner1', shared: true, splitAmounts: { partner1: 92.5, partner2: 92.5 } },
  { id: '4', category: 'groceries', description: 'Farmers market', amount: 65, date: '2026-03-12', paidBy: 'partner2', shared: true, splitAmounts: { partner1: 32.5, partner2: 32.5 } },
  { id: '5', category: 'dining-out', description: 'Sushi dinner', amount: 95, date: '2026-03-07', paidBy: 'partner1', shared: true, splitAmounts: { partner1: 47.5, partner2: 47.5 } },
  { id: '6', category: 'dining-out', description: 'Brunch', amount: 48, date: '2026-03-14', paidBy: 'partner2', shared: true, splitAmounts: { partner1: 24, partner2: 24 } },
  { id: '7', category: 'dining-out', description: 'Pizza night', amount: 42, date: '2026-03-20', paidBy: 'partner1', shared: true, splitAmounts: { partner1: 21, partner2: 21 } },
  { id: '8', category: 'entertainment', description: 'Cinema', amount: 32, date: '2026-03-08', paidBy: 'partner2', shared: true, splitAmounts: { partner1: 16, partner2: 16 } },
  { id: '9', category: 'entertainment', description: 'Concert tickets', amount: 150, date: '2026-03-15', paidBy: 'partner1', shared: true, splitAmounts: { partner1: 75, partner2: 75 } },
  { id: '10', category: 'transportation', description: 'Metro pass', amount: 80, date: '2026-03-01', paidBy: 'partner1', shared: false },
  { id: '11', category: 'transportation', description: 'Metro pass', amount: 80, date: '2026-03-01', paidBy: 'partner2', shared: false },
  { id: '12', category: 'healthcare', description: 'Pharmacy', amount: 35, date: '2026-03-10', paidBy: 'partner1', shared: false },
  { id: '13', category: 'subscriptions', description: 'Streaming', amount: 45, date: '2026-03-01', paidBy: 'partner1', shared: true, splitAmounts: { partner1: 22.5, partner2: 22.5 } },
  { id: '14', category: 'personal-care', description: 'Haircut', amount: 55, date: '2026-03-11', paidBy: 'partner2', shared: false },
  { id: '15', category: 'clothing', description: 'New shoes', amount: 120, date: '2026-03-18', paidBy: 'partner1', shared: false },
  { id: '16', category: 'savings', description: 'Emergency fund', amount: 500, date: '2026-03-01', paidBy: 'partner1', shared: true, splitAmounts: { partner1: 250, partner2: 250 } },
  { id: '17', category: 'insurance', description: 'Health insurance', amount: 280, date: '2026-03-01', paidBy: 'partner2', shared: true, splitAmounts: { partner1: 140, partner2: 140 } },
  { id: '18', category: 'pets', description: 'Dog food', amount: 60, date: '2026-03-06', paidBy: 'partner2', shared: true, splitAmounts: { partner1: 30, partner2: 30 } },
  { id: '19', category: 'gifts', description: 'Birthday gift', amount: 75, date: '2026-03-22', paidBy: 'partner1', shared: false },
  { id: '20', category: 'discretionary', description: 'Book', amount: 25, date: '2026-03-09', paidBy: 'partner2', shared: false },
];

const DEFAULT_PARTNER_NAMES: Record<Partner, string> = {
  partner1: 'Mārtiņš',
  partner2: 'Marta',
};

const PREV_MONTH: Record<string, number> = {
  'housing': 1800, 'utilities': 95, 'groceries': 220, 'dining-out': 120,
  'entertainment': 100, 'transportation': 160, 'healthcare': 40,
  'subscriptions': 45, 'personal-care': 30, 'clothing': 60,
  'savings': 500, 'insurance': 280, 'pets': 55, 'gifts': 0,
  'discretionary': 80, 'home-maintenance': 0, 'education': 0,
};

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
          console.log('No incomes in DB, seeding with sample data...');
          // Seed with sample data
          const { data: seeded, error: seedError } = await supabase.from('incomes').insert(
            SAMPLE_INCOMES.map(({ id, ...rest }) => rest)
          ).select();
          
          if (seedError) throw seedError;
          
          if (seeded) {
            setIncomes(seeded.map(r => ({
              id: r.id, partner: r.partner as Partner, source: r.source,
              amount: Number(r.amount), recurring: r.recurring,
            })));
          }
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
          console.log('No settings in DB, seeding default names...');
          // Seed default names
          await supabase.from('settings').insert([
            { key: 'partner1_name', value: DEFAULT_PARTNER_NAMES.partner1 },
            { key: 'partner2_name', value: DEFAULT_PARTNER_NAMES.partner2 },
          ]);
        }

        // Fetch categories
        try {
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
            console.log('No categories in DB, seeding with defaults...');
            // Seed with default categories
            const { data: seeded, error: seedError } = await supabase.from('categories').insert(
              DEFAULT_CATEGORIES.map(({ category, label, icon, recommended }) => ({
                category, label, icon, recommended
              }))
            ).select();
            
            if (seedError) throw seedError;
            
            if (seeded) {
              setCategories(seeded.map(c => ({
                id: c.id,
                category: c.category,
                label: c.label,
                icon: c.icon,
                recommended: Number(c.recommended),
              })));
            }
          }
        } catch (categoryErr) {
          console.warn('Failed to load categories from Supabase, using localStorage fallback:', categoryErr);
          // Load from localStorage
          const savedCategories = JSON.parse(localStorage.getItem('budget-categories') || '[]');
          if (savedCategories.length > 0) {
            setCategories(savedCategories);
          } else {
            // Use default categories
            setCategories(DEFAULT_CATEGORIES.map((cat, index) => ({
              id: `default-${index}`,
              category: cat.category,
              label: cat.label,
              icon: cat.icon,
              recommended: cat.recommended,
            })));
          }
        }
      } catch (err) {
        console.error('Failed to load from Supabase, using defaults:', err);
        setIncomes(SAMPLE_INCOMES);
        setExpenses(SAMPLE_EXPENSES);
        setPartnerNamesState(DEFAULT_PARTNER_NAMES);

        // Load categories from localStorage or use defaults
        const savedCategories = JSON.parse(localStorage.getItem('budget-categories') || '[]');
        if (savedCategories.length > 0) {
          setCategories(savedCategories);
        } else {
          setCategories(DEFAULT_CATEGORIES.map((cat, index) => ({
            id: `default-${index}`,
            category: cat.category,
            label: cat.label,
            icon: cat.icon,
            recommended: cat.recommended,
          })));
        }
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

  const removeExpense = useCallback(async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    await supabase.from('expenses').delete().eq('id', id);
  }, []);

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
        return;
      }
    } catch (err) {
      console.warn('Supabase addCategory failed, using localStorage fallback:', err);
    }

    // Fallback to localStorage
    const newCategory: StoredCategory = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...category,
    };
    setCategories(prev => [...prev, newCategory]);

    // Save to localStorage
    const savedCategories = JSON.parse(localStorage.getItem('budget-categories') || '[]');
    savedCategories.push(newCategory);
    localStorage.setItem('budget-categories', JSON.stringify(savedCategories));
  }, []);

  const removeCategory = useCallback(async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));

    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase removeCategory failed, using localStorage fallback:', err);

      // Fallback to localStorage
      const savedCategories = JSON.parse(localStorage.getItem('budget-categories') || '[]');
      const filteredCategories = savedCategories.filter((c: StoredCategory) => c.id !== id);
      localStorage.setItem('budget-categories', JSON.stringify(filteredCategories));
    }
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<StoredCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    try {
      await supabase.from('categories').update(updates).eq('id', id);
    } catch (err) {
      console.warn('Supabase updateCategory failed, using localStorage fallback:', err);

      // Fallback to localStorage
      const savedCategories = JSON.parse(localStorage.getItem('budget-categories') || '[]');
      const updatedCategories = savedCategories.map((c: StoredCategory) =>
        c.id === id ? { ...c, ...updates } : c
      );
      localStorage.setItem('budget-categories', JSON.stringify(updatedCategories));
    }
  }, []);

  const computed = useMemo(() => {
    // Filter expenses by current month
    const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    
    // Get previous month
    const [year, month] = currentMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1); // month is 0-based, so month-2 gives previous month
    const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthExpenses = expenses.filter(e => e.date.startsWith(prevMonthStr));

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
    const currentQuarterExpenses = expenses.filter(e => {
      const [y, m] = e.date.split('-').map(Number);
      return y === currentYear && Math.ceil(m / 3) === currentQuarter;
    });
    const prevYearQuarterExpenses = expenses.filter(e => {
      const [y, m] = e.date.split('-').map(Number);
      return y === currentYear - 1 && Math.ceil(m / 3) === currentQuarter;
    });

    const seasonalData = {
      current: {
        totalExpenses: currentQuarterExpenses.reduce((s, e) => s + e.amount, 0),
        expensesByCategory: currentQuarterExpenses.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        }, {} as Record<string, number>),
      },
      previous: {
        totalExpenses: prevYearQuarterExpenses.reduce((s, e) => s + e.amount, 0),
        expensesByCategory: prevYearQuarterExpenses.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        }, {} as Record<string, number>),
      },
    };

    return { totalIncome, incomeByPartner, totalExpenses, expensesByCategory, expensesByPartner, savingsRate, remainingBudget, alerts, recommendations, previousMonth, seasonalData };
  }, [incomes, expenses, currentMonth, categories]);

  return (
    <BudgetContext.Provider value={{ incomes, expenses, partnerNames, setPartnerNames, addIncome, removeIncome, addExpense, removeExpense, loading, currentMonth, setCurrentMonth, categories, addCategory, removeCategory, updateCategory, ...computed }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider');
  return ctx;
}

import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { Income, Expense, Partner, CATEGORY_CONFIG, BudgetAlert, CutbackRecommendation, ExpenseCategory } from '@/types/budget';

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
}

const BudgetContext = createContext<BudgetContextType | null>(null);

const STORAGE_KEYS = {
  incomes: 'hearth-incomes',
  expenses: 'hearth-expenses',
  partnerNames: 'hearth-partner-names',
};

const SAMPLE_INCOMES: Income[] = [
  { id: '1', partner: 'partner1', source: 'Salary', amount: 4200, recurring: true },
  { id: '2', partner: 'partner2', source: 'Salary', amount: 3800, recurring: true },
  { id: '3', partner: 'partner1', source: 'Freelance', amount: 600, recurring: false },
];

const SAMPLE_EXPENSES: Expense[] = [
  { id: '1', category: 'housing', description: 'Rent', amount: 1800, date: '2026-03-01', paidBy: 'partner1', shared: true },
  { id: '2', category: 'utilities', description: 'Electricity', amount: 120, date: '2026-03-03', paidBy: 'partner2', shared: true },
  { id: '3', category: 'groceries', description: 'Weekly shop', amount: 185, date: '2026-03-05', paidBy: 'partner1', shared: true },
  { id: '4', category: 'groceries', description: 'Farmers market', amount: 65, date: '2026-03-12', paidBy: 'partner2', shared: true },
  { id: '5', category: 'dining-out', description: 'Sushi dinner', amount: 95, date: '2026-03-07', paidBy: 'partner1', shared: true },
  { id: '6', category: 'dining-out', description: 'Brunch', amount: 48, date: '2026-03-14', paidBy: 'partner2', shared: true },
  { id: '7', category: 'dining-out', description: 'Pizza night', amount: 42, date: '2026-03-20', paidBy: 'partner1', shared: true },
  { id: '8', category: 'entertainment', description: 'Cinema', amount: 32, date: '2026-03-08', paidBy: 'partner2', shared: true },
  { id: '9', category: 'entertainment', description: 'Concert tickets', amount: 150, date: '2026-03-15', paidBy: 'partner1', shared: true },
  { id: '10', category: 'transportation', description: 'Metro pass', amount: 80, date: '2026-03-01', paidBy: 'partner1', shared: false },
  { id: '11', category: 'transportation', description: 'Metro pass', amount: 80, date: '2026-03-01', paidBy: 'partner2', shared: false },
  { id: '12', category: 'healthcare', description: 'Pharmacy', amount: 35, date: '2026-03-10', paidBy: 'partner1', shared: false },
  { id: '13', category: 'subscriptions', description: 'Streaming', amount: 45, date: '2026-03-01', paidBy: 'partner1', shared: true },
  { id: '14', category: 'personal-care', description: 'Haircut', amount: 55, date: '2026-03-11', paidBy: 'partner2', shared: false },
  { id: '15', category: 'clothing', description: 'New shoes', amount: 120, date: '2026-03-18', paidBy: 'partner1', shared: false },
  { id: '16', category: 'savings', description: 'Emergency fund', amount: 500, date: '2026-03-01', paidBy: 'partner1', shared: true },
  { id: '17', category: 'insurance', description: 'Health insurance', amount: 280, date: '2026-03-01', paidBy: 'partner2', shared: true },
  { id: '18', category: 'pets', description: 'Dog food', amount: 60, date: '2026-03-06', paidBy: 'partner2', shared: true },
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

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [incomes, setIncomes] = useState<Income[]>(() => loadFromStorage(STORAGE_KEYS.incomes, SAMPLE_INCOMES));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage(STORAGE_KEYS.expenses, SAMPLE_EXPENSES));
  const [partnerNames, setPartnerNames] = useState<Record<Partner, string>>(() => loadFromStorage(STORAGE_KEYS.partnerNames, DEFAULT_PARTNER_NAMES));

  // Persist to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.incomes, JSON.stringify(incomes)); }, [incomes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.partnerNames, JSON.stringify(partnerNames)); }, [partnerNames]);

  const addIncome = (income: Omit<Income, 'id'>) => {
    setIncomes(prev => [...prev, { ...income, id: crypto.randomUUID() }]);
  };

  const removeIncome = (id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expense, id: crypto.randomUUID() }]);
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const computed = useMemo(() => {
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const incomeByPartner: Record<Partner, number> = {
      partner1: incomes.filter(i => i.partner === 'partner1').reduce((s, i) => s + i.amount, 0),
      partner2: incomes.filter(i => i.partner === 'partner2').reduce((s, i) => s + i.amount, 0),
    };
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    const expensesByCategory: Record<string, number> = {};
    expenses.forEach(e => {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    const expensesByPartner: Record<Partner, number> = {
      partner1: expenses.filter(e => e.paidBy === 'partner1').reduce((s, e) => s + e.amount, 0),
      partner2: expenses.filter(e => e.paidBy === 'partner2').reduce((s, e) => s + e.amount, 0),
    };

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const remainingBudget = totalIncome - totalExpenses;

    const alerts: BudgetAlert[] = CATEGORY_CONFIG
      .map(cat => {
        const spent = expensesByCategory[cat.category] || 0;
        const recommendedAmount = (cat.recommended / 100) * totalIncome;
        const percentage = totalIncome > 0 ? (spent / totalIncome) * 100 : 0;
        let status: 'green' | 'yellow' | 'red' = 'green';
        if (percentage > cat.recommended * 1.2) status = 'red';
        else if (percentage > cat.recommended * 0.9) status = 'yellow';
        return { category: cat.category, label: cat.label, spent, recommended: recommendedAmount, percentage, status };
      })
      .filter(a => a.spent > 0)
      .sort((a, b) => {
        const order = { red: 0, yellow: 1, green: 2 };
        return order[a.status] - order[b.status];
      });

    const recommendations: CutbackRecommendation[] = alerts
      .filter(a => a.status === 'red' || a.status === 'yellow')
      .map(a => {
        const config = CATEGORY_CONFIG.find(c => c.category === a.category)!;
        const suggestedSpend = (config.recommended / 100) * totalIncome;
        const savings = a.spent - suggestedSpend;
        return {
          category: a.category,
          label: a.label,
          currentSpend: a.spent,
          suggestedSpend,
          savings,
          message: `Reduce ${a.label.toLowerCase()} by €${Math.round(savings)} to stay within the recommended ${config.recommended}% budget.`,
        };
      })
      .filter(r => r.savings > 0);

    const previousMonth = {
      totalExpenses: Object.values(PREV_MONTH).reduce((s, v) => s + v, 0),
      expensesByCategory: PREV_MONTH,
    };

    return { totalIncome, incomeByPartner, totalExpenses, expensesByCategory, expensesByPartner, savingsRate, remainingBudget, alerts, recommendations, previousMonth };
  }, [incomes, expenses]);

  return (
    <BudgetContext.Provider value={{ incomes, expenses, partnerNames, setPartnerNames, addIncome, removeIncome, addExpense, removeExpense, ...computed }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider');
  return ctx;
}

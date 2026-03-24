export type Partner = 'partner1' | 'partner2';

export type ExpenseCategory =
  | 'housing' | 'utilities' | 'groceries' | 'dining-out' | 'entertainment'
  | 'transportation' | 'healthcare' | 'insurance' | 'personal-care'
  | 'clothing' | 'education' | 'subscriptions' | 'savings' | 'gifts'
  | 'pets' | 'home-maintenance' | 'discretionary';

export interface Income {
  id: string;
  partner: Partner;
  source: string;
  amount: number;
  recurring: boolean;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  paidBy: Partner;
  shared: boolean;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  recommended: number; // percentage of income
  label: string;
  icon: string;
}

export interface BudgetAlert {
  category: ExpenseCategory;
  label: string;
  spent: number;
  recommended: number;
  percentage: number;
  status: 'green' | 'yellow' | 'red';
}

export interface CutbackRecommendation {
  category: ExpenseCategory;
  label: string;
  currentSpend: number;
  suggestedSpend: number;
  savings: number;
  message: string;
}

export interface MonthOption {
  value: string;
  label: string;
}

export interface PeriodSnapshot {
  label: string;
  totalIncome: number;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  hasData: boolean;
}

export interface CategoryDelta {
  category: ExpenseCategory;
  label: string;
  current: number;
  previous: number;
  change: number;
  changePct: number;
}

export interface SeasonalRecap {
  label: string;
  rangeLabel: string;
  comparisonLabel: string;
  hasComparison: boolean;
  currentIncome: number;
  currentExpenses: number;
  previousIncome: number;
  previousExpenses: number;
  topChanges: CategoryDelta[];
}

export const CATEGORY_CONFIG: CategoryBudget[] = [
  { category: 'housing', recommended: 30, label: 'Housing', icon: '🏠' },
  { category: 'utilities', recommended: 5, label: 'Utilities', icon: '💡' },
  { category: 'groceries', recommended: 10, label: 'Groceries', icon: '🛒' },
  { category: 'dining-out', recommended: 5, label: 'Dining Out', icon: '🍽️' },
  { category: 'entertainment', recommended: 5, label: 'Entertainment', icon: '🎬' },
  { category: 'transportation', recommended: 10, label: 'Transport', icon: '🚗' },
  { category: 'healthcare', recommended: 5, label: 'Healthcare', icon: '🏥' },
  { category: 'insurance', recommended: 5, label: 'Insurance', icon: '🛡️' },
  { category: 'personal-care', recommended: 3, label: 'Personal Care', icon: '💆' },
  { category: 'clothing', recommended: 3, label: 'Clothing', icon: '👕' },
  { category: 'education', recommended: 3, label: 'Education', icon: '📚' },
  { category: 'subscriptions', recommended: 3, label: 'Subscriptions', icon: '📱' },
  { category: 'savings', recommended: 10, label: 'Savings', icon: '🏦' },
  { category: 'gifts', recommended: 2, label: 'Gifts', icon: '🎁' },
  { category: 'pets', recommended: 2, label: 'Pets', icon: '🐾' },
  { category: 'home-maintenance', recommended: 3, label: 'Home', icon: '🔧' },
  { category: 'discretionary', recommended: 5, label: 'Discretionary', icon: '✨' },
];

export const PARTNER_NAMES: Record<Partner, string> = {
  partner1: 'Partner A',
  partner2: 'Partner B',
};

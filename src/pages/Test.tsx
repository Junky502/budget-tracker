import { BudgetProvider, useBudget } from '@/context/BudgetContext';

function TestContent() {
  const { loading, totalIncome, totalExpenses } = useBudget();

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold text-foreground mb-4">Debug Test</h1>
      <p className="text-lg text-muted-foreground mb-2">Loading: {loading.toString()}</p>
      <p className="text-lg text-muted-foreground mb-2">Total Income: €{totalIncome}</p>
      <p className="text-lg text-muted-foreground mb-2">Total Expenses: €{totalExpenses}</p>
      <p className="text-sm text-muted-foreground mt-4">If you see this, the app is working!</p>
    </div>
  );
}

export default function TestPage() {
  return (
    <BudgetProvider>
      <TestContent />
    </BudgetProvider>
  );
}

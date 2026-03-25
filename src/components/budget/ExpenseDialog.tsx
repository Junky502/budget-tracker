import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { Expense, ExpenseCategory, Partner } from '@/types/budget';
import { getDefaultDateForMonth } from '@/lib/periods';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type ExpenseDialogMode = 'add' | 'edit' | 'duplicate';

interface ExpenseDialogProps {
  mode: ExpenseDialogMode;
  expense?: Expense;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function buildInitialState(currentMonth: string, expense?: Expense, mode: ExpenseDialogMode = 'add') {
  const baseDate = mode === 'duplicate' || !expense ? getDefaultDateForMonth(currentMonth) : expense.date;

  return {
    category: expense?.category || 'groceries',
    description: expense?.description || '',
    amount: expense ? String(expense.amount) : '',
    date: baseDate,
    paidBy: expense?.paidBy || 'partner1',
    shared: expense?.shared ?? true,
    recurring: expense?.recurring ?? false,
    partner1Split: expense?.splitAmounts ? String(expense.splitAmounts.partner1) : '',
    partner2Split: expense?.splitAmounts ? String(expense.splitAmounts.partner2) : '',
  };
}

export function ExpenseDialog({ mode, expense, trigger, open, onOpenChange }: ExpenseDialogProps) {
  const { partnerNames, addExpense, updateExpense, categories, incomeByPartner, totalIncome, currentMonth } = useBudget();
  const [internalOpen, setInternalOpen] = useState(false);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState(() => buildInitialState(currentMonth, expense, mode));

  const dialogOpen = open ?? internalOpen;
  const setDialogOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }
    setError('');
    setFormState(buildInitialState(currentMonth, expense, mode));
  }, [currentMonth, dialogOpen, expense, mode]);

  const totalAmount = parseFloat(formState.amount) || 0;
  const partner1SplitAmount = parseFloat(formState.partner1Split) || 0;
  const partner2SplitAmount = parseFloat(formState.partner2Split) || 0;
  const splitTotal = partner1SplitAmount + partner2SplitAmount;

  const splitUnbalanced = useMemo(() => {
    if (!formState.shared || !formState.amount) return false;
    return Math.abs(splitTotal - totalAmount) > 0.01;
  }, [formState.shared, formState.amount, splitTotal, totalAmount]);

  const isFormValid = useMemo(() => {
    if (!formState.description || !formState.amount || !formState.date) return false;
    if (formState.shared) {
      if (!formState.partner1Split || !formState.partner2Split) return false;
      if (splitUnbalanced) return false;
    }
    return true;
  }, [formState, splitUnbalanced]);

  const autoSplit = () => {
    if (!formState.amount) return;

    const total = parseFloat(formState.amount);
    if (totalIncome > 0) {
      const partner1Percentage = incomeByPartner.partner1 / totalIncome;
      const partner2Percentage = incomeByPartner.partner2 / totalIncome;
      setFormState(prev => ({
        ...prev,
        partner1Split: (total * partner1Percentage).toFixed(2),
        partner2Split: (total * partner2Percentage).toFixed(2),
      }));
      return;
    }

    const half = (total / 2).toFixed(2);
    setFormState(prev => ({
      ...prev,
      partner1Split: half,
      partner2Split: half,
    }));
  };

  const handleSubmit = () => {
    setError('');

    if (!isFormValid) {
      setError('Complete all required fields before saving');
      return;
    }

    const payload: Omit<Expense, 'id'> = {
      category: formState.category as ExpenseCategory,
      description: formState.description,
      amount: parseFloat(formState.amount),
      date: formState.date,
      recurring: formState.recurring,
      paidBy: formState.paidBy as Partner,
      shared: formState.shared,
      splitAmounts: formState.shared
        ? {
            partner1: partner1SplitAmount,
            partner2: partner2SplitAmount,
          }
        : undefined,
    };

    if (mode === 'edit' && expense) {
      updateExpense(expense.id, payload);
    } else {
      addExpense(payload);
    }

    setDialogOpen(false);
  };

  const title = mode === 'edit' ? 'Edit Expense' : mode === 'duplicate' ? 'Duplicate Expense' : 'Add Expense';
  const actionLabel = mode === 'edit' ? 'Save Changes' : mode === 'duplicate' ? 'Create Copy' : 'Add Expense';

  const content = (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category</label>
          <Select value={formState.category} onValueChange={value => setFormState(prev => ({ ...prev, category: value as ExpenseCategory }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.category} value={category.category}>{category.icon} {category.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Description</label>
          <Input value={formState.description} onChange={event => setFormState(prev => ({ ...prev, description: event.target.value }))} placeholder="What was it for?" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Amount (€)</label>
            <Input type="number" value={formState.amount} onChange={event => setFormState(prev => ({ ...prev, amount: event.target.value }))} placeholder="0.00" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Date</label>
            <Input type="date" value={formState.date} onChange={event => setFormState(prev => ({ ...prev, date: event.target.value }))} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Paid By</label>
          <Select value={formState.paidBy} onValueChange={value => setFormState(prev => ({ ...prev, paidBy: value as Partner }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="partner1">{partnerNames.partner1}</SelectItem>
              <SelectItem value="partner2">{partnerNames.partner2}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={formState.shared} onChange={event => setFormState(prev => ({ ...prev, shared: event.target.checked }))} className="h-4 w-4 rounded border-border" />
            Shared expense
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={formState.recurring} onChange={event => setFormState(prev => ({ ...prev, recurring: event.target.checked }))} className="h-4 w-4 rounded border-border" />
            Recurring expense
          </label>
        </div>

        {formState.shared && (
          <div className="space-y-3 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Split Amount</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Income ratio: {totalIncome > 0 ? `${((incomeByPartner.partner1 / totalIncome) * 100).toFixed(0)}% / ${((incomeByPartner.partner2 / totalIncome) * 100).toFixed(0)}%` : 'No income data'}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={autoSplit} disabled={!formState.amount}>
                Split by Income
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{partnerNames.partner1} pays (€)</label>
                <Input type="number" value={formState.partner1Split} onChange={event => setFormState(prev => ({ ...prev, partner1Split: event.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">{partnerNames.partner2} pays (€)</label>
                <Input type="number" value={formState.partner2Split} onChange={event => setFormState(prev => ({ ...prev, partner2Split: event.target.value }))} placeholder="0.00" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <span>Total assigned: €{splitTotal.toFixed(2)}</span>
              <span className="mx-2">•</span>
              <span>Total expense: €{totalAmount.toFixed(2)}</span>
            </div>
            {splitUnbalanced && formState.amount && (
              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">The split amounts don't match the total expense</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSubmit} className="w-full" disabled={!isFormValid}>
          {actionLabel}
        </Button>
      </div>
    </>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-md">{content}</DialogContent>
    </Dialog>
  );
}

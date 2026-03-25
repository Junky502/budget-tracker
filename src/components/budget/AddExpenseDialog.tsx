import { useState, useMemo } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { ExpenseCategory, Partner } from '@/types/budget';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertCircle } from 'lucide-react';

export function AddExpenseDialog() {
  const { partnerNames, addExpense, categories, incomeByPartner, totalIncome } = useBudget();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('groceries');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<Partner>('partner1');
  const [shared, setShared] = useState(true);
  const [recurring, setRecurring] = useState(false);
  const [partner1Split, setPartner1Split] = useState('');
  const [partner2Split, setPartner2Split] = useState('');

  const totalAmount = parseFloat(amount) || 0;
  const partner1SplitAmount = parseFloat(partner1Split) || 0;
  const partner2SplitAmount = parseFloat(partner2Split) || 0;
  const splitTotal = partner1SplitAmount + partner2SplitAmount;

  const splitUnbalanced = useMemo(() => {
    if (!shared || !amount) return false;
    return Math.abs(splitTotal - totalAmount) > 0.01;
  }, [shared, amount, splitTotal, totalAmount]);

  const isFormValid = useMemo(() => {
    if (!description || !amount) return false;
    if (shared) {
      if (!partner1Split || !partner2Split) return false;
      if (splitUnbalanced) return false;
    }
    return true;
  }, [description, amount, shared, partner1Split, partner2Split, splitUnbalanced]);

  const autoSplit = () => {
    if (!amount) return;
    
    const total = parseFloat(amount);
    
    // Split based on income ratio
    if (totalIncome > 0) {
      const partner1Percentage = incomeByPartner.partner1 / totalIncome;
      const partner2Percentage = incomeByPartner.partner2 / totalIncome;
      
      const p1Amount = (total * partner1Percentage).toFixed(2);
      const p2Amount = (total * partner2Percentage).toFixed(2);
      
      setPartner1Split(p1Amount);
      setPartner2Split(p2Amount);
    } else {
      // Fallback to 50/50 if no income data
      const half = (total / 2).toFixed(2);
      setPartner1Split(half);
      setPartner2Split(half);
    }
  };

  const handleSubmit = () => {
    if (!description || !amount) return;
    
    // Validate shared expense split amounts
    if (shared) {
      if (!partner1Split || !partner2Split) {
        alert('Please fill in split amounts for both partners');
        return;
      }
      if (splitUnbalanced) {
        alert('Split amounts must match the total expense');
        return;
      }
    }
    
    const expenseData: any = {
      category,
      description,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      recurring,
      paidBy,
      shared,
    };

    if (shared) {
      expenseData.splitAmounts = {
        partner1: partner1SplitAmount,
        partner2: partner2SplitAmount,
      };
    }

    addExpense(expenseData);
    setDescription('');
    setAmount('');
    setRecurring(false);
    setPartner1Split('');
    setPartner2Split('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category</label>
            <Select value={category} onValueChange={v => setCategory(v as ExpenseCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.category} value={c.category}>{c.icon} {c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What was it for?" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Amount (€)</label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Paid By</label>
            <Select value={paidBy} onValueChange={v => setPaidBy(v as Partner)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="partner1">{partnerNames.partner1}</SelectItem>
                <SelectItem value="partner2">{partnerNames.partner2}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={shared} onChange={e => setShared(e.target.checked)} className="h-4 w-4 rounded border-border" id="shared" />
            <label htmlFor="shared" className="text-sm text-foreground">Shared expense</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="h-4 w-4 rounded border-border" id="recurring-expense" />
            <label htmlFor="recurring-expense" className="text-sm text-foreground">Recurring expense</label>
          </div>

          {shared && (
            <div className="space-y-3 rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Split Amount</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Income ratio: {totalIncome > 0 ? `${((incomeByPartner.partner1 / totalIncome) * 100).toFixed(0)}% / ${((incomeByPartner.partner2 / totalIncome) * 100).toFixed(0)}%` : 'No income data'}
                  </p>
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={autoSplit}
                  disabled={!amount}
                >
                  Split by Income
                </Button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {partnerNames.partner1} pays (€)
                  </label>
                  <Input 
                    type="number" 
                    value={partner1Split} 
                    onChange={e => setPartner1Split(e.target.value)} 
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {partnerNames.partner2} pays (€)
                  </label>
                  <Input 
                    type="number" 
                    value={partner2Split} 
                    onChange={e => setPartner2Split(e.target.value)} 
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <span>Total assigned: €{splitTotal.toFixed(2)}</span>
                <span className="mx-2">•</span>
                <span>Total expense: €{totalAmount.toFixed(2)}</span>
              </div>

              {splitUnbalanced && amount && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    The split amounts don't match the total expense
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Button onClick={handleSubmit} className="w-full" disabled={!isFormValid}>Add Expense</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

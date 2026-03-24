import { useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { CATEGORY_CONFIG, ExpenseCategory, Partner } from '@/types/budget';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

export function AddExpenseDialog() {
  const { addExpense, partnerNames } = useBudget();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('groceries');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<Partner>('partner1');
  const [shared, setShared] = useState(true);

  const handleSubmit = () => {
    if (!description || !amount) return;
    addExpense({
      category,
      description,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      paidBy,
      shared,
    });
    setDescription('');
    setAmount('');
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
                {CATEGORY_CONFIG.map(c => (
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
          <Button onClick={handleSubmit} className="w-full">Add Expense</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

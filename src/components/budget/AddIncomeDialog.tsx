import { useState } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { Partner } from '@/types/budget';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

export function AddIncomeDialog() {
  const { addIncome, partnerNames } = useBudget();
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [partner, setPartner] = useState<Partner>('partner1');
  const [recurring, setRecurring] = useState(true);

  const handleSubmit = () => {
    if (!source || !amount) return;
    addIncome({
      partner,
      source,
      amount: parseFloat(amount),
      recurring,
    });
    setSource('');
    setAmount('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" /> Add Income
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Source</label>
            <Input value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. Salary, Freelance" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Amount (€)</label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Partner</label>
            <Select value={partner} onValueChange={v => setPartner(v as Partner)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="partner1">{partnerNames.partner1}</SelectItem>
                <SelectItem value="partner2">{partnerNames.partner2}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="h-4 w-4 rounded border-border" id="recurring" />
            <label htmlFor="recurring" className="text-sm text-foreground">Recurring income</label>
          </div>
          <Button onClick={handleSubmit} className="w-full">Add Income</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

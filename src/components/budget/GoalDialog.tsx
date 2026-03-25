import { useEffect, useState, type ReactNode } from 'react';
import { useBudget } from '@/context/BudgetContext';
import { BudgetGoal, ExpenseCategory, GoalTargetType } from '@/types/budget';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GoalDialogProps {
  goal?: BudgetGoal;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function getInitialState(currentMonth: string, goal?: BudgetGoal) {
  return {
    category: goal?.category || 'groceries',
    targetType: goal?.targetType || 'fixed',
    value: goal ? String(goal.value) : '',
    startMonth: goal?.startMonth || currentMonth,
  };
}

export function GoalDialog({ goal, trigger, open, onOpenChange }: GoalDialogProps) {
  const { categories, currentMonth, addGoal, updateGoal } = useBudget();
  const [internalOpen, setInternalOpen] = useState(false);
  const [formState, setFormState] = useState(() => getInitialState(currentMonth, goal));

  const dialogOpen = open ?? internalOpen;
  const setDialogOpen = onOpenChange ?? setInternalOpen;
  const isEditMode = Boolean(goal);

  useEffect(() => {
    if (!dialogOpen) {
      return;
    }
    setFormState(getInitialState(currentMonth, goal));
  }, [currentMonth, dialogOpen, goal]);

  const handleSubmit = () => {
    const value = parseFloat(formState.value);
    if (!value || value <= 0) {
      return;
    }

    const payload = {
      category: formState.category as ExpenseCategory,
      targetType: formState.targetType as GoalTargetType,
      value,
      startMonth: formState.startMonth,
    };

    if (goal) {
      updateGoal(goal.id, payload);
    } else {
      addGoal(payload);
    }

    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Goal Type</label>
              <Select value={formState.targetType} onValueChange={value => setFormState(prev => ({ ...prev, targetType: value as GoalTargetType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed amount</SelectItem>
                  <SelectItem value="percentage">Percent of income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Value</label>
              <Input type="number" value={formState.value} onChange={event => setFormState(prev => ({ ...prev, value: event.target.value }))} placeholder={formState.targetType === 'fixed' ? '250' : '10'} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Starts</label>
            <Input type="month" value={formState.startMonth} onChange={event => setFormState(prev => ({ ...prev, startMonth: event.target.value }))} />
          </div>
          <Button onClick={handleSubmit} className="w-full">{isEditMode ? 'Save Goal' : 'Add Goal'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

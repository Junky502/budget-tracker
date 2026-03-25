import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenseDialog } from '@/components/budget/ExpenseDialog';

export function AddExpenseDialog() {
  return (
    <ExpenseDialog
      mode="add"
      trigger={
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      }
    />
  );
}

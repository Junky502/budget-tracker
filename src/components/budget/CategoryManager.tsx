import { useBudget } from '@/context/BudgetContext';
import { StoredCategory } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';

export function CategoryManager() {
  const { categories, addCategory, removeCategory, updateCategory } = useBudget();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StoredCategory | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    label: '',
    icon: '',
    recommended: 0,
  });

  const resetForm = () => {
    setFormData({ category: '', label: '', icon: '', recommended: 0 });
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      await updateCategory(editingCategory.id, formData);
    } else {
      await addCategory(formData);
    }
    resetForm();
    setIsOpen(false);
  };

  const handleEdit = (category: StoredCategory) => {
    setEditingCategory(category);
    setFormData({
      category: category.category,
      label: category.label,
      icon: category.icon,
      recommended: category.recommended,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? This will not delete existing expenses.')) {
      await removeCategory(id);
    }
  };

  return (
    <div className="rounded-lg bg-card p-6 shadow-warm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Manage Categories</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category Key</label>
                <Input
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., travel"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Display Name</label>
                <Input
                  value={formData.label}
                  onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Travel"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Icon (Emoji)</label>
                <Input
                  value={formData.icon}
                  onChange={e => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="e.g., ✈️"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recommended % of Income</label>
                <Input
                  type="number"
                  value={formData.recommended}
                  onChange={e => setFormData(prev => ({ ...prev, recommended: Number(e.target.value) }))}
                  placeholder="5"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingCategory ? 'Update Category' : 'Add Category'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {categories.map(category => (
          <div key={category.id} className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-2">
              <span>{category.icon}</span>
              <span className="text-sm font-medium">{category.label}</span>
              <span className="text-xs text-muted-foreground">({category.recommended}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
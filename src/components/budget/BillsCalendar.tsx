import { useMemo, useState } from 'react';
import { endOfMonth, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { useBudget } from '@/context/BudgetContext';
import { formatMonthLabel, parseMonthKey } from '@/lib/periods';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function BillsCalendar() {
  const { expenses, currentMonth, categories, partnerNames } = useBudget();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { days, eventsByDay, upcomingEvents } = useMemo(() => {
    const { year, monthIndex } = parseMonthKey(currentMonth);
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(startOfMonth(monthStart), { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const applicableExpenses = expenses.filter(expense => {
      const expenseMonth = expense.date.slice(0, 7);
      if (expense.recurring) {
        return expenseMonth <= currentMonth;
      }
      return expenseMonth === currentMonth;
    });

    const eventsByDay = new Map<number, Array<{ id: string; label: string; amount: number; recurring: boolean; icon: string; description: string; paidBy: string; shared: boolean; category: string }>>();

    applicableExpenses.forEach(expense => {
      const dayNumber = Number(expense.date.slice(8, 10));
      const category = categories.find(item => item.category === expense.category);
      const items = eventsByDay.get(dayNumber) || [];
      items.push({
        id: expense.id,
        label: expense.description,
        amount: expense.amount,
        recurring: expense.recurring,
        icon: category?.icon || '•',
        description: expense.description,
        paidBy: expense.paidBy === 'partner1' ? partnerNames.partner1 : partnerNames.partner2,
        shared: expense.shared,
        category: category?.label || 'Other',
      });
      eventsByDay.set(dayNumber, items.sort((left, right) => left.amount - right.amount));
    });

    const currentDay = isSameMonth(monthStart, new Date()) ? new Date().getDate() : 1;
    const upcomingEvents = Array.from(eventsByDay.entries())
      .flatMap(([day, entries]) => entries.map(entry => ({ day, ...entry })))
      .filter(entry => entry.day >= currentDay)
      .sort((left, right) => left.day - right.day || left.amount - right.amount)
      .slice(0, 8);

    return { days, eventsByDay, upcomingEvents };
  }, [categories, currentMonth, expenses, partnerNames]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
      <div className="rounded-lg bg-card p-6 shadow-warm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Bills Calendar</h2>
            <p className="text-sm text-muted-foreground">Recurring expenses repeat on their due day each month.</p>
          </div>
          <span className="text-sm font-medium text-muted-foreground">{formatMonthLabel(currentMonth)}</span>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {weekdayLabels.map(label => (
            <div key={label}>{label}</div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {days.map(day => {
            const inMonth = isSameMonth(day, new Date(parseMonthKey(currentMonth).year, parseMonthKey(currentMonth).monthIndex, 1));
            const dayEvents = inMonth ? eventsByDay.get(day.getDate()) || [] : [];
            return (
              <button
                key={day.toISOString()}
                onClick={() => inMonth && dayEvents.length > 0 && setSelectedDay(day.getDate())}
                disabled={!inMonth || dayEvents.length === 0}
                className={`min-h-[92px] rounded-lg border p-2 text-left transition-all ${inMonth && dayEvents.length > 0 ? 'cursor-pointer hover:border-primary hover:bg-primary/5' : ''} ${inMonth ? 'border-border bg-background' : 'border-transparent bg-muted/40 text-muted-foreground'}`}
              >
                <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs ${isToday(day) && inMonth ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`truncate rounded px-1.5 py-1 text-[10px] font-medium ${event.recurring ? 'bg-primary/10 text-primary' : 'bg-surface-alt text-foreground'}`}
                      title={`${event.label} - €${event.amount.toFixed(2)}`}
                    >
                      {event.icon} {event.label}
                    </div>
                  ))}
                  {dayEvents.length > 3 ? <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</div> : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg bg-card p-6 shadow-warm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Upcoming This Month</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming expenses scheduled for the selected month.</p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={`${event.id}-${event.day}`} className="rounded-md border border-border bg-surface-alt p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{event.icon} {event.label}</p>
                    <p className="text-xs text-muted-foreground">Due on {format(new Date(`${currentMonth}-${String(event.day).padStart(2, '0')}`), 'MMM d')} {event.recurring ? '· Recurring' : ''}</p>
                  </div>
                  <span className="font-mono-data text-sm font-semibold text-foreground">€{event.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDay ? format(new Date(`${currentMonth}-${String(selectedDay).padStart(2, '0')}`), 'MMMM d, yyyy') : 'Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedDay && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {(eventsByDay.get(selectedDay) || []).map(event => (
                <div key={event.id} className="rounded-md border border-border bg-surface-alt p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{event.icon}</span>
                        <p className="font-semibold text-foreground">{event.label}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{event.category}</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Paid by: <span className="text-foreground font-medium">{event.paidBy}</span></p>
                        {event.shared && <p className="text-primary">Shared expense</p>}
                        {event.recurring && <p className="text-primary">Recurring</p>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono-data font-semibold text-foreground text-lg">€{event.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!eventsByDay.get(selectedDay) || eventsByDay.get(selectedDay)!.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No expenses on this day</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

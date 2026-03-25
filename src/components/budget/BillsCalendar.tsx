import { useMemo } from 'react';
import { endOfMonth, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { useBudget } from '@/context/BudgetContext';
import { formatMonthLabel, parseMonthKey } from '@/lib/periods';

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function BillsCalendar() {
  const { expenses, currentMonth, categories } = useBudget();

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

    const eventsByDay = new Map<number, Array<{ id: string; label: string; amount: number; recurring: boolean; icon: string }>>();

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
  }, [categories, currentMonth, expenses]);

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
              <div
                key={day.toISOString()}
                className={`min-h-[92px] rounded-lg border p-2 text-left ${inMonth ? 'border-border bg-background' : 'border-transparent bg-muted/40 text-muted-foreground'}`}
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
              </div>
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
    </div>
  );
}

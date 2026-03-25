import { useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface CodeLockKeypadProps {
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  shakeTrigger?: number;
}

export function CodeLockKeypad({ value, maxLength, onChange, onSubmit, shakeTrigger = 0 }: CodeLockKeypadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const shakeControls = useAnimationControls();

  const focusInput = useCallback(() => {
    if (!isMobile) {
      inputRef.current?.focus();
    }
  }, [isMobile]);

  const appendDigit = useCallback((digit: string) => {
    if (value.length >= maxLength) {
      return;
    }

    const next = `${value}${digit}`;
    onChange(next);

    if (next.length === maxLength) {
      onSubmit(next);
    }
  }, [maxLength, onChange, onSubmit, value]);

  const clearLastDigit = useCallback(() => {
    if (!value.length) {
      return;
    }
    onChange(value.slice(0, -1));
  }, [onChange, value]);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  useEffect(() => {
    if (!shakeTrigger) {
      return;
    }

    void shakeControls.start({
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.36, ease: 'easeInOut' },
    });
  }, [shakeControls, shakeTrigger]);

  useEffect(() => {
    const onWindowKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.key >= '0' && event.key <= '9') {
        event.preventDefault();
        appendDigit(event.key);
        return;
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        clearLastDigit();
        return;
      }

      if (event.key === 'Enter' && value.length === maxLength) {
        event.preventDefault();
        onSubmit(value);
      }
    };

    window.addEventListener('keydown', onWindowKeyDown);
    return () => window.removeEventListener('keydown', onWindowKeyDown);
  }, [appendDigit, clearLastDigit, maxLength, onSubmit, value]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value.replace(/\D/g, '').slice(0, maxLength);
    onChange(next);

    if (next.length === maxLength) {
      onSubmit(next);
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0'];

  return (
    <motion.div
      className="space-y-4"
      onClick={focusInput}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
    >
      <label htmlFor="pin-codelock" className="sr-only">PIN</label>
      <input
        id="pin-codelock"
        ref={inputRef}
        type="password"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus={!isMobile}
        value={value}
        onChange={handleInputChange}
        className="absolute h-0 w-0 opacity-0 pointer-events-none"
        aria-hidden="true"
        tabIndex={-1}
      />

      <motion.div className="grid grid-cols-4 gap-2" animate={shakeControls}>
        {Array.from({ length: maxLength }).map((_, index) => {
          const filled = index < value.length;
          const active = index === value.length && value.length < maxLength;
          return (
            <motion.div
              key={index}
              className={`flex h-12 items-center justify-center rounded-md border text-xl transition-colors ${
                filled
                  ? 'border-blue-300 bg-white shadow-sm'
                  : active
                    ? 'border-blue-200 bg-blue-50/60'
                    : 'border-slate-300 bg-slate-50'
              }`}
              aria-hidden="true"
              animate={{ scale: filled ? 1.03 : 1 }}
              transition={{ duration: 0.18 }}
            >
              <AnimatePresence mode="wait">
                {filled ? (
                  <motion.span
                    key="filled"
                    className="leading-none text-slate-800"
                    initial={{ opacity: 0, scale: 0.2, y: 3 }}
                    animate={{ opacity: 1, scale: [0.3, 1.35, 0.9, 1], y: [3, -2, 1, 0] }}
                    exit={{ opacity: 0, scale: 0.45 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                  >
                    •
                  </motion.span>
                ) : (
                  <motion.span
                    key="empty"
                    className="leading-none text-slate-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-3 gap-2">
        {keys.map((key) => (
          <motion.div key={key} whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
            <Button
              type="button"
              variant="outline"
              className="h-14 w-full text-xl font-semibold transition-all duration-150 hover:bg-slate-100 active:shadow-inner"
              onClick={() => {
                if (key === 'C') {
                  clearLastDigit();
                  return;
                }
                appendDigit(key);
              }}
              aria-label={key === 'C' ? 'Clear last digit' : `Digit ${key}`}
            >
              {key}
            </Button>
          </motion.div>
        ))}
        <div aria-hidden="true" />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={value.length !== maxLength}>
        Login
      </Button>
    </motion.div>
  );
}

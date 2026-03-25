import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CodeLockKeypad } from '@/components/CodeLockKeypad';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const PIN_LENGTH = 4;
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const handlePinChange = (nextPin: string) => {
    if (error) {
      setError('');
    }
    setPin(nextPin.replace(/\D/g, '').slice(0, PIN_LENGTH));
  };

  const handleSubmit = (submittedPin: string) => {
    setError('');

    if (submittedPin.length !== PIN_LENGTH) {
      setError(`Enter ${PIN_LENGTH} digits`);
      return;
    }

    const success = login(submittedPin);
    if (!success) {
      setError('Incorrect PIN');
      setPin('');
      setShakeTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Tracker</h1>
            <p className="text-gray-600 text-sm mt-2">Enter PIN to access</p>
            <p className="text-gray-500 text-xs mt-1">This device stays trusted for 30 minutes after login</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(pin);
            }}
            className="space-y-4"
          >
            <CodeLockKeypad
              value={pin}
              maxLength={PIN_LENGTH}
              onChange={handlePinChange}
              onSubmit={handleSubmit}
              shakeTrigger={shakeTrigger}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Logging out clears trusted access immediately
          </p>
        </div>
      </div>
    </div>
  );
}

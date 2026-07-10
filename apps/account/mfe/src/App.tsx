import { useState } from 'react';
import { RegistrationForm } from './components/RegistrationForm';
import { LoginForm } from './components/LoginForm';
import { BalanceDashboard } from './components/BalanceDashboard';

type View = 'register' | 'login' | 'dashboard';

export function App() {
  const [view, setView] = useState<View>('register');
  const [accountNumber, setAccountNumber] = useState<string | null>(null);

  const handleAccountCreated = (newAccountNumber: string) => {
    setAccountNumber(newAccountNumber);
    setView('dashboard');
  };

  const handleLogin = (acctNum: string, _token: string) => {
    setAccountNumber(acctNum);
    setView('dashboard');
  };

  return (
    <div>
      <h1>Null Bank - Account</h1>
      <nav>
        <button onClick={() => setView('register')}>Register</button>
        <button onClick={() => setView('login')}>Login</button>
      </nav>

      {view === 'register' && <RegistrationForm onAccountCreated={handleAccountCreated} />}
      {view === 'login' && <LoginForm onLogin={handleLogin} />}
      {view === 'dashboard' && accountNumber && <BalanceDashboard accountNumber={accountNumber} />}
    </div>
  );
}

import { useState } from 'react';
import { RegistrationForm } from './components/RegistrationForm';
import { CustomerSearch } from './components/CustomerSearch';
import { CustomerDetails } from './components/CustomerDetails';

type View = 'register' | 'search' | 'details';

export function App() {
  const [view, setView] = useState<View>('register');
  const [selectedCpfCnpj, setSelectedCpfCnpj] = useState<string | null>(null);

  const handleCustomerCreated = () => {
    setView('search');
  };

  const handleCustomerSelected = (cpfCnpj: string) => {
    setSelectedCpfCnpj(cpfCnpj);
    setView('details');
  };

  return (
    <div>
      <h1>Null Bank - Customer</h1>
      <nav>
        <button onClick={() => setView('register')}>Register</button>
        <button onClick={() => setView('search')}>Search</button>
      </nav>

      {view === 'register' && <RegistrationForm onCustomerCreated={handleCustomerCreated} />}
      {view === 'search' && <CustomerSearch onCustomerSelected={handleCustomerSelected} />}
      {view === 'details' && selectedCpfCnpj && (
        <CustomerDetails cpfCnpj={selectedCpfCnpj} onBack={() => setView('search')} />
      )}
    </div>
  );
}

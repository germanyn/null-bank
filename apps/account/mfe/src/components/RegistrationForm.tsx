import { useState, FormEvent } from 'react';
import { apiPost } from '../api';

interface Props {
  onAccountCreated: (accountNumber: string) => void;
}

export function RegistrationForm({ onAccountCreated }: Props) {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [password, setPassword] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await apiPost<{ accountNumber: string }>('/accounts', {
      cpfCnpj,
      password,
      initialBalance: initialBalance ? Number(initialBalance) : undefined,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setCreated(true);
    onAccountCreated(result.data.accountNumber);
  };

  if (created) {
    return <p>Account created successfully!</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Account</h2>
      {error && <p role="alert">{error}</p>}
      <div>
        <label htmlFor="cpfCnpj">CPF/CNPJ</label>
        <input id="cpfCnpj" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="initialBalance">Initial Balance</label>
        <input id="initialBalance" type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} />
      </div>
      <button type="submit">Create Account</button>
    </form>
  );
}

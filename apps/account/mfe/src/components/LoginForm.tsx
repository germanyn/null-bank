import { useState, FormEvent } from 'react';
import { apiPost } from '../api';

interface Props {
  onLogin: (accountNumber: string, token: string) => void;
}

export function LoginForm({ onLogin }: Props) {
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await apiPost<{ accountNumber: string; token: string }>('/login', {
      accountNumber,
      password,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onLogin(result.data.accountNumber, result.data.token);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p role="alert">{error}</p>}
      <div>
        <label htmlFor="loginAccountNumber">Account Number</label>
        <input id="loginAccountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="loginPassword">Password</label>
        <input id="loginPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

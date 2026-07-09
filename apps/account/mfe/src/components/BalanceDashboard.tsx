import { useState, useEffect } from 'react';
import { apiGet } from '../api';

interface Props {
  accountNumber: string;
}

export function BalanceDashboard({ accountNumber }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      const result = await apiGet<{ accountNumber: string; balance: number }>(
        `/accounts/${accountNumber}/balance`
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setBalance(result.data.balance);
    };

    fetchBalance();
  }, [accountNumber]);

  return (
    <div>
      <h2>Balance Dashboard</h2>
      <p>Account: {accountNumber}</p>
      {error && <p role="alert">{error}</p>}
      {balance !== null && !error && (
        <p>Balance: <strong data-testid="balance-value">{`$${balance.toLocaleString()}`}</strong></p>
      )}
    </div>
  );
}

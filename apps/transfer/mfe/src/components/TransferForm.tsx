import { useState, FormEvent } from 'react';
import { apiPost, TRANSFER_BASE } from '../api';

interface TransferFormProps {
  sourceAccountNumber: string;
  onTransferCreated: (transferId: string) => void;
}

export function TransferForm({ sourceAccountNumber, onTransferCreated }: TransferFormProps) {
  const [destinationAccountNumber, setDestinationAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await apiPost<{ transferId: string }>(TRANSFER_BASE, '/transfers', {
      sourceAccountNumber,
      destinationAccountNumber,
      amount: parseFloat(amount),
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess('Transfer initiated!');
    onTransferCreated(result.data.transferId);
    setDestinationAccountNumber('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Send Transfer</h2>
      <div>
        <label htmlFor="destination">Destination Account</label>
        <input
          id="destination"
          type="text"
          value={destinationAccountNumber}
          onChange={(e) => setDestinationAccountNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      {error && <div role="alert">{error}</div>}
      {success && <div>{success}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Transfer'}
      </button>
    </form>
  );
}

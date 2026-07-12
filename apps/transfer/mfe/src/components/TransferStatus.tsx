import { useState, useEffect } from 'react';
import { apiGet, TRANSFER_BASE } from '../api';

interface TransferStatusProps {
  transferId: string;
}

interface TransferData {
  transferId: string;
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  status: string;
  createdAt: string;
}

export function TransferStatus({ transferId }: TransferStatusProps) {
  const [transfer, setTransfer] = useState<TransferData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      const result = await apiGet<TransferData>(TRANSFER_BASE, `/transfers/${transferId}`);
      if (!cancelled) {
        if (result.ok) {
          setTransfer(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
      }
    };

    fetchStatus();

    const interval = setInterval(fetchStatus, 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [transferId]);

  if (error) {
    return <div role="alert">{error}</div>;
  }

  if (!transfer) {
    return <div>Loading transfer status...</div>;
  }

  const statusColors: Record<string, string> = {
    pending: '#f0ad4e',
    reserved: '#5bc0de',
    completed: '#5cb85c',
    failed: '#d9534f',
  };

  return (
    <div>
      <h2>Transfer Status</h2>
      <p><strong>Transfer ID:</strong> {transfer.transferId}</p>
      <p><strong>From:</strong> {transfer.sourceAccountNumber}</p>
      <p><strong>To:</strong> {transfer.destinationAccountNumber}</p>
      <p><strong>Amount:</strong> ${transfer.amount.toFixed(2)}</p>
      <p>
        <strong>Status:</strong>{' '}
        <span style={{ color: statusColors[transfer.status] || '#333' }}>
          {transfer.status.toUpperCase()}
        </span>
      </p>
      <p><strong>Created:</strong> {new Date(transfer.createdAt).toLocaleString()}</p>
    </div>
  );
}

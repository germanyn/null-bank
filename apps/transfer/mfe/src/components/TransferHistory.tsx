import { useState, useEffect } from 'react';
import { apiGet, TRANSFER_BASE } from '../api';

interface TransferHistoryProps {
  accountNumber: string;
}

interface TransferRecord {
  transferId: string;
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  status: string;
  createdAt: string;
}

export function TransferHistory({ accountNumber }: TransferHistoryProps) {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      const result = await apiGet<TransferRecord[]>(
        TRANSFER_BASE,
        `/accounts/${accountNumber}/transfers`,
      );
      if (!cancelled) {
        if (result.ok) {
          setTransfers(result.data);
          setError(null);
        } else {
          setError(result.error);
        }
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [accountNumber]);

  if (loading) {
    return <div>Loading transfer history...</div>;
  }

  if (error) {
    return <div role="alert">{error}</div>;
  }

  if (transfers.length === 0) {
    return <div>No transfers found.</div>;
  }

  const statusColors: Record<string, string> = {
    pending: '#f0ad4e',
    reserved: '#5bc0de',
    completed: '#5cb85c',
    failed: '#d9534f',
  };

  return (
    <div>
      <h2>Transfer History</h2>
      <table>
        <thead>
          <tr>
            <th>Transfer ID</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr key={t.transferId}>
              <td>{t.transferId.substring(0, 8)}...</td>
              <td>{t.sourceAccountNumber}</td>
              <td>{t.destinationAccountNumber}</td>
              <td>${t.amount.toFixed(2)}</td>
              <td style={{ color: statusColors[t.status] || '#333' }}>
                {t.status.toUpperCase()}
              </td>
              <td>{new Date(t.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

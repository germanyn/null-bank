import { useState } from 'react';
import { TransferForm } from './components/TransferForm';
import { TransferStatus } from './components/TransferStatus';
import { TransferHistory } from './components/TransferHistory';

type View = 'transfer' | 'status' | 'history';

interface AppProps {
  accountNumber: string;
}

export function App({ accountNumber }: AppProps) {
  const [view, setView] = useState<View>('transfer');
  const [activeTransferId, setActiveTransferId] = useState<string | null>(null);

  const handleTransferCreated = (transferId: string) => {
    setActiveTransferId(transferId);
    setView('status');
  };

  return (
    <div>
      <h1>Null Bank - Transfer</h1>
      <p>Account: {accountNumber}</p>
      <nav>
        <button onClick={() => setView('transfer')}>New Transfer</button>
        <button onClick={() => setView('history')}>Transfer History</button>
      </nav>

      {view === 'transfer' && (
        <TransferForm
          sourceAccountNumber={accountNumber}
          onTransferCreated={handleTransferCreated}
        />
      )}
      {view === 'status' && activeTransferId && (
        <TransferStatus transferId={activeTransferId} />
      )}
      {view === 'history' && (
        <TransferHistory accountNumber={accountNumber} />
      )}
    </div>
  );
}

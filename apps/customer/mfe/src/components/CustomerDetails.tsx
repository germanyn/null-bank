import { useState, useEffect } from 'react';
import { apiGet } from '../api';

interface Customer {
  id: number;
  cpfCnpj: string;
  name: string;
  address: string;
  type: string;
}

interface Props {
  cpfCnpj: string;
  onBack: () => void;
}

export function CustomerDetails({ cpfCnpj, onBack }: Props) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      const result = await apiGet<Customer>(`/customers/${cpfCnpj}`);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setCustomer(result.data);
    };

    fetchCustomer();
  }, [cpfCnpj]);

  return (
    <div>
      <h2>Customer Details</h2>
      <button onClick={onBack}>Back to Search</button>
      {error && <p role="alert">{error}</p>}
      {customer && (
        <div>
          <p>CPF/CNPJ: <strong>{customer.cpfCnpj}</strong></p>
          <p>Name: <strong>{customer.name}</strong></p>
          <p>Address: <strong>{customer.address}</strong></p>
          <p>Type: <strong>{customer.type}</strong></p>
        </div>
      )}
    </div>
  );
}

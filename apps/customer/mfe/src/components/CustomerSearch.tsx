import { useState, FormEvent } from 'react';
import { apiGet } from '../api';

interface Customer {
  id: number;
  cpfCnpj: string;
  name: string;
  address: string;
  type: string;
}

interface Props {
  onCustomerSelected: (cpfCnpj: string) => void;
}

export function CustomerSearch({ onCustomerSelected }: Props) {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const path = search ? `/customers?search=${encodeURIComponent(search)}` : '/customers';
    const result = await apiGet<{ customers: Customer[] }>(path);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setCustomers(result.data.customers);
    setSearched(true);
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <h2>Search Customers</h2>
        {error && <p role="alert">{error}</p>}
        <div>
          <label htmlFor="search">Search by name or CPF/CNPJ</label>
          <input id="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button type="submit">Search</button>
      </form>

      {searched && (
        <div>
          <h3>Results</h3>
          {customers.length === 0 ? (
            <p>No customers found</p>
          ) : (
            <ul>
              {customers.map((c) => (
                <li key={c.id}>
                  <button onClick={() => onCustomerSelected(c.cpfCnpj)}>
                    {c.name} ({c.cpfCnpj})
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

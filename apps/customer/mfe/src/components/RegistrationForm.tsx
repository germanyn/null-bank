import { useState, FormEvent } from 'react';
import { apiPost } from '../api';

interface Props {
  onCustomerCreated: () => void;
}

export function RegistrationForm({ onCustomerCreated }: Props) {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<'INDIVIDUAL' | 'LEGAL_ENTITY'>('INDIVIDUAL');
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await apiPost('/customers', { cpfCnpj, name, address, type });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setCreated(true);
    onCustomerCreated();
  };

  if (created) {
    return <p>Customer registered successfully!</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register Customer</h2>
      {error && <p role="alert">{error}</p>}
      <div>
        <label htmlFor="cpfCnpj">CPF/CNPJ</label>
        <input id="cpfCnpj" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="address">Address</label>
        <input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="type">Type</label>
        <select id="type" value={type} onChange={(e) => setType(e.target.value as 'INDIVIDUAL' | 'LEGAL_ENTITY')}>
          <option value="INDIVIDUAL">Individual</option>
          <option value="LEGAL_ENTITY">Legal Entity</option>
        </select>
      </div>
      <button type="submit">Register Customer</button>
    </form>
  );
}

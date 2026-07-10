export interface CreateAccountRequest {
  cpfCnpj: string;
  password: string;
  initialBalance?: number;
}

export interface AccountResponse {
  accountNumber: string;
  cpfCnpj: string;
  balance: number;
  createdAt: string;
}

export interface LoginRequest {
  accountNumber: string;
  password: string;
}

export interface LoginResponse {
  accountNumber: string;
  token: string;
}

export interface BalanceResponse {
  accountNumber: string;
  balance: number;
}

# Null Bank

A web bank application enabling internal money transfers.

## Language

**Account**:
An authenticated identity at the bank, identified by a unique account number. Holds funds, has a balance, and is the subject of authentication (JWT). Each Account has exactly one owner, identified by a Tax ID and a name.
_Avoid_: User, client, customer, wallet, pocket

**Balance**:
The total amount of funds in an Account at a given point in time. Updated when a Transfer completes.
_Avoid_: Available balance, funds

**Transfer**:
A movement of funds between two Accounts within the same bank. Passes through **Pending**, then either **Completed** or **Failed**.
_Avoid_: Wire transfer, external payment, remittance, PIX, ACH

**Tax ID**:
A government-issued identifier for an Account owner. Format varies by country (e.g., CPF and CNPJ in Brazil). Stored on the Account as `cpfCnpj`.
_AVOID_: CPF, CNPJ, taxpayer ID

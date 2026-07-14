# Null Bank

A web bank application enabling internal money transfers.

## Language

**Transfer**:
A movement of funds between two accounts within the same bank. Passes through **Pending**, then either **Completed** or **Failed**.
_Avoid_: Wire transfer, external payment, remittance, PIX, ACH

**Account**:
A container of funds owned by exactly one customer, identified by a unique account number. Each Customer may hold at most one Account.
_Avoid_: Wallet, pocket

**Balance**:
The total amount of funds in an Account at a given point in time. Updated when a Transfer completes.
_Avoid_: Available balance, funds

**Customer**:
A person or organization that holds accounts at the bank.
_Avoid_: User, client

**Tax ID**:
A government-issued identifier for a Customer. Determines whether the Customer is a natural person or a legal entity. Format varies by country (e.g., CPF and CNPJ in Brazil).
_Avoid_: CPF, CNPJ, taxpayer ID



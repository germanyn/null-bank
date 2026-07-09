# Null Bank

A web bank application enabling internal money transfers.

## Language

**Transfer**:
A movement of funds between two accounts within the same bank. Passes through **Pending**, then either **Completed** or **Failed**.
_Avoid_: Wire transfer, external payment, remittance, PIX, ACH

**Reservation**:
An earmark of funds in the source account during a two-phase settlement. Reserved funds are unavailable for other transfers until settled or released.

**Account**:
A container of funds owned by a single customer, identified by an account number.

**Account Holder**:
The customer who owns an account. Can be either a natural person (CPF) or a legal entity (CNPJ).

**Customer**:
A person or organization that holds accounts at the bank.
_Avoid_: User, client

**CPF**:
Brazilian individual taxpayer ID — identifies natural persons.

**CNPJ**:
Brazilian corporate taxpayer ID — identifies legal entities.

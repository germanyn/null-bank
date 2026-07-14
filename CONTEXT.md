# Null Bank

A web bank application enabling internal money transfers.

## Language

**Transfer**:
A movement of funds between two accounts within the same bank. Passes through **Pending**, then either **Completed** or **Failed**.
_Avoid_: Wire transfer, external payment, remittance, PIX, ACH

**Reservation**:
An earmark of funds in the source account during a two-phase settlement. Reserved funds are unavailable for other transfers until settled or released.

**Account**:
A container of funds owned by exactly one customer, identified by a unique account number. Each customer (by CPF/CNPJ) may hold at most one account.
_Avoid_: Wallet, balance sheet Each Customer may hold at most one Account.
_Avoid_: Wallet, balance, pocket

**Account Holder**:
The customer who owns an account. Can be either a natural person (CPF) or a legal entity (CNPJ).

**Customer**:
A person or organization that holds accounts at the bank.
_Avoid_: User, client

**CPF**:
Brazilian individual taxpayer ID — identifies natural persons.

**CNPJ**:
Brazilian corporate taxpayer ID — identifies legal entities.

**Shell**:
The host application that composes all microfrontends into a single navigable UI. Owns all routing, provides the shared layout (sidebar navigation + top bar), and lazy-loads each microfrontend at runtime via Module Federation. A thin orchestration layer — any domain logic belongs in the MFEs.

**Microfrontend (MFE)**:
A self-contained frontend module that encapsulates a single domain's UI (e.g., accounts, customers, transfers). Each MFE is loaded at runtime by the shell via Module Federation and exposes a single React component representing its full internal UI. MFEs continue to work as standalone SPAs during development.

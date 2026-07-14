export const loaderMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  '/accounts': () => import('account-mfe/AccountApp'),
  '/customers': () => import('customer-mfe/CustomerApp'),
  '/transfers': () => import('transfer-mfe/TransferApp'),
};

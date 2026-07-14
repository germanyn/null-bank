export const loaderMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  '/accounts': () => import('account-mfe/AccountApp').then(m => ({ default: m.App })),
  '/customers': () => import('customer-mfe/CustomerApp').then(m => ({ default: m.App })),
  '/transfers': () => import('transfer-mfe/TransferApp').then(m => ({ default: m.App })),
};

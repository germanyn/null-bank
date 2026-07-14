export const accountLoader = () => import('account-mfe/AccountApp');
export const customerLoader = () => import('customer-mfe/CustomerApp');
export const transferLoader = () => import('transfer-mfe/TransferApp');

export const loaderMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  '/accounts': accountLoader,
  '/customers': customerLoader,
  '/transfers': transferLoader,
};

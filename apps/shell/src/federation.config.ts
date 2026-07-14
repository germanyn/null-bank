export const federationConfig = {
  name: 'shell',
  remotes: {
    'account-mfe': 'http://localhost:4300/assets/remoteEntry.js',
    'customer-mfe': 'http://localhost:4400/assets/remoteEntry.js',
    'transfer-mfe': 'http://localhost:4500/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom'],
};

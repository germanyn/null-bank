export const federationConfig = {
  name: "shell",
  remotes: {
    "account-mfe": {
      type: "module",
      name: "account-mfe",
      entry: `http://localhost:${process.env.ACCOUNT_MFE_PORT ?? 4300}/remoteEntry.js`,
    },
    "customer-mfe": {
      type: "module",
      name: "customer-mfe",
      entry: `http://localhost:${process.env.CUSTOMER_MFE_PORT ?? 4400}/remoteEntry.js`,
    },
    "transfer-mfe": {
      type: "module",
      name: "transfer-mfe",
      entry: `http://localhost:${process.env.TRANSFER_MFE_PORT ?? 4500}/remoteEntry.js`,
    },
  },
  shared: ["react", "react-dom"],
};

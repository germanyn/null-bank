
    export type RemoteKeys = 'customer-mfe/CustomerApp';
    type PackageType<T> = T extends 'customer-mfe/CustomerApp' ? typeof import('customer-mfe/CustomerApp') :any;
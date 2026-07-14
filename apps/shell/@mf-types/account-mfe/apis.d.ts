
    export type RemoteKeys = 'account-mfe/AccountApp';
    type PackageType<T> = T extends 'account-mfe/AccountApp' ? typeof import('account-mfe/AccountApp') :any;
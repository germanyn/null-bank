
    export type RemoteKeys = 'transfer-mfe/TransferApp';
    type PackageType<T> = T extends 'transfer-mfe/TransferApp' ? typeof import('transfer-mfe/TransferApp') :any;
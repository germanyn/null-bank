declare const ACCOUNT_BASE: string;
declare const TRANSFER_BASE: string;
type ApiResult<T> = {
    ok: true;
    data: T;
} | {
    ok: false;
    error: string;
};
export declare function apiPost<T>(base: string, path: string, body: unknown): Promise<ApiResult<T>>;
export declare function apiGet<T>(base: string, path: string): Promise<ApiResult<T>>;
export { ACCOUNT_BASE, TRANSFER_BASE };
//# sourceMappingURL=api.d.ts.map
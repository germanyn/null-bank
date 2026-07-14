type ApiResult<T> = {
    ok: true;
    data: T;
} | {
    ok: false;
    error: string;
};
export declare function apiPost<T>(path: string, body: unknown): Promise<ApiResult<T>>;
export declare function apiGet<T>(path: string): Promise<ApiResult<T>>;
export {};
//# sourceMappingURL=api.d.ts.map
declare module 'wait-on' {
  function waitOn(
    resources: string | string[],
    options?: { timeout?: number; [key: string]: unknown },
  ): Promise<void>;
  export default waitOn;
}

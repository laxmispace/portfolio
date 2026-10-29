/// <reference types="vite/client" />

declare module "virtual:case-study-dev" {
  const entries: Record<number, () => Promise<unknown>>;
  export default entries;
}

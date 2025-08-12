import type { BDBridge } from "./bd/types";
import { mockBD } from "./bd/mock";

// Switch providers via env in the future
export function getBDProvider(): BDBridge {
  // if (process.env.NEXT_PUBLIC_BD_PROVIDER === "acme") return acmeBD;
  return mockBD;
}

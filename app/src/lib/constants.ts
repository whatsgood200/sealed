export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "1315");

export const STORY_AENEID_CHAIN = {
  id: 1315,
  name: "Story Aeneid Testnet",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL ?? "https://aeneid.storyrpc.io"] },
  },
  blockExplorers: {
    default: { name: "StoryScan", url: "https://aeneid.storyscan.io" },
  },
  testnet: true,
} as const;

export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const OWNER_WRITE_CONDITION = (process.env.NEXT_PUBLIC_OWNER_WRITE_CONDITION ??
  "0x4C9bFC96d7092b590D497A191826C3dA2277c34B") as `0x${string}`;

export const STORY_API_URL =
  process.env.NEXT_PUBLIC_STORY_API_URL ?? "http://172.192.41.96:1317";

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ?? "https://aeneid.storyrpc.io";

export const EXPLORER_URL = "https://aeneid.storyscan.io";

export const MIN_REVEAL_WINDOW_HOURS = 1;
export const CDR_TIMEOUT_MS = 120_000;

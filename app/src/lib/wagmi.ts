import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { STORY_AENEID_CHAIN } from "./constants";

export const wagmiConfig = getDefaultConfig({
  appName: "Sealed — Trustless Sealed-Bid Auctions",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
  chains: [STORY_AENEID_CHAIN],
  ssr: true,
});

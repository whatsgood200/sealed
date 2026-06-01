export type AuctionPhase = "bidding" | "revealing" | "settled";

export interface AuctionRecord {
  id: string;
  contract_address: string;
  creator_address: string;
  title: string;
  description: string;
  image_uri: string | null;
  reserve_price: string;      // wei as string
  bid_deposit: string;        // wei as string
  deadline: number;           // unix timestamp
  reveal_window: number;      // seconds
  bid_count: number;
  phase: AuctionPhase;
  winner_address: string | null;
  winning_amount: string | null;
  tx_hash: string;
  created_at: string;
}

export interface BidRecord {
  id: string;
  auction_id: string;
  bidder_address: string;
  vault_uuid: string;
  revealed: boolean;
  revealed_amount: string | null;
  tx_hash: string;
  created_at: string;
}

export interface CreateAuctionParams {
  title: string;
  description: string;
  imageUri: string;
  reservePrice: bigint;
  bidDeposit: bigint;
  deadline: number;
  revealWindow: number;
}

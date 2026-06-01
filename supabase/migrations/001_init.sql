-- ──────────────────────────────────────────────────────────────
-- Sealed: Trustless Sealed-Bid Auctions on Story CDR
-- Initial schema migration
-- ──────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Auctions
CREATE TABLE auctions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_address  TEXT        NOT NULL UNIQUE,
  condition_address TEXT,                          -- BidCondition contract
  creator_address   TEXT        NOT NULL,
  title             TEXT        NOT NULL,
  description       TEXT        NOT NULL DEFAULT '',
  image_uri         TEXT,
  reserve_price     TEXT        NOT NULL,          -- wei as string
  bid_deposit       TEXT        NOT NULL,          -- wei as string
  deadline          BIGINT      NOT NULL,          -- unix timestamp
  reveal_window     BIGINT      NOT NULL,          -- seconds
  bid_count         INTEGER     NOT NULL DEFAULT 0,
  phase             TEXT        NOT NULL DEFAULT 'bidding'
                    CHECK (phase IN ('bidding','revealing','settled')),
  winner_address    TEXT,
  winning_amount    TEXT,
  tx_hash           TEXT        NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bids
CREATE TABLE bids (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id       UUID        NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_address   TEXT        NOT NULL,
  vault_uuid       TEXT        NOT NULL,
  revealed         BOOLEAN     NOT NULL DEFAULT false,
  revealed_amount  TEXT,                           -- wei as string
  tx_hash          TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (auction_id, bidder_address)
);

-- Indexes
CREATE INDEX idx_auctions_creator   ON auctions(creator_address);
CREATE INDEX idx_auctions_deadline  ON auctions(deadline);
CREATE INDEX idx_auctions_phase     ON auctions(phase);
CREATE INDEX idx_bids_auction       ON bids(auction_id);
CREATE INDEX idx_bids_bidder        ON bids(bidder_address);

-- Row Level Security
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids     ENABLE ROW LEVEL SECURITY;

-- Public reads; service role handles writes via API routes
CREATE POLICY "auctions_public_read" ON auctions FOR SELECT USING (true);
CREATE POLICY "bids_public_read"     ON bids     FOR SELECT USING (true);

-- Increment bid count safely
CREATE OR REPLACE FUNCTION increment_bid_count(auction_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auctions
  SET bid_count = bid_count + 1
  WHERE id = auction_id;
END;
$$;

-- Update auction phase (can be called by cron or API)
CREATE OR REPLACE FUNCTION sync_auction_phases()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- bidding → revealing
  UPDATE auctions
  SET phase = 'revealing'
  WHERE phase = 'bidding'
    AND deadline < EXTRACT(EPOCH FROM now())::BIGINT;
END;
$$;

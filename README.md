# Sealed — Trustless Sealed-Bid Auctions on Story CDR

> Encrypted bids. On-chain settlement. No trusted middleman.

Sealed is a production-grade sealed-bid auction platform built on [Story Protocol](https://story.foundation) using **Confidential Data Rails (CDR)**. It solves a fundamental problem in on-chain auctions: how do you let bidders commit to a price without revealing it — without trusting anyone?

**Answer:** CDR threshold encryption. Each bid is encrypted client-side and stored as ciphertext in a CDR vault on Story. No single party — not the auctioneer, not a relayer, not a validator — can read bids before the reveal phase. The smart contract settles the winner automatically.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BIDDER                               │
│  bid amount ──► client-side encrypt ──► CDR Vault (chain)   │
│                     (TDH2 / TEE)          ciphertext only   │
└──────────────────────────┬──────────────────────────────────┘
                           │ vault UUID
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  SealedAuction.sol                          │
│                                                             │
│  registerBid(vaultUuid) ── locked deposit                   │
│  revealBid(amount)      ── after deadline, bidder decrypts  │
│  settle()               ── anyone calls, winner auto-picked │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              Story Aeneid Testnet + CDR Validators
```

### CDR Flow

1. **Allocate vault** — bidder calls `uploader.allocate()`, receives a UUID
2. **Encrypt bid** — bid amount encoded as 32-byte key, encrypted via TDH2 against the DKG public key
3. **Write to vault** — ciphertext stored on-chain; write condition = bidder EOA only
4. **Register on-chain** — bidder calls `SealedAuction.registerBid(uuid)` + deposit
5. **Reveal phase** — bidder calls `consumer.accessCDR(uuid)` to threshold-decrypt, then submits plaintext to `revealBid()`
6. **Settlement** — `settle()` iterates all reveals, picks max, pays creator, refunds losers

### Why this is novel

Standard on-chain auctions are open: everyone sees every bid in the mempool. CDR makes the ciphertext the on-chain artifact — the bid amount only exists in plaintext inside the bidder's browser and the TEE validator set. This is the first trustless sealed-bid primitive possible on Story.

---

## Project Structure

```
sealed/
├── contracts/                    # Solidity — Foundry
│   ├── src/
│   │   ├── SealedAuction.sol     # Core auction logic
│   │   └── SealedAuctionFactory.sol
│   ├── script/Deploy.s.sol
│   ├── test/SealedAuction.t.sol
│   └── foundry.toml
│
├── app/                          # Next.js 15 frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx               # Home — auction listings
│       │   ├── create/page.tsx        # Create auction
│       │   ├── auction/[id]/page.tsx  # Auction detail + bidding
│       │   └── api/
│       │       ├── auctions/          # CRUD
│       │       ├── bids/              # Bid records
│       │       └── sync-phases/       # Cron: update phases
│       ├── components/           # UI components
│       ├── hooks/useAuction.ts   # All mutations + queries
│       ├── lib/
│       │   ├── cdr.ts            # CDR SDK integration
│       │   ├── abis.ts           # Contract ABIs
│       │   ├── wagmi.ts          # Wallet config
│       │   ├── supabase.ts       # DB client
│       │   ├── constants.ts      # Addresses, chain config
│       │   └── format.ts         # Formatting utils
│       └── types/index.ts
│
└── supabase/
    └── migrations/
        ├── 001_init.sql          # Schema
        └── 002_rpc.sql           # Helper functions
```

---

## Getting Started

### 1. Deploy Contracts

```bash
cd contracts

# Install Foundry if needed
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Install deps
forge install foundry-rs/forge-std

# Copy env
cp .env.example .env
# Fill PRIVATE_KEY with a funded Aeneid wallet

# Deploy
forge script script/Deploy.s.sol \
  --rpc-url https://aeneid.storyrpc.io \
  --broadcast

# Copy the factory address from the output
```

Get Aeneid testnet IP from: https://faucet.story.foundation

### 2. Set Up Supabase

```bash
# Create project at supabase.com
# Run migrations in Supabase SQL editor:
supabase/migrations/001_init.sql
supabase/migrations/002_rpc.sql
```

### 3. Run Frontend

```bash
cd app
cp .env.local.example .env.local
# Fill all values

npm install
npm run dev
```

Open http://localhost:3000

---

## Submission

**Track 1 — Technical Implementation:**
- Time-based CDR read condition (vault unlocks only after auction deadline)
- Multi-vault synchronized reveal (N bidders, all vaults same unlock trigger)
- Smart contract winner determination + atomic fund settlement
- Composable vault system — vault UUIDs stored in contract, readable by other contracts
- New access pattern: owner-write + time-locked read on CDR

**Track 2 — Best CDR Application:**
- Real use case: sealed-bid auctions are used in procurement, NFT drops, DAO grants, hiring
- Full end-to-end UX: create → bid → reveal → settle
- Real users: anyone running a DAO grant round or NFT auction
- On-chain verifiable: every step has a transaction hash

**CDR SDK used:** `@piplabs/cdr-sdk` v0.2.1
**Network:** Story Aeneid Testnet (chainId 1513)
**Live demo:** https://sealed.vercel.app (after deploy)

---

## How CDR Enables This

Traditional sealed-bid auctions need a trusted third party to hold bids and reveal them fairly. CDR replaces that trust with cryptography:

| Traditional | Sealed (CDR) |
|---|---|
| Auctioneer holds bids | CDR vault holds ciphertext |
| Auctioneer reveals | Bidder self-reveals via threshold decrypt |
| Trust auctioneer | Trust the math |
| Centralized | Fully on-chain |
| Can collude | Impossible to peek |

This is the fundamental value proposition of CDR: private data that becomes a composable on-chain primitive. Sealed demonstrates it with a mechanism that previously required trusted infrastructure.

---

Built for the [CDR Hackathon](https://build.usecdr.dev) · May–June 2026

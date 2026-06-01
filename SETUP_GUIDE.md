# Sealed — Complete Beginner Setup Guide (Windows CMD)

Everything you need to go from zero to a live app on Story Aeneid testnet.
Follow every step in order. Do not skip.

---

## Folder Structure

This is exactly what your project looks like after setup.
Every file has a purpose — nothing is extra.

```
sealed/                                  ← root project folder
│
├── SETUP_GUIDE.md                       ← this file
├── README.md                            ← project overview + submission notes
├── .gitignore                           ← tells Git what to ignore
│
├── contracts/                           ← Solidity smart contracts (Foundry)
│   ├── foundry.toml                     ← Foundry compiler settings
│   ├── package.json                     ← npm scripts (build, test, deploy)
│   ├── .env.example                     ← copy this to .env, fill your private key
│   │
│   ├── lib/                             ← created by Foundry automatically
│   │   └── forge-std/                   ← Foundry test utilities (auto-installed)
│   │
│   ├── src/                             ← your Solidity source files
│   │   ├── SealedAuction.sol            ← main auction contract
│   │   ├── SealedAuctionFactory.sol     ← deploys auctions + conditions
│   │   ├── BidCondition.sol             ← CDR read/write access conditions
│   │   └── interfaces/
│   │       ├── ICDRCondition.sol        ← interface for CDR conditions
│   │       └── ISealedAuction.sol       ← interface BidCondition uses
│   │
│   ├── script/
│   │   └── Deploy.s.sol                 ← deployment script (run with forge)
│   │
│   └── test/
│       └── SealedAuction.t.sol          ← automated tests
│
├── app/                                 ← Next.js frontend
│   ├── package.json                     ← npm dependencies
│   ├── tsconfig.json                    ← TypeScript settings
│   ├── tailwind.config.ts               ← styling system
│   ├── postcss.config.js                ← CSS processor config
│   ├── next.config.ts                   ← Next.js settings
│   ├── vercel.json                      ← Vercel deployment + cron config
│   ├── .env.local.example               ← copy this to .env.local, fill all values
│   │
│   └── src/
│       ├── middleware.ts                ← CORS headers for API routes
│       │
│       ├── types/
│       │   └── index.ts                 ← TypeScript type definitions
│       │
│       ├── lib/                         ← shared utilities
│       │   ├── abis.ts                  ← contract ABIs (JSON interface)
│       │   ├── cdr.ts                   ← CDR SDK: encrypt/decrypt bid amounts
│       │   ├── constants.ts             ← chain config, contract addresses
│       │   ├── format.ts                ← format IP amounts, addresses, time
│       │   ├── supabase.ts              ← database client
│       │   └── wagmi.ts                 ← wallet connection config
│       │
│       ├── hooks/
│       │   └── useAuction.ts            ← all data fetching + blockchain mutations
│       │
│       ├── components/                  ← reusable UI pieces
│       │   ├── Navbar.tsx               ← top navigation bar
│       │   ├── AuctionCard.tsx          ← auction listing card
│       │   ├── BidModal.tsx             ← "place sealed bid" popup
│       │   ├── Countdown.tsx            ← live countdown timer
│       │   ├── StatCard.tsx             ← single stat display box
│       │   ├── PhaseProgress.tsx        ← bidding → reveal → settled tracker
│       │   ├── EmptyState.tsx           ← empty list placeholder
│       │   └── TxStep.tsx               ← transaction step progress
│       │
│       └── app/                         ← Next.js pages + API routes
│           ├── globals.css              ← global styles, fonts, design system
│           ├── layout.tsx               ← root HTML layout
│           ├── providers.tsx            ← wallet + query providers
│           ├── page.tsx                 ← home page (auction list)
│           │
│           ├── create/
│           │   └── page.tsx             ← create new auction page
│           │
│           ├── auction/
│           │   └── [id]/
│           │       └── page.tsx         ← individual auction page
│           │
│           └── api/                     ← backend API routes
│               ├── auctions/
│               │   ├── route.ts         ← GET all / POST new auction
│               │   └── [id]/
│               │       └── route.ts     ← GET one / PATCH auction
│               ├── bids/
│               │   └── route.ts         ← GET / POST / PATCH bids
│               └── sync-phases/
│                   └── route.ts         ← cron: auto-advance auction phases
│
└── supabase/                            ← database setup
    ├── config.toml                      ← Supabase CLI config (optional)
    └── migrations/
        ├── 001_init.sql                 ← creates tables: auctions, bids
        └── 002_rpc.sql                  ← creates helper functions
```

---

## Prerequisites — Install These First

Open **Command Prompt** (press `Windows + R`, type `cmd`, press Enter).
Run each command and wait for it to finish before moving to the next.

### 1. Install Node.js
Download from: https://nodejs.org/en/download
Choose **LTS version** → Windows Installer (.msi)
Run the installer, click through defaults.

Verify it worked:
```cmd
node --version
npm --version
```
Both should print a version number (e.g. v20.x.x).

### 2. Install Git
Download from: https://git-scm.com/download/win
Run installer, click through all defaults.

Verify:
```cmd
git --version
```

### 3. Install Foundry (for smart contracts)
```cmd
curl -L https://foundry.paradigm.xyz | bash
```
Then close CMD and reopen it, then run:
```cmd
foundryup
```
Verify:
```cmd
forge --version
```

### 4. Install VS Code (recommended editor)
Download from: https://code.visualstudio.com/download

---

## Step 1 — Put the Project on Your Computer

You already have the `sealed/` folder downloaded from Claude.
Move it somewhere sensible, for example:
```
C:\Users\YourName\Projects\sealed\
```

Open CMD and navigate to it:
```cmd
cd C:\Users\YourName\Projects\sealed
```

Confirm you're in the right place:
```cmd
dir
```
You should see: `contracts`, `app`, `supabase`, `README.md`, `SETUP_GUIDE.md`

---

## Step 2 — Create Accounts (Free)

You need accounts on three services. All free.

### A. Supabase (database)
1. Go to https://supabase.com → click **Start your project**
2. Sign up with GitHub or email
3. Click **New Project**
4. Name it `sealed`, choose a region close to you, set a database password (save it)
5. Wait ~2 minutes for it to provision

### B. WalletConnect (wallet connection)
1. Go to https://cloud.walletconnect.com
2. Sign up → click **New Project**
3. Name it `sealed`, type: **App**
4. Copy the **Project ID** (looks like: `abc123def456...`)

### C. A crypto wallet with Story testnet tokens
1. Install MetaMask: https://metamask.io/download
2. Create a new wallet, save your seed phrase somewhere safe
3. Add Story Aeneid testnet to MetaMask:
   - Network name: `Story Aeneid Testnet`
   - RPC URL: `https://aeneid.storyrpc.io`
   - Chain ID: `1513`
   - Currency symbol: `IP`
   - Explorer: `https://aeneid.storyscan.io`
4. Get free testnet IP tokens: https://faucet.story.foundation
   (paste your MetaMask wallet address, click request)

---

## Step 3 — Set Up the Database (Supabase)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open the file `supabase\migrations\001_init.sql` in VS Code
5. Copy ALL the text → paste it into Supabase SQL Editor → click **Run**
6. You should see: `Success. No rows returned`
7. Click **New query** again
8. Open `supabase\migrations\002_rpc.sql` → copy all → paste → **Run**

To get your Supabase keys:
- Go to **Project Settings** → **API**
- Copy **Project URL** (looks like `https://xxxxx.supabase.co`)
- Copy **anon public** key
- Copy **service_role** key (click reveal)
- Save all three — you need them in the next step

---

## Step 4 — Configure Environment Variables

### Frontend (.env.local)

In CMD:
```cmd
cd C:\Users\YourName\Projects\sealed\app
copy .env.local.example .env.local
```

Now open `.env.local` in VS Code and fill it in:
```cmd
code .env.local
```

Fill every line:
```env
NEXT_PUBLIC_RPC_URL=https://aeneid.storyrpc.io
NEXT_PUBLIC_STORY_API_URL=http://172.192.41.96:1317
NEXT_PUBLIC_CHAIN_ID=1513

# Leave this empty for now — fill AFTER Step 5 (contract deploy)
NEXT_PUBLIC_FACTORY_ADDRESS=

NEXT_PUBLIC_OWNER_WRITE_CONDITION=0x4C9bFC96d7092b590D497A191826C3dA2277c34B

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key

NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123def456...

CRON_SECRET=make-up-any-random-string-here
```

Save the file (Ctrl+S).

### Contracts (.env)

```cmd
cd C:\Users\YourName\Projects\sealed\contracts
copy .env.example .env
code .env
```

Fill it:
```env
RPC_URL=https://aeneid.storyrpc.io
PRIVATE_KEY=0x...your-metamask-private-key
ETHERSCAN_API_KEY=anything
```

To get your MetaMask private key:
- Open MetaMask → click the 3 dots → Account details → Export private key
- Enter your MetaMask password
- Copy the key (starts with 0x...)
- **Never share this with anyone**

---

## Step 5 — Deploy Smart Contracts

```cmd
cd C:\Users\YourName\Projects\sealed\contracts
```

Install Foundry dependencies:
```cmd
forge install foundry-rs/forge-std --no-commit
```

Build contracts (check for errors):
```cmd
forge build
```

If it says `Compiler run successful` — you're good.
If there are errors, paste them and ask for help.

Deploy to Story Aeneid testnet:
```cmd
forge script script/Deploy.s.sol --rpc-url https://aeneid.storyrpc.io --broadcast --private-key YOUR_PRIVATE_KEY_HERE
```
Replace `YOUR_PRIVATE_KEY_HERE` with your actual key.

The output will include a line like:
```
SealedAuctionFactory deployed at: 0xABCDEF1234...
```

Copy that address. Open `.env.local` in the `app/` folder:
```cmd
cd ..\app
code .env.local
```

Find the line:
```
NEXT_PUBLIC_FACTORY_ADDRESS=
```
Paste your factory address after the `=` sign. Save.

---

## Step 6 — Install Frontend Dependencies

```cmd
cd C:\Users\YourName\Projects\sealed\app
npm install
```

This downloads all the packages listed in `package.json`.
It will take 1-3 minutes. You'll see a lot of output — that's normal.

---

## Step 7 — Run the App Locally

```cmd
npm run dev
```

You'll see:
```
▲ Next.js 15.x.x
- Local: http://localhost:3000
```

Open your browser and go to: **http://localhost:3000**

You should see the Sealed homepage with "Auctions where no one cheats."

---

## Step 8 — Test the Full Flow

Do this to verify everything works end to end:

1. **Connect wallet** — click "Connect" in the top right, choose MetaMask
2. **Create an auction** — click "Create Auction"
   - Fill in title, description
   - Set reserve price: `0.01` (IP)
   - Set bid deposit: `0.001` (IP)
   - Set duration to "1 hour" for testing
   - Click "Deploy Auction"
   - MetaMask will pop up → confirm the transaction
   - Wait ~10 seconds → you'll be redirected to the auction page

3. **Place a bid** — click "Place Sealed Bid"
   - Enter `0.05` as your bid amount
   - Click "Encrypt & Submit Bid"
   - MetaMask will pop up 2-3 times (CDR vault + on-chain registration) → confirm each
   - You'll see "Your bid is sealed ✓"

4. **Wait for deadline** (or create a short test auction with 1 min duration)

5. **Reveal your bid** — after deadline, click "Reveal My Bid"
   - This decrypts your CDR vault and submits the amount on-chain

6. **Settle** — after reveal window, click "Settle Auction"
   - Winner is determined on-chain, funds transfer automatically

---

## Step 9 — Deploy to Vercel (make it public)

### Install Vercel CLI
```cmd
npm install -g vercel
```

### Deploy
```cmd
cd C:\Users\YourName\Projects\sealed\app
vercel
```

Follow the prompts:
- Link to existing project? **N**
- Project name: `sealed`
- Directory: `.` (current folder)
- Override settings? **N**

Then add your environment variables in the Vercel dashboard:
1. Go to https://vercel.com/dashboard
2. Click your `sealed` project → **Settings** → **Environment Variables**
3. Add every variable from your `.env.local` file one by one

Redeploy with env vars:
```cmd
vercel --prod
```

Your app is now live at `https://sealed-xxx.vercel.app` 🎉

---

## Common Errors & Fixes

### "forge: command not found"
Close CMD and reopen it. If still fails, restart your computer.

### "npm: command not found"
Node.js wasn't installed correctly. Re-download from nodejs.org and reinstall.

### "Insufficient funds" when deploying
Your MetaMask wallet doesn't have testnet IP. Go to https://faucet.story.foundation and request more.

### "NEXT_PUBLIC_FACTORY_ADDRESS is not set"
You forgot to fill `NEXT_PUBLIC_FACTORY_ADDRESS` in `.env.local` after deploying contracts.

### "Failed to fetch auctions"
Your Supabase keys in `.env.local` are wrong, or you didn't run the SQL migrations.

### MetaMask shows wrong network
Make sure you added Story Aeneid Testnet to MetaMask exactly as shown in Step 2C.

### CDR encryption fails
Make sure `NEXT_PUBLIC_STORY_API_URL` is set to `http://172.192.41.96:1317` exactly.

---

## What Each Service Does

| Service | What it does | Free? |
|---|---|---|
| Story Aeneid | Blockchain where contracts live | ✅ testnet |
| CDR (Story) | Encrypts/decrypts bid amounts | ✅ testnet |
| Supabase | Stores auction + bid metadata | ✅ free tier |
| WalletConnect | Lets users connect wallets | ✅ free tier |
| Vercel | Hosts the frontend | ✅ free tier |
| MetaMask | User's crypto wallet | ✅ free |

---

## Hackathon Submission Checklist

Before submitting to the CDR Hackathon Discord:

- [ ] App is deployed and publicly accessible
- [ ] At least one real auction created on testnet
- [ ] At least one real bid submitted (CDR vault created)
- [ ] Reveal + settle flow tested end to end
- [ ] Factory contract address noted (for judges)
- [ ] GitHub repo created with all code (public)
- [ ] Short demo video or screenshots ready
- [ ] Tweet about it with #StoryCDR tag (helps App track judging)

### GitHub repo setup (from CMD):
```cmd
cd C:\Users\YourName\Projects\sealed
git init
git add .
git commit -m "Initial commit: Sealed — trustless sealed-bid auctions on CDR"
```
Then create a repo on github.com and follow their "push existing repo" instructions.

---

## Submission Text (ready to paste in Discord)

```
Project: Sealed — Trustless Sealed-Bid Auctions
Live app: https://sealed-xxx.vercel.app
GitHub: https://github.com/yourname/sealed
Factory contract: 0x...your-factory-address (Story Aeneid testnet)

Track 1 (Technical): Time-locked CDR read conditions, multi-vault synchronized 
reveal, on-chain winner settlement, BidCondition contract implementing ICDRCondition.

Track 2 (App): Full end-to-end auction UX — create, bid (CDR-encrypted), reveal, 
settle. Real use case: DAO grants, NFT drops, procurement. No trusted middleman.
```

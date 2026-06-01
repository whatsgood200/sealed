"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletClient, usePublicClient, useAccount } from "wagmi";
import { AUCTION_ABI, FACTORY_ABI } from "@/lib/abis";
import { FACTORY_ADDRESS } from "@/lib/constants";
import { encryptBid, decryptBid } from "@/lib/cdr";
import type { AuctionRecord } from "@/types";
import toast from "react-hot-toast";

export function useAuctions() {
  return useQuery({
    queryKey: ["auctions"],
    queryFn: async (): Promise<AuctionRecord[]> => {
      const res = await fetch("/api/auctions");
      if (!res.ok) throw new Error("Failed to fetch auctions");
      return res.json();
    },
    refetchInterval: 15_000,
  });
}

export function useAuctionById(id: string) {
  return useQuery({
    queryKey: ["auction", id],
    queryFn: async (): Promise<AuctionRecord & { bids: any[] }> => {
      const res = await fetch(`/api/auctions/${id}`);
      if (!res.ok) throw new Error("Auction not found");
      return res.json();
    },
    refetchInterval: 10_000,
    enabled: !!id,
  });
}

export function useCreateAuction() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string; description: string; imageUri: string;
      reservePrice: bigint; bidDeposit: bigint; deadline: number; revealWindow: number;
    }) => {
      if (!walletClient || !publicClient) throw new Error("Wallet not connected");
      toast.loading("Simulating deployment…", { id: "create" });

      const args = [
        params.title, params.description, params.imageUri,
        params.reservePrice, params.bidDeposit,
        BigInt(params.deadline), BigInt(params.revealWindow),
      ] as const;

      // simulateContract returns what the function WILL return when called
      // This gives us the auction address before the tx is sent
      const { result } = await publicClient.simulateContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "createAuction",
        args,
        account: walletClient.account,
      });

      const [auctionAddress, conditionAddress] = result as [`0x${string}`, `0x${string}`];
console.log("Simulated auction address:", auctionAddress, "condition:", conditionAddress);

      toast.loading("Deploying auction contract…", { id: "create" });

      const hash = await walletClient.writeContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "createAuction",
        args,
      });

      toast.loading("Waiting for confirmation…", { id: "create" });
      await publicClient.waitForTransactionReceipt({ hash });

      console.log("Deployed! Address:", auctionAddress, "TX:", hash);

      const res = await fetch("/api/auctions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress:  auctionAddress,
          conditionAddress: conditionAddress ?? null,
          creatorAddress:   walletClient.account.address,
          txHash:           hash,
          title:            params.title,
          description:      params.description,
          imageUri:         params.imageUri,
          reservePrice:     params.reservePrice.toString(),
          bidDeposit:       params.bidDeposit.toString(),
          deadline:         params.deadline,
          revealWindow:     params.revealWindow,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error ?? "Failed to save auction");
      }

      toast.success("Auction deployed!", { id: "create" });
      return res.json() as Promise<AuctionRecord>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auctions"] }),
    onError: (err: Error) => toast.error(err.message, { id: "create" }),
  });
}

export function useSubmitBid(auctionId: string, contractAddress: `0x${string}`) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      bidAmountWei: bigint;
      depositWei: bigint;
      bidderAddress: string;
      signMessage: (msg: string) => Promise<string>;
    }) => {
      if (!walletClient || !publicClient || !address) throw new Error("Wallet not connected");

      toast.loading("Step 1/3 — Sign to authorize encryption…", { id: "bid" });
      const { uuid } = await encryptBid(
        params.bidAmountWei, params.bidderAddress, params.signMessage
      );

      toast.loading("Step 2/3 — Registering on-chain…", { id: "bid" });
      const hash = await walletClient.writeContract({
        address: contractAddress, abi: AUCTION_ABI,
        functionName: "registerBid", args: [BigInt(uuid)],
        value: params.depositWei,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

if (receipt.status === "reverted") {
  throw new Error("Transaction reverted — auction may be expired or deposit too low");
}

toast.loading("Step 3/3 — Saving…", { id: "bid" });
      await fetch("/api/bids", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auctionId, bidderAddress: address, vaultUuid: uuid, txHash: hash }),
      });

      toast.success("Sealed bid submitted!", { id: "bid" });
      return { uuid, hash };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auction", auctionId] }),
    onError: (err: Error) => toast.error(err.message, { id: "bid" }),
  });
}

export function useRevealBid(auctionId: string, contractAddress: `0x${string}`) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      vaultUuid: string;
      depositWei: bigint;
      bidderAddress: string;
      signMessage: (msg: string) => Promise<string>;
    }) => {
      if (!walletClient || !publicClient || !address) throw new Error("Wallet not connected");

      toast.loading("Step 1/2 — Sign to authorize decryption…", { id: "reveal" });
      const bidAmountWei = await decryptBid(
        params.vaultUuid, params.bidderAddress, params.signMessage
      );

      toast.loading("Step 2/2 — Submitting reveal on-chain…", { id: "reveal" });
      const topUp = bidAmountWei > params.depositWei ? bidAmountWei - params.depositWei : 0n;

      const hash = await walletClient.writeContract({
        address: contractAddress, abi: AUCTION_ABI,
        functionName: "revealBid", args: [bidAmountWei], value: topUp,
      });
      await publicClient.waitForTransactionReceipt({ hash });

      await fetch("/api/bids", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auctionId, bidderAddress: address, revealedAmount: bidAmountWei.toString() }),
      });

      toast.success("Bid revealed!", { id: "reveal" });
      return { bidAmountWei, hash };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auction", auctionId] }),
    onError: (err: Error) => toast.error(err.message, { id: "reveal" }),
  });
}

export function useSettleAuction(auctionId: string, contractAddress: `0x${string}`) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!walletClient || !publicClient) throw new Error("Wallet not connected");
      toast.loading("Settling on-chain…", { id: "settle" });

      const hash = await walletClient.writeContract({
        address: contractAddress, abi: AUCTION_ABI, functionName: "settle", args: [],
      });
      await publicClient.waitForTransactionReceipt({ hash });

      const info = await publicClient.readContract({
        address: contractAddress, abi: AUCTION_ABI, functionName: "info",
      }) as unknown as any[];

      const winner     = info[9]  as string;
      const winningAmt = info[10] as bigint;

      await fetch(`/api/auctions/${auctionId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "settled",
          winner_address: winner !== "0x0000000000000000000000000000000000000000" ? winner : null,
          winning_amount: winningAmt > 0n ? winningAmt.toString() : null,
        }),
      });

      toast.success("Auction settled!", { id: "settle" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
    },
    onError: (err: Error) => toast.error(err.message, { id: "settle" }),
  });
}

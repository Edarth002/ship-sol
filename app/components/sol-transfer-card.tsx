"use client";

import { address, lamports } from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { useClient } from "@solana/react";
import { useConnectedWallet } from "@solana/kit-plugin-wallet/react";
import { useState } from "react";
import type { AppClient } from "../providers";

const LAMPORTS_PER_SOL = BigInt(1_000_000_000);

function parseLamports(input: string) {
  const sol = Number(input);
  if (!Number.isFinite(sol) || sol <= 0) return null;
  const whole = Math.trunc(sol);
  const frac = sol - whole;
  const amount =
    BigInt(whole) * LAMPORTS_PER_SOL +
    BigInt(Math.round(frac * Number(LAMPORTS_PER_SOL)));
  return amount > BigInt(0) ? amount : null;
}

export function SolTransferCard() {
  const client = useClient<AppClient>();
  const connected = useConnectedWallet(client);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [signature, setSignature] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusText = connected ? "Wallet connected" : "Wallet disconnected";

  async function sendSol() {
    if (!connected?.signer) {
      setError("Connect a wallet first.");
      return;
    }
    const amountLamports = parseLamports(amount);
    if (!amountLamports) {
      setError("Enter an amount greater than 0.");
      return;
    }
    const dest = destination.trim();
    if (!dest) {
      setError("Enter a destination address.");
      return;
    }
    setError(null);
    setIsSending(true);
    try {
      const transfer = getTransferSolInstruction({
        source: connected.signer,
        destination: address(dest),
        amount: lamports(amountLamports)
      });
      const result = await client.sendTransaction([transfer]);
      setSignature(result.context.signature);
      setAmount("0.001");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send SOL");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="rounded-2xl bg-gradient-to-br from-[#9945FF]/50 via-white/10 to-[#14F195]/40 p-px shadow-[0_0_60px_-15px_rgba(153,69,255,0.55)]">
      <div className="space-y-5 rounded-2xl bg-[#0d0b1a]/90 p-6 backdrop-blur-xl">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">
            Send SOL with the connected wallet
          </h2>
          <p className="text-sm text-white/55">
            Your connected signer pays the network fee and authorizes the
            transfer.
          </p>
        </div>
  
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-white/80"
            htmlFor="destination"
          >
            Destination address
          </label>
          <input
            id="destination"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="Paste a Solana wallet address"
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-sm text-white placeholder:text-white/30 transition focus:border-[#9945FF] focus:outline-none focus:ring-2 focus:ring-[#9945FF]/40"
          />
        </div>
  
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80" htmlFor="amount">
            Amount
          </label>
          <div className="relative">
            <input
              id="amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              min="0"
              step="0.001"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-3.5 pr-16 font-mono text-sm tabular-nums text-white transition focus:border-[#14F195] focus:outline-none focus:ring-2 focus:ring-[#14F195]/30"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm font-medium text-white/45">
              SOL
            </span>
          </div>
        </div>
  
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-white/55">
            <span
              className={`h-2 w-2 rounded-full ${
                isSending
                  ? "animate-pulse bg-amber-400"
                  : signature
                    ? "bg-[#14F195] shadow-[0_0_8px_#14F195]"
                    : error
                      ? "bg-rose-400"
                      : "bg-white/30"
              }`}
            />
            {statusText}
          </p>
          <button
            type="button"
            onClick={() => void sendSol()}
            disabled={!connected?.signer || isSending}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-[#9945FF] to-[#6d5dfc] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgba(153,69,255,0.8)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14F195] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {isSending ? "Sending…" : "Send SOL"}
          </button>
        </div>
  
        {signature ? (
          <div className="rounded-xl border border-[#14F195]/30 bg-[#14F195]/10 px-4 py-3 text-sm">
            <p className="font-semibold text-[#14F195]">Transfer sent</p>
            <a
              className="text-white/80 underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-[#14F195]"
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
            >
              View on Solana Explorer
            </a>
          </div>
        ) : null}
  
        {error ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
            {error}
          </p>
        ) : null}
      </div>
    </section>
);
}
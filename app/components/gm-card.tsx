"use client";

import { address, lamports } from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import { useClient } from "@solana/react";
import { useConnectedWallet } from "@solana/kit-plugin-wallet/react";
import { useState } from "react";
import type { AppClient } from "../providers";

export function GmCard() {
  const client = useClient<AppClient>();
  const connected = useConnectedWallet(client);

  const [gmCount, setGmCount] = useState(0);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sayGm() {
    if (!connected?.signer) return;

    setError(null);
    setIsSending(true);

    try {
      // Sends 0.0001 SOL to your own address just to record an on-chain GM
      const transfer = getTransferSolInstruction({
        source: connected.signer,
        destination: address(connected.signer.address),
        amount: lamports(BigInt(100_000)),
      });

      const result = await client.sendTransaction([transfer]);
      setSignature(result.context.signature);
      setGmCount((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send GM");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="rounded-2xl bg-gradient-to-br from-[#14F195]/40 via-white/10 to-[#9945FF]/50 p-px">
      <div className="space-y-5 rounded-2xl bg-[#0d0b1a]/90 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">
              On-Chain GM Check-In
            </h2>
            <p className="text-sm text-white/55">
              One-click micro-transaction using your connected wallet.
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-bold text-[#14F195]">
              {gmCount}
            </p>
            <p className="text-xs text-white/45">GMs sent</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void sayGm()}
          disabled={!connected?.signer || isSending}
          className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#14F195] to-[#9945FF] px-5 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!connected?.signer
            ? "Connect wallet above to say GM"
            : isSending
              ? "Confirming in wallet…"
              : "Say GM On-Chain (0.0001 SOL)"}
        </button>

        {signature ? (
          <div className="rounded-xl border border-[#14F195]/30 bg-[#14F195]/10 px-4 py-3 text-sm">
            <p className="font-semibold text-[#14F195]">GM recorded on-chain!</p>
            <a
              className="text-white/80 underline decoration-white/30 underline-offset-4 transition hover:text-white"
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
            >
              View on Solana Explorer
            </a>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
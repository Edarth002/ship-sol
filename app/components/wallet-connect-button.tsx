"use client";

import { useState } from "react";
import {
  useConnect,
  useConnectedWallet,
  useDisconnect,
  useWallets,
  useWalletStatus
} from "@solana/kit-plugin-wallet/react";
import { useClient } from "@solana/react";
import type { AppClient } from "../providers";

function truncate(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function WalletConnectButton() {
  const client = useClient<AppClient>();
  const status = useWalletStatus(client);
  const wallets = useWallets(client);
  const connected = useConnectedWallet(client);
  const connect = useConnect(client);
  const disconnect = useDisconnect(client);
  const [open, setOpen] = useState(false);

  const address = connected ? String(connected.account.address) : null;
  const error = connect.error ?? disconnect.error;

  return (
   <div className="relative">
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      aria-haspopup="menu"
      className="group relative inline-flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-[#9945FF]/60 hover:shadow-[0_0_24px_-6px_rgba(153,69,255,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9945FF]/60"
    >
      <span className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${
            address ? "bg-[#14F195] shadow-[0_0_8px_#14F195]" : "bg-white/30"
          }`}
        />
        {address ? (
          <span className="font-mono">{truncate(address)}</span>
        ) : (
          <span>Connect wallet</span>
        )}
      </span>
      <svg
        viewBox="0 0 20 20"
        className={`h-4 w-4 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M5.5 7.5 10 12l4.5-4.5-1.1-1.1L10 9.8 6.6 6.4z" />
      </svg>
    </button>
 
    {open ? (

      <div
        role="menu"
        className="absolute z-10 mt-2 w-full min-w-[260px] rounded-2xl bg-gradient-to-br from-[#9945FF]/50 via-white/10 to-[#14F195]/40 p-px shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
      >
        <div className="rounded-2xl bg-[#0d0b1a]/95 p-3 backdrop-blur-xl">
          {connected ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                <p className="text-xs font-medium text-[#14F195]">Connected</p>
                <p
                  className="font-mono text-sm text-white"
                  title={address ?? ""}
                >
                  {address ? truncate(address) : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void disconnect.dispatch();
                  setOpen(false);
                }}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="px-1 text-xs font-medium text-white/50">
                Choose a wallet
              </p>
              <div className="space-y-1.5">
                {wallets.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/15 px-3.5 py-3 text-sm text-white/55">
                    No wallets found. Install a Solana wallet extension, then
                    reload.
                  </p>
                ) : (
                  wallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      type="button"
                      disabled={connect.isRunning || status === "pending"}
                      onClick={() => {
                        void connect.dispatch(wallet);
                        setOpen(false);
                      }}
                      className="flex cursor-pointer w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:border-[#9945FF]/60 hover:bg-[#9945FF]/10 disabled:opacity-40"
                    >
                      <span>{wallet.name}</span>
                      <span className="text-xs text-[#14F195]">Connect</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
 
          {error ? (
            <p className="mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200">
              {error instanceof Error ? error.message : String(error)}
            </p>
          ) : null}
        </div>
      </div>
    ) : null}
  </div>
);
}
import GetSolCard from "./components/get-sol-card";
import { GmCard } from "./components/gm-card";
import { SolTransferCard } from "./components/sol-transfer-card";
import { WalletConnectButton } from "./components/wallet-connect-button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#07060f] bg-[radial-gradient(60%_50%_at_15%_0%,rgba(153,69,255,0.22),transparent),radial-gradient(50%_40%_at_90%_10%,rgba(20,241,149,0.12),transparent)] text-white">
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-14 font-sans">
        <header className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs text-white/60 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#14F195] shadow-[0_0_8px_#14F195]" />
            @solana/kit + Next.js
          </p>
          <h1 className="max-w-3xl bg-gradient-to-r from-white via-[#c9a2ff] to-[#14F195] bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-5xl">
            Solana wallet + SOL transfer
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/60">
            Connect a Wallet Standard wallet and send a SOL transfer using the
            connected signer.
          </p>
        </header>

        <section className="relative z-30 rounded-2xl bg-gradient-to-br from-[#9945FF]/40 via-white/10 to-[#14F195]/30 p-px">
          <div className="flex flex-col gap-4 rounded-2xl bg-[#0d0b1a]/90 p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white">Wallet</h2>
              <p className="text-sm text-white/55">
                Pick a Wallet Standard connector.
              </p>
            </div>
            <div className="sm:min-w-[260px]">
              <WalletConnectButton />
            </div>
          </div>
        </section>

        <GmCard />

        <SolTransferCard />
        <GetSolCard />
      </main>
    </div>
  );
}
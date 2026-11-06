"use client";
import { createSolanaRpc, address } from "@solana/kit"
import { useEffect, useState } from "react" 

const rpcUrl = "https://api.devnet.solana.com"
const rpc = createSolanaRpc(rpcUrl);

const Wallet = "B1rWidC6i32p4ZivZRyNvvBwK4wdfkbcPPT2N7xSMcRZ"


export default function GetSolCard() {
    const [balance, setBalance] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      
        async function getWalletBalance(){
            try {
                setLoading(true);

               const walletAddress = address(Wallet);
               const { value: lamports } = await rpc.getBalance(walletAddress).send();

               const solValue = Number(lamports) / Math.pow(10, 9);
               setBalance(solValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                
               setLoading(false);
            }
            catch (error) {
            setBalance(null);
            setLoading(false);
            }
            finally {
            setLoading(false);
            }
        }
        getWalletBalance();
    }, []);



   return (
    <div className="rounded-2xl bg-gradient-to-br from-[#9945FF]/60 via-white/10 to-[#14F195]/50 p-px">
        <div className="rounded-2xl bg-[#0d0b1a]/90 p-5 backdrop-blur-xl">
        <h2 className="text-sm font-medium text-white/60">SOL balance</h2>
    
        {loading ? (
            <div className="mt-3 h-9 w-40 animate-pulse rounded-lg bg-white/10" />
        ) : balance !== null ? (
            <p className="mt-2 flex items-baseline gap-2">
            <span className="bg-gradient-to-r from-[#c9a2ff] to-[#14F195] bg-clip-text font-mono text-4xl font-semibold tabular-nums text-transparent">
                {balance.toString()}
            </span>
            <span className="text-sm font-medium text-white/50">SOL</span>
            </p>
        ) : (
            <p className="mt-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            Couldn’t fetch your balance. Check your network and try again.
            </p>
        )}
        </div>
    </div>
);
}

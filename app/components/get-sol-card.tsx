"use client";
import {useClient} from "@solana/react";
import { createSolanaRpc, address, createSolanaRpcSubscriptions } from "@solana/kit"
import { useEffect, useState } from "react" 
import { useConnectedWallet } from "@solana/kit-plugin-wallet/react";
import type { AppClient } from "../providers";

const rpcUrl = "https://api.devnet.solana.com"
const rpcUrl2 = "wss://api.devnet.solana.com"
const rpc = createSolanaRpc(rpcUrl);
const rpcSubscriptions = createSolanaRpcSubscriptions(rpcUrl2);



function formatSol(lamports: bigint): string {
    const solValue = Number(lamports) / Math.pow(10, 9);
    return solValue.toLocaleString(undefined, { minimumFractionDigits: 10, maximumFractionDigits: 10 });
}

export default function GetSolCard() {
    const [balance, setBalance] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const client = useClient<AppClient>();
    const connected = useConnectedWallet(client);
    const walletAddress = connected?.signer?.address;

    useEffect(() => {

        if(!walletAddress){
            setBalance(null);
            return;
        }

        const abortController = new AbortController();
      
        async function getWalletBalance(){
            try {
                setLoading(true);

               const { value: initialLamports } = await rpc.getBalance(walletAddress!).send({abortSignal: abortController.signal});

               const solValue = formatSol(initialLamports);
               setBalance(solValue);
                
               setLoading(false);

               const notifications = await rpcSubscriptions.accountNotifications(walletAddress!, { commitment: "confirmed", encoding: "base64" }).subscribe({abortSignal: abortController.signal});

               for await (const notification of notifications) {
                console.log("Live lamports:", notification.value.lamports);
                setBalance(formatSol(notification.value.lamports));
               }
            }
            catch (error) {
                if(!abortController.signal.aborted) {
                    console.error("Error fetching balance:", error);
                    setLoading(false);
                }
            }
            finally {
            setLoading(false);
            }
        }
        getWalletBalance();


        return () => {
            abortController.abort();
        }
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

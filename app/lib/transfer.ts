import fs from "fs";
import { address, appendTransactionMessageInstructions, createKeyPairSignerFromBytes, createSolanaRpc, createSolanaRpcSubscriptions, lamports, pipe, createTransactionMessage, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners } from "@solana/kit"
import { getTransferSolInstruction } from "@solana-program/system";

async function transferSol(){
  const secretBytes = new Uint8Array(JSON.parse(fs.readFileSync("./keypair.json", "utf-8")));
  const sender = await createKeyPairSignerFromBytes(secretBytes);
  const receiver = address("B1rWidC6i32p4ZivZRyNvvBwK4wdfkbcPPT2N7xSMcRZ")

  const rpc = createSolanaRpc("https://api.devnet.solana.com");
  const rpcSubscriptions = createSolanaRpcSubscriptions("wss://api.devnet.solana.com")
  const { value : blockHash } = await rpc.getLatestBlockhash().send();

  const transactionMessage = pipe(createTransactionMessage({version: 0}), (tx) => setTransactionMessageFeePayerSigner(sender, tx), (tx) => setTransactionMessageLifetimeUsingBlockhash(blockHash, tx), (tx) => appendTransactionMessageInstructions([
    getTransferSolInstruction({
      source: sender,
      destination: receiver,
      amount: lamports(BigInt(4_000_000_000))
    })
  ], tx))

  const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
  const confirmation = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions});
  await confirmation(signedTransaction as Parameters<typeof confirmation>[0], {commitment: "confirmed"})

  console.log("Transfer Successful");
  
}
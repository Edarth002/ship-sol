import {
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getSignatureFromTransaction,
  isSolanaError,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED,
  type Address,
  type KeyPairSigner,
  type Lamports,
  type Signature,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";
import fs from "node:fs";
import path from "node:path";

const RPC_URL = "https://api.devnet.solana.com";
const WS_URL = "wss://api.devnet.solana.com";

const rpc = createSolanaRpc(RPC_URL);
const rpcSubscriptions = createSolanaRpcSubscriptions(WS_URL);
const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
  rpc,
  rpcSubscriptions,
});

/** Load a signer from a Solana CLI keypair file (JSON array of 64 bytes). */
async function loadKeypair(filePath: string): Promise<KeyPairSigner> {
  const raw = fs.readFileSync(path.resolve(filePath), "utf8");
  return createKeyPairSignerFromBytes(Uint8Array.from(JSON.parse(raw)));
}

/** Transfer SOL from `sender` to `recipient`. Returns the transaction signature. */
async function transferSol(
  sender: KeyPairSigner,
  recipient: Address,
  amount: Lamports
): Promise<Signature> {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(sender, tx),
    (tx) =>
      appendTransactionMessageInstructions(
        [
          getTransferSolInstruction({
            source: sender,
            destination: recipient,
            amount,
          }),
        ],
        tx
      ),
    // Set the lifetime last so the type stays "blockhash lifetime"
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx)
  );

  const signedTransaction =
    await signTransactionMessageWithSigners(transactionMessage);

  // Narrows the lifetime type to blockhash (required by sendAndConfirmTransaction)
  assertIsTransactionWithBlockhashLifetime(signedTransaction);

  try {
    await sendAndConfirmTransaction(signedTransaction, {
      commitment: "confirmed",
    });
  } catch (e) {
    if (isSolanaError(e, SOLANA_ERROR__BLOCK_HEIGHT_EXCEEDED)) {
      throw new Error("Transaction expired: its blockhash is no longer valid.");
    }
    throw e;
  }

  return getSignatureFromTransaction(signedTransaction);
}

async function main() {
  const signer = await loadKeypair("./keypair.json");
  console.log("Sending from/to:", signer.address);

  // Sending to your own address: recipient = signer.address
  const signature = await transferSol(
    signer,
    signer.address,
    lamports(BigInt(4_000_000_000)) // 4 SOL
  );

  console.log("Transfer confirmed! Signature:", signature);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
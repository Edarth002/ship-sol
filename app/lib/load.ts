import { createKeyPairSignerFromBytes, type KeyPairSigner } from "@solana/kit";
import fs from "node:fs";
import path from "node:path";

export async function loadKeyPairSigner(filePath: string): Promise<KeyPairSigner> {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Keypair file not found at ${resolvedPath}`);
    }
    const keypairBytes = new Uint8Array(JSON.parse(fs.readFileSync(resolvedPath, "utf-8")));

    const keypairSigner = await createKeyPairSignerFromBytes(keypairBytes);
    return keypairSigner;
}

const keypairSigner = await loadKeyPairSigner("./keypair.json");
console.log(`Keypair loaded from ./keypair.json with public key: ${keypairSigner}`);
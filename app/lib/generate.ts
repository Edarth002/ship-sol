import { generateKeyPair } from "@solana/kit";
import fs from "node:fs";

 async function generateAndSaveKeyPair(filePath: string) {

    const keypair = await generateKeyPair(true);

    const pkcs8Bytes = new Uint8Array(
        await crypto.subtle.exportKey("pkcs8", keypair.privateKey)
    );

    const publicKeyBytes = new Uint8Array(
        await crypto.subtle.exportKey("raw", keypair.publicKey)
    );

    const completeBytes = new Uint8Array(64);
    completeBytes.set(pkcs8Bytes.slice(-32), 0);
    completeBytes.set(publicKeyBytes, 32);

    //Writing the complete bytes to a file
    fs.writeFileSync(filePath, JSON.stringify(Array.from(completeBytes)));
    console.log(`Keypair saved to ${filePath}`);
}

async function main() {
    try {
        await generateAndSaveKeyPair("./keypair.json");
    } catch (error) {
        console.error("Error generating and saving keypair:", error);
    }
}

main();
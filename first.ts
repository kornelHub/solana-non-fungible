import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js"
import * as anchor from '@project-serum/anchor'

export function loadWalletKey(): web3.Keypair {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(process.cwd() + "/devnet.json").toString())), // path to file wallet
    );
    return loaded;
}

async function main() {
    console.log("Let's name some tokens");

    const myKeypair = loadWalletKey();
    console.log(myKeypair.publicKey.toBase58());
    const mint = new web3.PublicKey("CF6Z1uiRuxqjcgyVswAstmMKm7Mi2H2F9hqpagS65dvW")


    const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
    const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint.toBytes());

    const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);


    const accounts = {
        metadata: metadataPDA,
        mint,
        mintAuthority: myKeypair.publicKey,
        payer: myKeypair.publicKey,
        updateAuthority: myKeypair.publicKey,
    }


    const dataV2 = {
        name: "FireCoin",
        symbol: "$FIRE$",
        uri: "https://gateway.pinata.cloud/ipfs/QmZJnNT2PQ2d9CbdBfVagpC1nXoEPpyY5YXxw7wDKadJBK",
        // don't change values below
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    }

    const args = {
        createMetadataAccountArgsV2: {
            data: dataV2,
            isMutable: true
        }
    };

    const ix = mpl.createCreateMetadataAccountV2Instruction(accounts, args);
    const tx = new web3.Transaction();
    tx.add(ix);
    const connection = new web3.Connection("https://api.devnet.solana.com");
    const txid = await web3.sendAndConfirmTransaction(connection, tx, [myKeypair]);
    console.log(txid);
}

main()
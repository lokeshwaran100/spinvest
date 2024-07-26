// import * as anchor from "@project-serum/anchor";
import * as anchor from "@coral-xyz/anchor";
import {
    createAssociatedTokenAccountInstruction,
    createAssociatedTokenAccount,
    getAssociatedTokenAddress,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAccount,
    getMint,
} from "@solana/spl-token";
import { Spinvest } from "../target/types/spinvest";

// Program specific configuration
const USDC_MINT_ADDRESS = "JDGvLdSp6SrdiS6eTXfWnchtwepskr1zeJNM9eneQ4wM";
const TOKEN_MINT_ADDRESS = "5z3AVYtWLbj9XFPhCCJJ3WdS9PMqTTz1oYf5PFg6zgM8";
// Comment the below to run the same on playground
// const pg: any = null;
const isPlayGround: Boolean = pg != null ? true : false;

const programId = getProgramId(isPlayGround);
const connection = getConnection();
const program = getProgram(isPlayGround);
const adminKeypair = getAdminKeypair(isPlayGround) as anchor.web3.Keypair;
const adminPublicKey = adminKeypair.publicKey;

const tokenAddress = new anchor.web3.PublicKey(TOKEN_MINT_ADDRESS);
const usdcAddress = new anchor.web3.PublicKey(USDC_MINT_ADDRESS);

// const userKeypair = adminKeypair;

// const userKeypair = anchor.web3.Keypair.generate();
// console.log(Object.values(userKeypair.secretKey));
const userKeypair = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from([
        148, 157, 173, 140, 121, 72, 173, 25, 120, 223, 166, 62, 188, 255, 140, 181,
        229, 95, 137, 143, 77, 102, 155, 41, 155, 165, 5, 112, 27, 210, 236, 205,
        101, 163, 160, 196, 162, 101, 96, 114, 229, 195, 100, 142, 184, 73, 162,
        218, 238, 5, 89, 91, 190, 76, 153, 196, 39, 10, 40, 79, 243, 202, 46, 198,
    ])
);
const userPublicKey = userKeypair.publicKey;

const userTokenAccount = await getCustomTokenAccount(userPublicKey);
const userUsdcAccount = await getUsdcTokenAccount(userPublicKey);
const SPINVEST_PDA_SEED = "spinvesttest04";
const USER_PDA_SEED = "spinvestusertest04";

const [_spinvestPda, spinvestBump] =
    anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(SPINVEST_PDA_SEED)],
        programId
    );
const spinvestPublicKey = anchor.web3.PublicKey.createProgramAddressSync(
    [Buffer.from(SPINVEST_PDA_SEED), Buffer.from([spinvestBump])],
    programId
);

const [_UserPda, userBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(USER_PDA_SEED)],
    programId
);
const userPdaAccount = anchor.web3.PublicKey.createProgramAddressSync(
    [Buffer.from(USER_PDA_SEED), Buffer.from([userBump])],
    programId
);
const spinvestUsdcAccount = await getPdaUsdcAccount(spinvestPublicKey);

console.log("Contract Address         : " + programId);
console.log("Admin Wallet Address     : " + adminPublicKey.toString());
console.log("Token Mint Address       : " + tokenAddress);
console.log("USDC Mint Address        : " + usdcAddress);

console.log("User Wallet Address      : " + userPublicKey.toString());
console.log("User PDA Account         : " + userPdaAccount.toString());
console.log("User Token Account       : " + userTokenAccount.toString());
console.log("User USDC Account        : " + userUsdcAccount.toString());

console.log("Spinvest PDA Account     : " + spinvestPublicKey.toString());
console.log("Spinvest USDC Account    : " + spinvestUsdcAccount.toString());

// await displayPda();
// await initialize_payment();
// await displayPda();
// await register();
await displayPda();
await submit_purchase();
await displayPda();
await stake();
await displayPda();
await submit_purchase();
await displayPda();
await unstake();
await displayPda();
await submit_purchase();
await displayPda();

async function initialize_payment() {
    await program.rpc.initialize({
        accounts: {
            spinvestAccount: spinvestPublicKey,
            adminAccount: adminPublicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
    });
}

async function register() {
    await program.rpc.register({
        accounts: {
            userPdaAccount: userPdaAccount,
            userAccount: userPublicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [userKeypair],
    });
}

async function submit_purchase() {
    await program.rpc.submitPurchase(new anchor.BN(1000), {
        accounts: {
            spinvestAccount: spinvestPublicKey,
            userAccount: userPublicKey,
            userPdaAccount: userPdaAccount,
            userTokenAccount: userTokenAccount,
            tokenMint: tokenAddress,
            adminAccount: adminPublicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [userKeypair],
    });
}

async function stake() {
    await program.rpc.stake(new anchor.BN(2000), {
        accounts: {
            spinvestAccount: spinvestPublicKey,
            userPdaAccount: userPdaAccount,
            userAccount: userPublicKey,
            userUsdcAccount: userUsdcAccount,
            spinvestUsdcAccount: spinvestUsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [userKeypair],
    });
}

async function unstake() {
    await program.rpc.unstake(new anchor.BN(1000), {
        accounts: {
            spinvestAccount: spinvestPublicKey,
            userPdaAccount: userPdaAccount,
            userAccount: userPublicKey,
            userUsdcAccount: userUsdcAccount,
            spinvestUsdcAccount: spinvestUsdcAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            adminAccount: adminPublicKey,
        },
        signers: [userKeypair],
    });
}

async function getTokenAccount(
    addr: anchor.web3.PublicKey,
    mint_address: string
) {
    const TOKEN_MINT = new anchor.web3.PublicKey(mint_address);
    const tokenList = await connection.getTokenAccountsByOwner(
        new anchor.web3.PublicKey(addr),
        { mint: TOKEN_MINT }
    );

    let paymentTokenAccount = null;
    if (tokenList.value.length > 0) {
        const usdcTokenAccount = tokenList.value[0];
        paymentTokenAccount = usdcTokenAccount.pubkey;
    } else {
        // Create associated token accounts for the new accounts
        paymentTokenAccount = await createAssociatedTokenAccount(
            program.provider.connection,
            adminKeypair,
            TOKEN_MINT,
            addr
        );
    }
    return paymentTokenAccount;
}

function getConnection() {
    const connection = new anchor.web3.Connection(
        "https://api.devnet.solana.com",
        "confirmed"
    );
    return connection;
}

function getProgram(playGround: Boolean = false) {
    if (!playGround) {
        const provider = anchor.AnchorProvider.env();
        anchor.setProvider(provider);
        const program = anchor.workspace.Spinvest as anchor.Program<Spinvest>;
        return program;
    } else {
        return pg.program;
    }
}

function getAdminKeypair(playGround: Boolean = false) {
    if (!playGround) {
        const provider = anchor.AnchorProvider.env();
        anchor.setProvider(provider);
        return provider.wallet;
    } else {
        return pg.wallet.keypair;
    }
}

function getProgramId(playGround: Boolean = false) {
    if (!playGround) {
        const PROGRAM_ID = new anchor.web3.PublicKey(
            "62hQ5gqobREUgYGD6hktcjV6zVraYysAp6NUqghn5H2a"
        );
        return PROGRAM_ID;
    } else {
        return pg.program.programId;
    }
}

async function getUsdcTokenAccount(addr: anchor.web3.PublicKey) {
    return getTokenAccount(addr, USDC_MINT_ADDRESS);
}

async function getCustomTokenAccount(addr: anchor.web3.PublicKey) {
    return getTokenAccount(addr, TOKEN_MINT_ADDRESS);
}

async function getPdaUsdcAccount(pda: anchor.web3.PublicKey) {
    const tokenList = await connection.getTokenAccountsByOwner(
        new anchor.web3.PublicKey(pda),
        { mint: usdcAddress }
    );

    let ata = null;
    if (tokenList.value.length > 0) {
        const usdcTokenAccount = tokenList.value[0];
        ata = usdcTokenAccount.pubkey;
    } else {
        ata = await getAssociatedTokenAddress(
            usdcAddress, // Token Mint
            pda, // Owner (PDA in this case)
            true, // Allow owner off curve (because PDA is off curve)
            TOKEN_PROGRAM_ID, // Token Program ID
            ASSOCIATED_TOKEN_PROGRAM_ID // Associated Token Program ID
        );

        // Create the associated token account transaction
        const transaction = new anchor.web3.Transaction().add(
            createAssociatedTokenAccountInstruction(
                adminPublicKey,
                ata,
                pda,
                usdcAddress,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );

        await anchor.web3.sendAndConfirmTransaction(connection, transaction, [
            adminKeypair,
        ]);
    }

    return ata;
}

async function displayPda() {
    const spinvest = await program.account.spinvest.fetch(spinvestPublicKey);
    const admin = spinvest.admin.toString();
    const usdcBalance = spinvest.admin.toString();
    const actualUsdcBalance = await getTokenBalanceSpl(spinvestUsdcAccount);
    console.log(
        `Spinvest(admin="${admin}", usdcBalance="${usdcBalance}") => (actualUsdcBalance="${actualUsdcBalance}")`
    );

    const userData = await program.account.userData.fetch(userPdaAccount);
    const stakedAmount = userData.stakedAmount.toString();
    const userActualUsdcBalance = await getTokenBalanceSpl(userUsdcAccount);
    const usertokenBalance = await getTokenBalanceSpl(userTokenAccount);
    console.log(
        `UserData(stakedAmount="${stakedAmount}") => (userActualUsdcBalance="${userActualUsdcBalance}", usertokenBalance="${usertokenBalance}")`
    );
}

async function getTokenBalanceSpl(tokenAccount) {
    const info = await getAccount(connection, tokenAccount);
    const amount = Number(info.amount);
    const mint = await getMint(connection, info.mint);
    const balance = amount / 10 ** mint.decimals;
    return balance;
}

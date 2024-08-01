import * as anchor from '@project-serum/anchor';
// import {decodeBase58 } from '@solana/web3.js';
// const { decodeBase58 } = require('@solana/web3.js');
import {
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccount,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction
} from "@solana/spl-token";

const bs58 = require('bs58');

function getAdminKeypair() {
    const adminPrivateKey = new Buffer(process.env.REACT_APP_KEY as string, 'base64').toString('ascii');
    // const adminPrivateKey = process.env.REACT_APP_KEY as string
    return anchor.web3.Keypair.fromSecretKey(bs58.decode(adminPrivateKey));
}

function getSpinvestPdaSeed() {
    return process.env.REACT_APP_SPINVEST_SEED as string;
}

function getUserPdaSeed() {
    return process.env.REACT_APP_USER_SEED as string;
}

function getProgramId() {
    return new anchor.web3.PublicKey(process.env.REACT_APP_CONTRACT_ADDRESS as string);
}

function getProjectTokenAddress() {
    return new anchor.web3.PublicKey(process.env.REACT_APP_PROJ_TOKEN_ADDRESS as string);
}

function getUsdcTokenAddress() {
    return new anchor.web3.PublicKey(process.env.REACT_APP_USDC_TOKEN_ADDRESS as string);
}

async function getUsdcTokenAccount(
    program: anchor.Program,
    addr: anchor.web3.PublicKey) {
    return await getTokenAccount(
        program,
        addr,
        getUsdcTokenAddress());
}

async function getProjectTokenAccount(
    program: anchor.Program,
    addr: anchor.web3.PublicKey) {
    return await getTokenAccount(
        program,
        addr,
        getProjectTokenAddress());
}

async function getTokenAccount(
    program: anchor.Program,
    addr: anchor.web3.PublicKey,
    tokenMint: anchor.web3.PublicKey
) {
    const adminKeypair = getAdminKeypair();
    const tokenList = await program.provider.connection.getTokenAccountsByOwner(
        new anchor.web3.PublicKey(addr),
        { mint: tokenMint }
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
            tokenMint,
            addr
        );
    }
    return paymentTokenAccount;
}

async function getPdaUsdcAccount(
    program: anchor.Program,
    pda: anchor.web3.PublicKey) {
    return getPdaTokenAccount(
        program,
        pda,
        getUsdcTokenAddress()
    );
}

async function getPdaTokenAccount(
    program: anchor.Program,
    pda: anchor.web3.PublicKey,
    tokenMint: anchor.web3.PublicKey) {
    const adminKeypair = getAdminKeypair();
    const adminPublicKey = adminKeypair.publicKey;
    const tokenList = await program.provider.connection.getTokenAccountsByOwner(
        new anchor.web3.PublicKey(pda),
        { mint: tokenMint }
    );

    let ata = null;
    if (tokenList.value.length > 0) {
        const usdcTokenAccount = tokenList.value[0];
        ata = usdcTokenAccount.pubkey;
    } else {
        ata = await getAssociatedTokenAddress(
            tokenMint, // Token Mint
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
                tokenMint,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            )
        );

        await anchor.web3.sendAndConfirmTransaction(program.provider.connection, transaction, [
            adminKeypair,
        ]);
    }

    return ata;
}

function getSpinvestPdaAccount() {
    const programId = getProgramId();
    const seed = getSpinvestPdaSeed();
    const [_Pda, bump] =
        anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(seed)],
            programId
        );
    const pdaPublicKey = anchor.web3.PublicKey.createProgramAddressSync(
        [Buffer.from(seed), Buffer.from([bump])],
        programId
    );
    return pdaPublicKey;
}

function getUserPdaAccount(
    seed: string,
    userPublicKey: anchor.web3.PublicKey
) {
    const programId = getProgramId();
    const [_Pda, bump] =
        anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(seed)],
            programId
        );
    const pdaPublicKey = anchor.web3.PublicKey.createProgramAddressSync(
        [Buffer.from(seed), Buffer.from([bump])],
        programId
    );
    return pdaPublicKey;
}


export async function register(
    program: anchor.Program,
    userPublicKey: anchor.web3.PublicKey) {
    const userPdaAccount = getUserPdaAccount(getUserPdaSeed(), userPublicKey);

    try {
        /* interact with the program via rpc */
        await program.rpc.register({
            accounts: {
                userPdaAccount: userPdaAccount,
                userAccount: userPublicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            // signers: [provider.wallet.]
        });

        const userData = await program.account.userData.fetch(userPdaAccount);
        console.log("userData: ", userData);
    } catch (err) {
        console.error("Transaction Failed: ", err);
    }
}

export async function submitPurchase(
    program: anchor.Program,
    userPublicKey: anchor.web3.PublicKey,
    amount: number) {

    const adminKeypair = getAdminKeypair();
    const adminPublicKey = adminKeypair.publicKey;
    const tokenAddress = getProjectTokenAddress();
    const spinvestPublicKey = getSpinvestPdaAccount();
    const userPdaAccount = getUserPdaAccount(getUserPdaSeed(), userPublicKey);
    const userTokenAccount = await getProjectTokenAccount(program, userPublicKey);

    try {
        /* interact with the program via rpc */
        await program.rpc.submitPurchase(new anchor.BN(amount), {
            accounts: {
                spinvestAccount: spinvestPublicKey,
                userAccount: userPublicKey,
                userPdaAccount: userPdaAccount,
                userTokenAccount: userTokenAccount,
                tokenMint: tokenAddress,
                adminAccount: adminPublicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
            },
            signers: [adminKeypair]
        });

        const userData = await program.account.userData.fetch(userPdaAccount);
        console.log("userData: ", userData);
    } catch (err) {
        console.error("Transaction Failed: ", err);
    }
}

export async function stake(
    program: anchor.Program,
    userPublicKey: anchor.web3.PublicKey,
    amount: number) {

    const spinvestPublicKey = getSpinvestPdaAccount();
    const userPdaAccount = getUserPdaAccount(getUserPdaSeed(), userPublicKey);
    const userUsdcAccount = await getUsdcTokenAccount(program, userPublicKey);
    const spinvestUsdcAccount = await getPdaUsdcAccount(program, spinvestPublicKey);

    try {
        /* interact with the program via rpc */
        await program.rpc.stake(new anchor.BN(amount), {
            accounts: {
                spinvestAccount: spinvestPublicKey,
                userPdaAccount: userPdaAccount,
                userAccount: userPublicKey,
                userUsdcAccount: userUsdcAccount,
                spinvestUsdcAccount: spinvestUsdcAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
            },
        });

        const userData = await program.account.userData.fetch(userPdaAccount);
        console.log("userData: ", userData);
    } catch (err) {
        console.error("Transaction Failed: ", err);
    }
}

export async function unstake(
    program: anchor.Program,
    userPublicKey: anchor.web3.PublicKey,
    amount: number) {

    const adminKeypair = getAdminKeypair();
    const adminPublicKey = adminKeypair.publicKey;
    const spinvestPublicKey = getSpinvestPdaAccount();
    const userPdaAccount = getUserPdaAccount(getUserPdaSeed(), userPublicKey);
    const userUsdcAccount = await getUsdcTokenAccount(program, userPublicKey);
    const spinvestUsdcAccount = await getPdaUsdcAccount(program, spinvestPublicKey);

    try {
        /* interact with the program via rpc */
        await program.rpc.unstake(new anchor.BN(amount), {
            accounts: {
                spinvestAccount: spinvestPublicKey,
                userPdaAccount: userPdaAccount,
                userAccount: userPublicKey,
                userUsdcAccount: userUsdcAccount,
                spinvestUsdcAccount: spinvestUsdcAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
                adminAccount: adminPublicKey,
            },
            signers: [adminKeypair]
        });

        const userData = await program.account.userData.fetch(userPdaAccount);
        console.log("userData: ", userData);
    } catch (err) {
        console.error("Transaction Failed: ", err);
    }
}
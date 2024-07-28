import * as anchor from '@project-serum/anchor';

const SPINVEST_PDA_SEED = "spinvesttest05";
const USER_PDA_SEED = "spinvestusertest05";

function getProgramId(playGround: Boolean = false) {
    const PROGRAM_ID = new anchor.web3.PublicKey(
        "FRsx4yExdH2QPpQW8NL2ks6ngPec4J8XVKNwk84VEBz3"
    );
    return PROGRAM_ID;
}

export async function register(
    program: anchor.Program,
    userPublicKey: anchor.web3.PublicKey) {
    // if (!provider) {
    //     console.error("Provider is not defined");
    //     return;
    // }

    const programId = getProgramId();

    const [_UserPda, userBump] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(USER_PDA_SEED)],
        programId
    );
    const userPdaAccount = anchor.web3.PublicKey.createProgramAddressSync(
        [Buffer.from(USER_PDA_SEED), Buffer.from([userBump])],
        programId
    );

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
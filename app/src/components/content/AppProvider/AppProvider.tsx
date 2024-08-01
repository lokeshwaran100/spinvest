import {
    useState, useEffect, FC, ReactNode, createContext, useContext
} from 'react';
import * as anchor from '@project-serum/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import idl from '../../../idl.json';

interface AppContextProps {
    provider: anchor.AnchorProvider | null;
    program: anchor.Program | null;
    userPublicKey: anchor.web3.PublicKey | null;
}

// Initial context value
const initialContext: AppContextProps = {
    provider: null,
    program: null,
    userPublicKey: null,
};

const AppContext = createContext<AppContextProps>(initialContext);

const getConnection = () => {
    const connection = new anchor.web3.Connection(
        "https://api.devnet.solana.com",
        "confirmed"
    );
    return connection;
};

const getProgramId = () => {
    const PROGRAM_ID = new anchor.web3.PublicKey(
        "FRsx4yExdH2QPpQW8NL2ks6ngPec4J8XVKNwk84VEBz3"
    );
    return PROGRAM_ID;
};

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const wallet = useAnchorWallet();

    const [provider, setProvider] = useState<anchor.AnchorProvider | null>(null);
    const [program, setProgram] = useState<anchor.Program | null>(null);
    const [userPublicKey, setUserPublicKey] = useState<anchor.web3.PublicKey | null>(null);

    useEffect(() => {
        if (!wallet) {
            return;
        }
        const connection = getConnection();
        const provider = new anchor.AnchorProvider(
            connection, wallet, { preflightCommitment: "processed" }
        );
        setProvider(provider);

        const programId = getProgramId();
        const program = new anchor.Program(
            JSON.parse(JSON.stringify(idl)),
            programId,
            provider
        );
        setProgram(program);

        setUserPublicKey(provider.wallet.publicKey);
    }, [wallet]);

    return (
        <AppContext.Provider value={{ provider, program, userPublicKey }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);

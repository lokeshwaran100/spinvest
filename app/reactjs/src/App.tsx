import { FC, ReactNode, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  // BackpackWalletAdapter,
  // BraveWalletAdapter,
  CloverWalletAdapter,
  CoinbaseWalletAdapter,
  // ExodusWalletAdapter,
  // GlowWalletAdapter,
  HuobiWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  // SlopeWalletAdapter,
  // SolletWalletAdapter,
  SolongWalletAdapter,
  TorusWalletAdapter,
  TrustWalletAdapter,
  UnsafeBurnerWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from '@solana/web3.js';
import { AppProvider } from './components/content/AppProvider/AppProvider';
import { HomePage } from './components/content/HomePage/HomePage';
import { Header } from './components/header';
import { Footer } from './components/footer';
import { NotFound } from './components/content/NotFound/NotFound';
import ReportsPage from './components/content/ReportsPage/ReportsPage';

require('./App.css');
require('@solana/wallet-adapter-react-ui/styles.css');

const App: FC = () => {

  return (
    <Context>
      <AppProvider>
        <Router>
          <Content />
        </Router>
      </AppProvider>
    </Context>
  );
};
export default App;

const Context: FC<{ children: ReactNode }> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // new SlopeWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      // new BackpackWalletAdapter(),
      // new BraveWalletAdapter(),
      new CloverWalletAdapter(),
      new CoinbaseWalletAdapter(),
      // new ExodusWalletAdapter(),
      // new GlowWalletAdapter(),
      new HuobiWalletAdapter(),
      // new SolletWalletAdapter(),
      new SolongWalletAdapter(),
      new TrustWalletAdapter(),
      new UnsafeBurnerWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const Content: FC = () => {
  return (
    <div className="App">

      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
};
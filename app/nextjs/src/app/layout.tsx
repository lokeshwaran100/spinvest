'use client';
import { Inter } from "next/font/google";
import React, { useMemo } from 'react';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
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
  TrustWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from '@solana/web3.js';

import { AppProvider } from '@/components/content/AppProvider/AppProvider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

import "@solana/wallet-adapter-react-ui/styles.css";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Context>
          <AppProvider>
            <Content children={children} />
          </AppProvider>
        </Context>
      </body>
    </html >
  );
}

export const Context: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

export const Content: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="App">

      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Header />
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
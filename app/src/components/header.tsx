import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAppContext } from "./content/AppProvider/AppProvider";

export const Header = () => {
  return (
    <header role="banner" className="bg-gray-800 text-white">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <span role="img" title="Logo" className="text-2xl">🌐</span>
          <h3 className="text-xl font-bold">Spinvest</h3>
        </div>

        {/* Navigation Section */}
        <div className="flex items-center space-x-4">
          <nav role="navigation" className="flex space-x-4">
            <a href="/home" className="hover:text-gray-400">Home</a>
            <a href="/report" className="hover:text-gray-400">Report</a>
          </nav>
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
};

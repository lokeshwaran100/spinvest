import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAppContext } from "./content/AppProvider/AppProvider";

export const Header = () => {
  return (
    <header role="banner">
      <div>
        <div>
          <span
            role="img"
            title="Logo"
          />
          <h1>
            App Name
          </h1>
        </div>
        <div>
          <div role="navigation">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// Define the interface for the component props
interface StakeUsdcDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const StakeUsdcDialog = ({ isOpen, onClose }: StakeUsdcDialogProps) => {
    const [amount, setAmount] = useState('');
    const { publicKey, signTransaction } = useWallet();

    const handleStake = async () => {
        // Add logic for staking USDC
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Stake USDC</h2>
                <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border border-gray-300 p-2 rounded w-full mb-4"
                />
                <div className="flex justify-end space-x-4">
                    <button
                        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        onClick={handleStake}
                    >
                        Stake
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StakeUsdcDialog;

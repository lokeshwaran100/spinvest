import React, { useState } from 'react';
import StakeUsdcDialog from '../StakeDialog/StakeDialog';
import UnstakeUsdcDialog from '../UnstakeDialog/UnstakeDialog';

export function HomePage() {
    const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false);
    const [isUnstakeDialogOpen, setIsUnstakeDialogOpen] = useState(false);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Spinvest Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold">Rewards Earned</h2>
                    <p>0 SPINVEST</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold">USDC Staked</h2>
                    <p>0 USDC</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold">USDC Invested</h2>
                    <p>0 USDC</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold">SOL Bought</h2>
                    <p>0 SOL</p>
                </div>
            </div>
            <div className="flex flex-col items-center space-y-4">
                <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    onClick={() => { }}
                >
                    Upload Spend Bill
                </button>
                <div className="flex space-x-4">
                    <button
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                        onClick={() => setIsStakeDialogOpen(true)}
                    >
                        Stake USDC
                    </button>
                    <button
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                        onClick={() => setIsUnstakeDialogOpen(true)}
                    >
                        Unstake USDC
                    </button>
                </div>
            </div>
            <StakeUsdcDialog isOpen={isStakeDialogOpen} onClose={() => setIsStakeDialogOpen(false)} />
            <UnstakeUsdcDialog isOpen={isUnstakeDialogOpen} onClose={() => setIsUnstakeDialogOpen(false)} />
        </div>
    );
}

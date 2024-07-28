// import { Link } from 'react-router-dom';

export function HomePage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Spinvest Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold">Rewards Earned</h2>
                    <p>0 SPL Tokens</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold">Total USDC Staked</h2>
                    <p>0 USDC</p>
                </div>
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold">Total Invested</h2>
                    <p>0 SOL</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                    Upload Receipt
                </button>
                <a href="/stake">
                    <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
                        Stake USDC
                    </button>
                </a>
            </div>
        </div>
    );
};

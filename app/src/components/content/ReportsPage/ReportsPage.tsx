import React from 'react';

const ReportsPage = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Investment Reports</h1>
            <table className="min-w-full bg-white">
                <thead>
                    <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Purchase Amount</th>
                        <th className="py-3 px-6 text-left">Invested in SOL</th>
                        <th className="py-3 px-6 text-left">Current Value</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                    <tr className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="py-3 px-6">Purchase: $100</td>
                        <td className="py-3 px-6">0.25 SOL</td>
                        <td className="py-3 px-6">$150</td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="py-3 px-6">Purchase: $50</td>
                        <td className="py-3 px-6">0.125 SOL</td>
                        <td className="py-3 px-6">$75</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ReportsPage;

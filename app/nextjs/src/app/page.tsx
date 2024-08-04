'use client';
import { useEffect, useState } from "react";
import { useAppContext } from "@/components/content/AppProvider/AppProvider";
import StakeUsdcDialog from "@/components/content/StakeDialog/StakeDialog";
import UnstakeUsdcDialog from "@/components/content/UnstakeDialog/UnstakeDialog";
import { submitPurchase } from "@/components/content/utils/apiRequests";
import axios from "axios";

const Home = () => {
  const { program, userPublicKey } = useAppContext();

  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false);
  const [isUnstakeDialogOpen, setIsUnstakeDialogOpen] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [users, setUsers] = useState([]);
  // const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState(100);

  const handleBillUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (program && userPublicKey) {

        await submitPurchase(program, userPublicKey, amount);

        const response = await axios.post('/api/purchases', {
          userId: userPublicKey,
          amount: Number(amount),
        });

        if (response.status === 201) {
          console.log('Purchase added successfully');
          setAmount(0);
        } else {
          console.error('Failed to add purchase');
        }
      }
    } catch (error) {
      console.error('Failed to add purchase', error);
    }
  };

  useEffect(() => {
    const fetchPurchases = async () => {
      const response = await axios.get('/api/purchases');
      setPurchases(response.data.data);
    };

    const fetchUsers = async () => {
      const response = await axios.get('/api/users');
      setUsers(response.data.data);
    };

    fetchPurchases();
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
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
          onClick={handleBillUpload}
        >
          Upload Spent Bill
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
    </div >
  );
}

export default Home;
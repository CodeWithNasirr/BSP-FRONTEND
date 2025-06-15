import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { toast } from 'react-toastify';

const Wallet = () => {
  const token = localStorage.getItem("authToken");
  const [balance, setBalance] = useState(0);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPagination, setTransactionPagination] = useState({ next: null, previous: null, count: 0 });
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const user_email = userInfo.email || '';
  const user_name = userInfo.username || '';
  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/balance/`, {
        headers:{
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setBalance(response.data.balance || 0);
    } catch (error) {
      toast.error("Failed to fetch wallet balance");
    }
  };

  // Fetch wallet transaction history
  const fetchWalletHistory = async (pageNum) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/history/?page=${pageNum}`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = response.data;
      setTransactions(data.results || []);
      setTransactionPagination({
        next: data.next,
        previous: data.previous,
        count: data.count,
      });
    } catch (error) {
      toast.error("Failed to fetch wallet history");
    }
  };

  // Load balance and history on mount and when page changes
  useEffect(() => {
    fetchWalletBalance();
    fetchWalletHistory(transactionPage);
  }, [transactionPage]);

  // Handle top-up with Razorpay
  const handleTopUp = async () => {
    if (!topUpAmount || topUpAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
 
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/wallet/create-order/`,
        { amount: topUpAmount }, 
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { order_id, amount, currency, razorpay_key_id } = response.data;

      const options = {
        key: razorpay_key_id,
        amount: amount,
        currency: currency,
        name: "WhatsAppGPTx",
        description: "Wallet Top-Up",
        order_id: order_id,
        handler: async (response) => {
          const verifyResponse = await axios.post(
            `${API_BASE_URL}/api/wallet/verify-payment/`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            {
              headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          // console.log(verifyResponse.data)

          if (verifyResponse.data.status === 'success') {
            toast.success("Wallet topped up successfully!");
            setBalance(verifyResponse.data.new_balance);
            setTopUpAmount('');
            fetchWalletHistory(transactionPage); // Refresh history after top-up
          } else {
            console.log(verifyResponse.data.error)
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user_name,
          email: user_email,
         
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Wallet Balance and Top-Up Section */}
      <div className="mb-8"> 
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800">Wallet Balance</h2>
            <p className="text-4xl font-bold text-green-600 mt-2">₹{balance.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">Available for campaigns</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Top Up Wallet</h3>
            <div className="flex space-x-2">
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount (₹)"
                className="w-40 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <button
                onClick={handleTopUp}
                disabled={loading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 ${
                  loading ? 'cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Processing...' : 'Add Funds'}
              </button>
            </div>
            <div className="flex justify-end space-x-2 mt-2">
              {[500, 1000, 2000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(amount.toString())}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700 text-sm"
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Transaction History Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Transaction History</h3>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-sm font-medium text-gray-700">Date</th>
                  <th className="p-3 text-sm font-medium text-gray-700">Type</th>
                  <th className="p-3 text-sm font-medium text-gray-700">Amount</th>
                  <th className="p-3 text-sm font-medium text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transaction.transaction_type === 'CREDIT'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      ₹{Math.abs(transaction.amount).toFixed(2)}
                      {transaction.transaction_type === 'DEBIT' ? ' (Deducted)' : ' (Added)'}
                    </td>
                    <td className="p-3 text-sm text-gray-600">{transaction.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setTransactionPage((prev) => Math.max(prev - 1, 1))}
                disabled={!transactionPagination.previous}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {transactionPage} of {Math.ceil(transactionPagination.count / 10)}
              </span>
              <button
                onClick={() => setTransactionPage((prev) => prev + 1)}
                disabled={!transactionPagination.next}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No transactions yet.</p>
        )}
      </div>
    </div>
  );
};

export default Wallet;
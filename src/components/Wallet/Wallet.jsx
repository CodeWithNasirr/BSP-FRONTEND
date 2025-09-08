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
    <div className="w-full sm:max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      {/* Wallet Balance and Top-Up Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div className="text-center">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
              Credits Balance
            </h2>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mt-1 sm:mt-2">
              {balance.toFixed(2)}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Available for campaigns
            </p>
          </div>
          <div className="text-center sm:text-right">
            <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">
              Top Up Credits
            </h3>
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 items-center">
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount (₹)"
                className="w-full sm:w-32 p-1.5 sm:p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                min="1"
              />
              <button
                onClick={handleTopUp}
                disabled={loading}
                className={`w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 ${
                  loading ? 'cursor-not-allowed' : ''
                } text-xs sm:text-sm`}
              >
                {loading ? 'Processing...' : 'Add Funds'}
              </button>
            </div>
            <div className="flex justify-center sm:justify-end space-x-2 mt-2">
              {[500, 1000, 2000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(amount.toString())}
                  className="px-2 sm:px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700 text-xs"
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
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
          Transaction History
        </h3>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-gray-700">
                    Date
                  </th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-gray-700">
                    Type
                  </th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-gray-700">
                    Credits
                  </th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-gray-700">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50 flex flex-col sm:table-row">
                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-600 sm:table-cell">
                      <span className="sm:hidden font-medium">Date: </span>
                      {new Date(transaction.timestamp).toLocaleString()}
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm sm:table-cell">
                      <span className="sm:hidden font-medium">Type: </span>
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
                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-600 sm:table-cell">
                      <span className="sm:hidden font-medium">Credits: </span>
                      {Math.abs(transaction.amount).toFixed(2)}
                      {transaction.transaction_type === 'DEBIT' ? ' (Deducted)' : ' (Added)'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-600 sm:table-cell">
                      <span className="sm:hidden font-medium">Description: </span>
                      {transaction.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-3 sm:mt-4 space-y-2 sm:space-y-0">
              <button
                onClick={() => setTransactionPage((prev) => Math.max(prev - 1, 1))}
                disabled={!transactionPagination.previous}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 rounded text-xs sm:text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs sm:text-sm">
                Page {transactionPage} of {Math.ceil(transactionPagination.count / 10)}
              </span>
              <button
                onClick={() => setTransactionPage((prev) => prev + 1)}
                disabled={!transactionPagination.next}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 rounded text-xs sm:text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-xs sm:text-sm text-gray-500">No transactions yet.</p>
        )}
      </div>
    </div>
  );
};

export default Wallet;
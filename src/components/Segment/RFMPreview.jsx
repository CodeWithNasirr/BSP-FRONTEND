
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
const RFMPreview = ({ toast, setToast }) => {
  const [rfmData, setRFMData] = useState({
    full_name: '',
    last_purchase_date: '',
    total_purchases: '',
    total_spent: '',
  });
  const [rfmResult, setRFMResult] = useState(null);

  const handleRFMChange = (e) => {
    const { name, value } = e.target;
    setRFMData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateRFM = (e) => {
    e.preventDefault();
    const { last_purchase_date, total_purchases, total_spent } = rfmData;

    // Validate inputs
    if (!last_purchase_date || !total_purchases || !total_spent) {
      setToast({ message: 'Please fill all fields', type: 'error' });
      return;
    }

    const today = new Date();
    const purchaseDate = new Date(last_purchase_date);
    const daysSincePurchase = Math.floor((today - purchaseDate) / (1000 * 60 * 60 * 24));
    const purchases = parseInt(total_purchases, 10);
    const spent = parseFloat(total_spent);

    // Recency Score
    let r_score;
    if (daysSincePurchase <= 7) r_score = 5;
    else if (daysSincePurchase <= 30) r_score = 4;
    else if (daysSincePurchase <= 60) r_score = 3;
    else if (daysSincePurchase <= 90) r_score = 2;
    else r_score = 1;

    // Frequency Score
    let f_score;
    if (purchases >= 10) f_score = 5;
    else if (purchases >= 5) f_score = 4;
    else if (purchases >= 3) f_score = 3;
    else if (purchases >= 1) f_score = 2;
    else f_score = 1;

    // Monetary Score
    let m_score;
    if (spent >= 10000) m_score = 5;
    else if (spent >= 5000) m_score = 4;
    else if (spent >= 2000) m_score = 3;
    else if (spent >= 500) m_score = 2;
    else m_score = 1;

    // Determine Segment
    let segment;
    if (r_score >= 4 && f_score >= 4 && m_score >= 4) segment = 'Champions';
    else if (r_score <= 2 && f_score >= 4 && m_score >= 4) segment = 'Dormant but High Value';
    else if (r_score >= 4 && f_score <= 2 && m_score <= 2) segment = 'New / Price Sensitive Customers';
    else if (r_score >= 3 && f_score >= 3 && m_score >= 3) segment = 'Loyal Customers';
    else if (m_score >= 4 && f_score <= 2) segment = 'Big Spenders';
    else if (f_score <= 2 && m_score <= 2) segment = 'Discount Lovers';
    else segment = 'Other';

    setRFMResult({
      r_score,
      f_score,
      m_score,
      segment,
      daysSincePurchase,
      purchases,
      spent,
    });
    setToast({ message: 'RFM scores calculated successfully', type: 'success' });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white'
          } sm:max-w-sm w-[calc(100%-2rem)]`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base">{toast.message}</span>
            <button
              onClick={() => setToast({ message: null })}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Preview RFM Segmentation</h1>
        <Link to={"/Segment"}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base transition duration-200"
            >
            Back to Segments
        </Link>
      </div>

      {/* RFM Preview Form */}
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Enter Customer Details to See RFM Segmentation
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Input dummy customer data to visualize how RFM segmentation works. See the scores and assigned segment instantly.
          </p>
        </div>
        <form onSubmit={calculateRFM} className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <input
                type="text"
                name="full_name"
                value={rfmData.full_name}
                onChange={handleRFMChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                placeholder="Enter customer name (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Purchase Date *</label>
              <input
                type="date"
                name="last_purchase_date"
                value={rfmData.last_purchase_date}
                onChange={handleRFMChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Purchases *</label>
              <input
                type="number"
                name="total_purchases"
                value={rfmData.total_purchases}
                onChange={handleRFMChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                placeholder="Enter total purchases"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Spent (₹) *</label>
              <input
                type="number"
                name="total_spent"
                value={rfmData.total_spent}
                onChange={handleRFMChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
                placeholder="Enter total spent"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setRFMData({ full_name: '', last_purchase_date: '', total_purchases: '', total_spent: '' });
                setRFMResult(null);
              }}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm sm:text-base transition duration-200"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base transition duration-200"
            >
              Calculate RFM
            </button>
          </div>
        </form>
        {rfmResult && (
          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2 text-sm sm:text-base">RFM Results</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm sm:text-base text-purple-800">
                  <strong>Recency (R):</strong> {rfmResult.r_score} ({rfmResult.daysSincePurchase} days since last purchase)
                </p>
                <p className="text-sm sm:text-base text-purple-800">
                  <strong>Frequency (F):</strong> {rfmResult.f_score} ({rfmResult.purchases} purchases)
                </p>
                <p className="text-sm sm:text-base text-purple-800">
                  <strong>Monetary (M):</strong> {rfmResult.m_score} (₹{rfmResult.spent.toLocaleString()})
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base text-purple-800">
                  <strong>Assigned Segment:</strong> {rfmResult.segment}
                </p>
                <p className="text-sm text-purple-700 mt-2">
                  {rfmResult.segment === 'Champions' && 'Recent, frequent, and high-spending loyal customer 🏆'}
                  {rfmResult.segment === 'Dormant but High Value' && 'Previously high-value but inactive – send a reminder 😴'}
                  {rfmResult.segment === 'New / Price Sensitive Customers' && 'New customer, low spend – offer a welcome deal 🆕💸'}
                  {rfmResult.segment === 'Loyal Customers' && 'Regular and consistent buyers ❤️'}
                  {rfmResult.segment === 'Big Spenders' && 'Infrequent but high-value purchases 💰'}
                  {rfmResult.segment === 'Discount Lovers' && 'Buys only during sales or with offers 🏷️'}
                  {rfmResult.segment === 'Other' && 'Mixed behavior, not clearly segmented 🌀'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFMPreview;
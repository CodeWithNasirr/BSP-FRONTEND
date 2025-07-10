import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("authToken");
  const [filterStatus, setFilterStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, startDate, endDate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/`, {
        headers: { Authorization: `Token ${token}` },
        params: { 
          status: filterStatus, 
          start_date: startDate || undefined, 
          end_date: endDate || undefined 
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

 const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/orders/${orderId}/`, { status: newStatus },{ headers: { Authorization: `Token ${token}` } },);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/export/`, {
        headers: { Authorization: `Token ${token}` },
        params: { 
          status: filterStatus, 
          start_date: startDate || undefined, 
          end_date: endDate || undefined 
        }
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'orders.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting orders:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Order Management</h1>
        <p className="text-gray-600 mt-1 text-center">Track and manage all customer orders efficiently</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Filter Orders</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <select 
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 transition duration-150"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
                <option value="Delivered">Delivered</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input 
                type="date" 
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 transition duration-150"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input 
                type="date" 
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-600 focus:ring-indigo-600 transition duration-150"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button 
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-150"
              onClick={handleExport}
            >
              Export to CSV
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 max-h-[440px] overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Order Overview</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"> {new Date(order.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{order.username}</div>
                        <div className="text-gray-600">{order.phone_number}</div>
                        <div className="text-gray-600">{order.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <ul className="list-disc list-inside">
                          {order.items.map((item, idx) => <li key={idx}>{item}</li>)}
                        </ul>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${order.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          className={`w-full rounded-lg border-none text-sm font-semibold py-1 px-2 focus:ring-2 focus:ring-indigo-600 transition duration-150 ${
                            order.status === 'Received' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="Received">Received</option>
                          <option value="Pending">Pending</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
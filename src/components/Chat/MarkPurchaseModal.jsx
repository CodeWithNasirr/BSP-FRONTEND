import React from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_BASE_URL from '../../config';
const MarkPurchaseModal = ({
  show,
  onClose,
  contact,
  purchaseForm,
  setPurchaseForm,
  availableTags,
  fetchChatList,
  token,
  loading,
  setLoading,
}) => {
  if (!show || !contact) return null;

  // 🧩 Input Handlers
  const handlePurchaseTagInput = (e) => {
    setPurchaseForm((prev) => ({ ...prev, tagInput: e.target.value }));
  };

  const addPurchaseTag = (tag) => {
    if (tag && !purchaseForm.tags.includes(tag)) {
      setPurchaseForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: '',
      }));
    }
  };

  const removePurchaseTag = (tag) => {
    setPurchaseForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // 🧩 Submit
  const handleMarkPurchase = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/contacts/mark-purchase/`,
        {
          phone_number: contact.recipient,
         full_name: purchaseForm.full_name,
          location: purchaseForm.location,
          amount: purchaseForm.amount,
          tags: purchaseForm.tags,
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      toast.success('Purchase marked successfully');
      onClose();
      // fetchChatList();
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.error || 'Failed to mark purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Mark Purchase for {contact.user_name}
        </h2>
        <form onSubmit={handleMarkPurchase} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              value={contact.recipient}
              disabled
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

            {/* Username */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={purchaseForm.full_name || ""}
              onChange={(e) =>
                setPurchaseForm(prev => ({
                  ...prev,
                  full_name: e.target.value
                }))
              }
              placeholder="Enter customer name"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        


          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={purchaseForm.location}
              onChange={(e) =>
                setPurchaseForm((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="Purchase location"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="amount"
              value={purchaseForm.amount}
              onChange={(e) =>
                setPurchaseForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="Enter Purchase Amount"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md">
              {purchaseForm.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-1 text-sm rounded-full ${
                    contact?.tags?.includes(tag)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removePurchaseTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={purchaseForm.tagInput}
                onChange={handlePurchaseTagInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addPurchaseTag(purchaseForm.tagInput.trim());
                  }
                }}
                placeholder="Add tags (press Enter or comma)"
                className="flex-1 border-none focus:outline-none focus:ring-0 text-sm"
              />
            </div>
            {availableTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {availableTags
                  .filter(
                    (tagObj) =>
                      tagObj.name
                        .toLowerCase()
                        .includes((purchaseForm.tagInput || '').toLowerCase()) &&
                      !purchaseForm.tags.includes(tagObj.name)
                  )
                  .slice(0, 10)
                  .map((tagObj) => (
                    <button
                      key={tagObj.name}
                      type="button"
                      onClick={() => addPurchaseTag(tagObj.name)}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                    >
                      {tagObj.name} ({tagObj.count})
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Mark Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkPurchaseModal;

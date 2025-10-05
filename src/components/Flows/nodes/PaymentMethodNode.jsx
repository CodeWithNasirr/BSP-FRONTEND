import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { CreditCard, Pencil } from 'lucide-react';

const PaymentMethodNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [paymentType, setPaymentType] = useState(data.payment_type || 'upi');
  const [paymentConfiguration, setPaymentConfiguration] = useState(data.payment_configuration || '');
  const [preferredPaymentMethods, setPreferredPaymentMethods] = useState(data.preferred_payment_methods || []);
  const [collectPaymentMethod, setCollectPaymentMethod] = useState(data.collect_payment_method || false);

  const handleSave = () => {
    data.payment_type = paymentType;
    data.payment_configuration = paymentConfiguration;
    data.preferred_payment_methods = preferredPaymentMethods;
    data.collect_payment_method = collectPaymentMethod;
    setEditing(false);
  };

  const handleAddPreferredMethod = (method) => {
    if (!preferredPaymentMethods.includes(method)) {
      setPreferredPaymentMethods([...preferredPaymentMethods, method]);
    }
  };

  const handleRemovePreferredMethod = (method) => {
    setPreferredPaymentMethods(preferredPaymentMethods.filter(m => m !== method));
  };

  return (
    <div className={`px-4 py-3 rounded-lg bg-node-payment border ${selected ? 'border-blue-400' : 'border-blue-200'} min-w-[200px] max-w-[300px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <CreditCard className="mr-2 text-blue-500" size={16} />
          <div className="text-sm font-medium text-blue-800">Payment Method</div>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-blue-500 hover:text-blue-700">
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 mb-2">
          <select
            className="w-full text-xs p-2 border border-blue-200 rounded"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="upi">UPI</option>
            <option value="cash_on_delivery">Cash on Delivery</option>
            <option value="pick_at_store">Pick at Store</option>
          </select>
          <input
            type="text"
            className="w-full text-xs px-2 py-1 border border-blue-200 rounded"
            placeholder="Payment Configuration (e.g., my-upi-config)"
            value={paymentConfiguration}
            onChange={(e) => setPaymentConfiguration(e.target.value)}
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={collectPaymentMethod}
              onChange={(e) => setCollectPaymentMethod(e.target.checked)}
              className="mr-2"
            />
            <span className="text-xs">Collect Payment Method</span>
          </label>
          {collectPaymentMethod && (
            <div className="space-y-1">
              <label className="text-xs">Preferred Payment Methods:</label>
              <div className="flex flex-wrap gap-1">
                {['gpay', 'phonepe', 'paytm', 'amazonpay', 'cred', 'mobikwik'].map(method => (
                  <button
                    key={method}
                    onClick={() => handleAddPreferredMethod(method)}
                    className={`text-xs px-2 py-1 rounded ${preferredPaymentMethods.includes(method) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    disabled={preferredPaymentMethods.includes(method)}
                  >
                    {method}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {preferredPaymentMethods.map(method => (
                  <button
                    key={method}
                    onClick={() => handleRemovePreferredMethod(method)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    {method} ✕
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={handleSave}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <div className="text-xs bg-white p-2 rounded border border-blue-100 text-gray-700 max-h-[80px] overflow-y-auto">
            {`Payment Type: ${paymentType || 'Not set'}`}
            {paymentConfiguration && <div>Config: {paymentConfiguration}</div>}
          </div>
          {collectPaymentMethod && preferredPaymentMethods.length > 0 && (
            <div className="text-xs mt-2 p-1 bg-blue-50 rounded">
              Preferred: {preferredPaymentMethods.join(', ')}
            </div>
          )}
          {collectPaymentMethod && (
            <div className="text-xs mt-2 p-1 bg-blue-50 rounded">
              Collects: Payment Method
            </div>
          )}
        </>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(PaymentMethodNode);
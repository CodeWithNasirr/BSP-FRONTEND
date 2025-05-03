import React from 'react';
import { Clock, Variable } from 'lucide-react';

const WaitNodeEditor = ({ data, onChange }) => {
  const handleTimeoutChange = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    onChange({ ...data, timeout: value });
  };

  const handleVariableChange = (e) => {
    onChange({ ...data, variable: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 p-3 rounded-md">
        <div className="flex items-center text-amber-700 mb-2">
          <Clock size={16} className="mr-2" />
          <span className="font-medium">Wait Timeout (seconds)</span>
        </div>
        <input
          type="number"
          value={data.timeout}
          onChange={handleTimeoutChange}
          min="0"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
        <div className="mt-2 text-xs text-gray-500">
          Maximum time to wait for user response in seconds. Use 0 for unlimited.
        </div>
      </div>

      <div className="bg-amber-50 p-3 rounded-md">
        <div className="flex items-center text-amber-700 mb-2">
          <Variable size={16} className="mr-2" />
          <span className="font-medium">Store Response As</span>
        </div>
        <input
          type="text"
          value={data.variable}
          onChange={handleVariableChange}
          placeholder="userResponse"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
        <div className="mt-2 text-xs text-gray-500">
          Variable name to store the user's response for later use in the flow.
        </div>
      </div>

      <div className="bg-yellow-50 p-3 rounded-md">
        <h4 className="text-sm font-medium text-yellow-700 mb-1">Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Consider short timeouts for better user experience</li>
          <li>• Use descriptive variable names</li>
          <li>• Variables can be used in conditional nodes</li>
        </ul>
      </div>
    </div>
  );
};

export default WaitNodeEditor;
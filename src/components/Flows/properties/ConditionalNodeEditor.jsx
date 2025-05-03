import React from 'react';
import { GitBranch, ArrowRightCircle } from 'lucide-react';

const ConditionalNodeEditor = ({ data, onChange }) => {
  const handleConditionChange = (e) => {
    onChange({ ...data, condition: e.target.value });
  };

  const handleTrueLabelChange = (e) => {
    onChange({ ...data, trueLabel: e.target.value });
  };

  const handleFalseLabelChange = (e) => {
    onChange({ ...data, falseLabel: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 p-3 rounded-md">
        <div className="flex items-center text-indigo-700 mb-2">
          <GitBranch size={16} className="mr-2" />
          <span className="font-medium">Condition Expression</span>
        </div>
        <textarea
          value={data.condition}
          onChange={handleConditionChange}
          placeholder="response == 'yes'"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <div className="mt-2 text-xs text-gray-500">
          Simple JavaScript-like condition that evaluates to true or false.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-3 rounded-md">
          <div className="flex items-center text-green-700 mb-2">
            <ArrowRightCircle size={16} className="mr-2" />
            <span className="font-medium">True Path Label</span>
          </div>
          <input
            type="text"
            value={data.trueLabel}
            onChange={handleTrueLabelChange}
            placeholder="Yes"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>

        <div className="bg-red-50 p-3 rounded-md">
          <div className="flex items-center text-red-700 mb-2">
            <ArrowRightCircle size={16} className="mr-2" />
            <span className="font-medium">False Path Label</span>
          </div>
          <input
            type="text"
            value={data.falseLabel}
            onChange={handleFalseLabelChange}
            placeholder="No"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          />
        </div>
      </div>

      <div className="bg-yellow-50 p-3 rounded-md">
        <h4 className="text-sm font-medium text-yellow-700 mb-1">Examples</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li><code>response == "yes"</code> - Exact match</li>
          <li><code>response.includes("thank")</code> - Contains text</li>
          <li><code>response.length > 10</code> - Length check</li>
          <li><code>response == "1" || response == "one"</code> - Multiple conditions</li>
        </ul>
      </div>
    </div>
  );
};

export default ConditionalNodeEditor;
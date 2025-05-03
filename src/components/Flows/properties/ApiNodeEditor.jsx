import React from 'react';
import { Globe, Code } from 'lucide-react';

const ApiNodeEditor = ({ data, onChange }) => {
  const handleUrlChange = (e) => {
    onChange({ ...data, url: e.target.value });
  };

  const handleMethodChange = (e) => {
    onChange({ ...data, method: e.target.value });
  };

  const handleHeadersChange = (e) => {
    try {
      const headers = JSON.parse(e.target.value);
      onChange({ ...data, headers: headers });
    } catch (error) {
      // Don't update if JSON is invalid
    }
  };

  const handleBodyChange = (e) => {
    onChange({ ...data, body: e.target.value });
  };

  const prettyHeaders = JSON.stringify(data.headers || {}, null, 2);

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 p-3 rounded-md">
        <div className="flex items-center text-purple-700 mb-2">
          <Globe size={16} className="mr-2" />
          <span className="font-medium">API Endpoint URL</span>
        </div>
        <input
          type="text"
          value={data.url}
          onChange={handleUrlChange}
          placeholder="https://api.example.com/endpoint"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      <div className="bg-purple-50 p-3 rounded-md">
        <div className="flex items-center text-purple-700 mb-2">
          <Code size={16} className="mr-2" />
          <span className="font-medium">Request Method</span>
        </div>
        <select
          value={data.method}
          onChange={handleMethodChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>

      {(data.method === 'POST' || data.method === 'PUT' || data.method === 'PATCH') && (
        <div className="bg-purple-50 p-3 rounded-md">
          <div className="flex items-center text-purple-700 mb-2">
            <Code size={16} className="mr-2" />
            <span className="font-medium">Request Body</span>
          </div>
          <textarea
            value={data.body || ''}
            onChange={handleBodyChange}
            placeholder='{"key": "value"}'
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
            rows={4}
          />
        </div>
      )}

      <div className="bg-purple-50 p-3 rounded-md">
        <div className="flex items-center text-purple-700 mb-2">
          <Code size={16} className="mr-2" />
          <span className="font-medium">Headers (JSON)</span>
        </div>
        <textarea
          value={prettyHeaders}
          onChange={handleHeadersChange}
          placeholder='{"Content-Type": "application/json"}'
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono"
          rows={4}
        />
      </div>

      <div className="bg-yellow-50 p-3 rounded-md">
        <h4 className="text-sm font-medium text-yellow-700 mb-1">Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Use variables in URL with {'{variableName}'} syntax</li>
          <li>• Set Content-Type header for POST requests</li>
          <li>• Consider authentication requirements</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiNodeEditor;
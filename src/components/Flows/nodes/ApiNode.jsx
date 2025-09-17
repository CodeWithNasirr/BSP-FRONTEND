import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Globe, Pencil } from 'lucide-react';

const ApiNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [method, setMethod] = useState(data.method || 'GET');
  const [url, setUrl] = useState(data.url || '');
  const [body, setBody] = useState(JSON.stringify(data.body || {}, null, 2));
  const [token, setToken] = useState(data.token || '');

  // ⬅️ On mount, load token from localStorage automatically
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      data.token = storedToken; // store in node data too
    }
  }, []);

  const handleSave = () => {
    data.method = method;
    data.url = url;
    data.token = token;
    try {
      data.body = body ? JSON.parse(body) : {};
    } catch (e) {
      alert('Invalid JSON in body');
      return;
    }
    setEditing(false);
  };

  return (
    <div className={`px-4 py-3 rounded-lg bg-node-api border ${selected ? 'border-purple-400' : 'border-purple-200'} min-w-[200px] max-w-[300px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Globe className="mr-2 text-purple-500" size={16} />
          <div className="text-sm font-medium text-purple-800">API Call</div>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-purple-500 hover:text-purple-700">
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 mb-2">
          <select
            className="w-full text-xs p-2 border border-purple-200 rounded"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input  
            type="text"
            className="w-full text-xs px-2 py-1 border border-purple-200 rounded"
            placeholder="Enter API URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <textarea
            className="w-full text-xs p-2 border border-purple-200 rounded"
            rows={3}
            placeholder="Enter JSON body (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="bg-white p-2 rounded border border-purple-100 mb-2">
          <div className="text-xs font-medium text-purple-700">{method || 'GET'}</div>
          <div className="text-xs text-gray-500 truncate" title={url}>
            {url || 'No URL set'}
          </div>
          {data.body && (
            <div className="text-xs text-gray-400 mt-1 truncate">
              Body: {JSON.stringify(data.body)}
            </div>
          )}
          {token && (
            <div className="text-xs text-gray-400 mt-1 truncate">
              Token: {token.substring(0, 10)}...
            </div>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(ApiNode);

import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Image, Pencil } from 'lucide-react';

const MessageNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(data.message || '');
  const [mediaUrl, setMediaUrl] = useState(data.mediaUrl || '');
  const [collectAddress, setCollectAddress] = useState(data.collect_address || false);
  const [collectLocation, setCollectLocation] = useState(data.collect_location || false);
  const [centerLat, setCenterLat] = useState(data.center_lat || '');
  const [centerLon, setCenterLon] = useState(data.center_lon || '');
  const [radius, setRadius] = useState(data.radius || '5');
  const [collectInput, setCollectInput] = useState(data.collect_input || false);
  const [inputKey, setInputKey] = useState(data.input_key || '');
 
  const handleSave = () => {
    data.message = message;
    data.mediaUrl = mediaUrl;
    data.collect_address = collectAddress;
    data.collect_location = collectLocation;
    if (collectLocation) {
      data.center_lat = centerLat;
      data.center_lon = centerLon;
      data.radius = radius;
    }
    data.collect_input = collectInput;
    data.input_key = collectInput ? inputKey : '';
    setEditing(false);
  }; 

  return (
    <div className={`px-4 py-3 rounded-lg bg-node-message border ${selected ? 'border-blue-400' : 'border-blue-200'} min-w-[200px] max-w-[300px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <MessageSquare className="mr-2 text-blue-500" size={16} />
          <div className="text-sm font-medium text-blue-800">Send Message</div>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-blue-500 hover:text-blue-700">
          <Pencil size={14} />
        </button>
      </div>

      {editing ? (
        <div className="space-y-2 mb-2">
          <textarea
            className="w-full text-xs p-2 border border-blue-200 rounded"
            rows={3}
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <input
            type="text"
            className="w-full text-xs px-2 py-1 border border-blue-200 rounded"
            placeholder="Media URL (optional)"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={collectAddress}
              onChange={(e) => setCollectAddress(e.target.checked)}
              className="mr-2"
            />
            <span className="text-xs">Collect Address</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={collectLocation}
              onChange={(e) => setCollectLocation(e.target.checked)}
              className="mr-2"
            />
            <span className="text-xs">Collect Location</span>
          </label>
          {collectLocation && (
            <div className="space-y-1">
              <input
                type="number"
                className="w-full text-xs px-2 py-1 border border-blue-200 rounded"
                placeholder="Center Latitude"
                value={centerLat}
                onChange={(e) => setCenterLat(e.target.value)}
              />
              <input
                type="number"
                className="w-full text-xs px-2 py-1 border border-blue-200 rounded"
                placeholder="Center Longitude"
                value={centerLon}
                onChange={(e) => setCenterLon(e.target.value)}
              />
              <input
                type="number"
                className="w-full text-xs px-2 py-1 border border-blue-200 rounded"
                placeholder="Radius (km)"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
          )}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={collectInput}
              onChange={(e) => setCollectInput(e.target.checked)}
              className="mr-2"
            />
            <span className="text-xs">Collect Input</span>
          </label>
          {collectInput && (
            <input
              type="text"
              className="w-full text-xs px-2 py-1 border border-blue-200 rounded"
              placeholder="Input Key (e.g., device_issue)"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
            />
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
            {message || 'Empty message'}
          </div>
          {mediaUrl && (
            <div className="flex items-center mt-2 p-1 bg-blue-50 rounded text-xs">
              <Image size={12} className="mr-1 text-blue-500" />
              <span className="truncate w-full">{mediaUrl}</span>
            </div>
          )}
          {data.collect_address && (
            <div className="text-xs mt-2 p-1 bg-blue-50 rounded">
              Collects: Address
            </div>
          )}
          {data.collect_location && (
            <div className="text-xs mt-2 p-1 bg-blue-50 rounded">
              Collects: Location (center: {parseFloat(data.center_lat || 0).toFixed(4)}, {parseFloat(data.center_lon || 0).toFixed(4)}; radius: {data.radius || 5} km)
            </div>
          )}
          {data.collect_input && (
            <div className="text-xs mt-2 p-1 bg-blue-50 rounded">
              Collects: Input ({data.input_key || 'generic_input'})
            </div>
          )}
        </>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(MessageNode);
import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Image, Pencil,Upload  } from 'lucide-react';
import { uploadFlowMedia } from '../uploadFlowMedia';
import { toast } from 'react-toastify';
import VariablePicker from '../VariablePicker';
import FollowUpEditor from '../FollowUpEditor';
import ParallelSendsEditor from '../ParallelSendsEditor';


const MessageNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(data.message || '');
  const [mediaUrl, setMediaUrl] = useState(data.media_url || "");
  const [mediaType, setMediaType] = useState(data.media_type || "");
  const [collectAddress, setCollectAddress] = useState(data.collect_address || false);
  const [collectLocation, setCollectLocation] = useState(data.collect_location || false);
  const [centerLat, setCenterLat] = useState(data.center_lat || '');
  const [centerLon, setCenterLon] = useState(data.center_lon || '');
  const [radius, setRadius] = useState(data.radius || '5');
  const [collectInput, setCollectInput] = useState(data.collect_input || false);
  const [inputKey, setInputKey] = useState(data.input_key || '');
  const [stopFlow, setStopFlow] = useState(data.stop_flow || false);
  const [localFollowUps, setLocalFollowUps] = useState(data.follow_ups || []);
  const [parallelSends, setParallelSends] = useState(data.parallel_sends || []);



  const textareaRef = React.useRef(null);

 
  const handleFileUpload = async (file) => {
      // toast.loading("Uploading media...", { id: "media-upload" });
  
      try {
        const res = await uploadFlowMedia(file);
  
        // Update local state
        setMediaUrl(res.url);
        setMediaType(res.media_type);
  
        // ✅ Persist directly into node data
        data.media_url = res.url;
        data.media_type = res.media_type;
        data.message = message;

  
        // ✅ Auto-close editor (auto-save UX)
        setEditing(false);
  
        toast.success("Media uploaded & saved", {
              autoClose: 2000,
            });
      } catch (err) {
        toast.info("media-upload", {
          render: "Upload failed",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    };


  const handleRemoveMedia = () => {
    setMediaUrl("");
    setMediaType("");

    // remove from node data
    data.media_url = "";
    data.media_type = "";

    toast.info("Media removed", { autoClose: 1500 });
  };

  const handleSave = () => {
    data.message = message;
    data.media_url = mediaUrl;
    data.media_type = mediaType;
    data.collect_address = collectAddress;
    data.collect_location = collectLocation;
    if (collectLocation) {
      data.center_lat = centerLat;
      data.center_lon = centerLon;
      data.radius = radius;
    }
    data.collect_input = collectInput;
    data.input_key = collectInput ? inputKey : '';
    data.stop_flow = stopFlow;
    data.follow_ups = localFollowUps;
    data.parallel_sends = parallelSends;
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
      {data.stop_flow && (
        <div className="text-xs mt-2 p-1 bg-red-50 text-red-600 rounded">
          🚫 Flow stops here
        </div>
        )}

      {editing ? (
        <div className="space-y-2 mb-2">
           <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Message</span>
              <VariablePicker
                textareaRef={textareaRef}
                currentText={message}
                onInsert={setMessage}
              />
            </div>
            <textarea
              ref={textareaRef}
              className="w-full text-xs p-2 border border-blue-200 rounded"
              rows={3}
              placeholder="Enter message. Use {{username}} for variables."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="flex justify-center">
            <label className="flex items-center gap-2 text-xs cursor-pointer 
                              bg-blue-50 hover:bg-blue-100 
                              border border-blue-200 
                              text-blue-700 px-3 py-2 
                              rounded-md transition">
              <Upload size={16} />
              Upload Media
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                hidden
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
            </label>
          </div>

           <input
                type="checkbox"
                checked={stopFlow}
                onChange={(e) => setStopFlow(e.target.checked)}
                className="mr-2"
              />
              <span className="text-xs text-red-600 font-medium">
                Stop flow after this message
              </span>
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
              <label className="flex items-center">
             
            </label>

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

          {editing && (
          <div className="border-t pt-2">
           <ParallelSendsEditor
            parallelSends={parallelSends}
            onChange={setParallelSends}
          />
            <FollowUpEditor
              followUps={localFollowUps}
              onChange={setLocalFollowUps}
            />
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
            {message || 'Empty message'}
          </div>
          {mediaUrl && (
            <div className="flex items-center mt-2 p-1 bg-blue-50 rounded text-xs">
              <Image size={12} className="mr-1 text-blue-500" />
              <span className="truncate w-full">{mediaUrl}</span>
               <button
                onClick={handleRemoveMedia}
                className="text-red-500 hover:text-red-700 ml-2"
                title="Remove media"
              >
                ✕
              </button>
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
          {data.follow_ups && data.follow_ups.length > 0 && (
            <div className="mt-2 p-2 bg-indigo-50 border border-indigo-100 rounded">
              <div className="text-[10px] font-medium text-indigo-700 mb-1">
                Follow-ups:
              </div>

              <div className="space-y-1">
                {data.follow_ups.map((fu, idx) => (
                  <div key={idx} className="text-[10px] text-gray-700">
                    ⏱ {fu.delay_minutes} min → 
                    <span className="ml-1 text-gray-800">
                      {fu.message || "Empty message"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.parallel_sends && data.parallel_sends.length > 0 && (
          <div className="mt-2 p-2 bg-purple-50 border border-purple-100 rounded">
            <div className="text-[10px] font-medium text-purple-700 mb-1">
              Parallel Sends ({data.parallel_sends.length}):
            </div>

            <div className="space-y-1">
              {data.parallel_sends.map((ps, idx) => (
                <div key={idx} className="text-[10px] text-gray-700">
                  ⚡ 
                  <span className="ml-1 text-gray-800">
                    {ps.type === "text" && (ps.content || "Empty message")}
                    {ps.type !== "text" && `[${ps.type}]`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        </>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(MessageNode);
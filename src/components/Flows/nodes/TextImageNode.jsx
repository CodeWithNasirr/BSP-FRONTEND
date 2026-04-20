import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Plus, Pencil, Trash2,Image,Upload } from 'lucide-react';
import { uploadFlowMedia } from '../uploadFlowMedia';
import { toast } from 'react-toastify';
import VariablePicker from '../VariablePicker';
import FollowUpEditor from '../FollowUpEditor';
import ParallelSendsEditor from '../ParallelSendsEditor';

const TextButtonsNode = ({ data, selected }) => {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(data.message || '');
  const [footer, setFooter] = useState(data.footerText || '');
  const [buttons, setButtons] = useState(data.buttons || []);
  const [mediaUrl, setMediaUrl] = useState(data.media_url || "");
  const [mediaType, setMediaType] = useState(data.media_type || "");
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
      data.footerText = footer;
      data.buttons = buttons;
      data.stop_flow = stopFlow;


      // ✅ Auto-close editor (auto-save UX)
      setEditing(false);

      toast.success("Media uploaded & saved", {
        autoClose: 2000,
      });
    } catch (err) {
      toast.update("media-upload", {
        render: "Upload failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

    const MAX_BUTTONS = 3;
  const MAX_BUTTON_TEXT_LENGTH = 20;

  const handleRemoveMedia = () => {
    setMediaUrl("");
    setMediaType("");

    // remove from node data
    data.media_url = "";
    data.media_type = "";

    toast.info("Media removed", { autoClose: 1500 });
  };

  const handleAddButton = () => {
    if (buttons.length >= MAX_BUTTONS) {
      toast.warning("Maximum 3 buttons allowed");
      return;
    }

    const newButton = {
      text: `Button ${buttons.length + 1}`.slice(0, MAX_BUTTON_TEXT_LENGTH),
    };

    const updatedButtons = [...buttons, newButton];
    setButtons(updatedButtons);
    data.buttons = updatedButtons;
  };


  const handleDeleteButton = (index) => {
    const updatedButtons = [...buttons];
    updatedButtons.splice(index, 1);
    setButtons(updatedButtons);
    data.buttons = updatedButtons;
  };

 const handleSave = () => {
  if (buttons.length > MAX_BUTTONS) {
    toast.error("Too many buttons");
    return;
  }

  if (buttons.some(b => b.text.length > MAX_BUTTON_TEXT_LENGTH)) {
    toast.error("Button text too long");
    return;
  }

  data.message = message;
  data.footerText = footer;
  data.buttons = buttons;
  data.media_url = mediaUrl;
  data.media_type = mediaType;
  data.stop_flow = stopFlow;   // ✅ NEW
  data.follow_ups = localFollowUps;
  data.parallel_sends = parallelSends;


  setEditing(false);
};


  return (
    <div className={`px-4 py-3 rounded-lg bg-node-message border ${selected ? 'border-blue-400' : 'border-blue-200'} min-w-[220px] max-w-[300px]`}>
      <Handle type="target" position={Position.Top} />

      <div className="mb-2">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="mr-2 text-blue-500" size={16} />
            <div className="text-sm font-medium text-blue-800">
              Media + Text + Buttons
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="text-blue-500 hover:text-blue-700"
          >
            <Pencil size={14} />
          </button>
        </div>

        {/* Stop-flow badge */}
        {data.stop_flow && (
          <div className="mt-2 text-xs p-1 bg-red-50 text-red-600 rounded text-center">
            🚫 Flow stops here
          </div>
        )}
      </div>


      {editing ? (
        <div className="space-y-2 mb-2">

          <div className="flex justify-center">
            <label className="flex items-center gap-2 text-xs cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-3 py-2 rounded-md transition">
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
           <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={stopFlow}
              onChange={(e) => setStopFlow(e.target.checked)}
            />
            <span className="text-xs text-red-600 font-medium">
              Stop flow after this message
            </span>
          </label>

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
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
           <input 
            className="w-full text-xs p-2 border border-blue-200 rounded"
            rows={3}
            placeholder="Enter footer message"
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
          />

          {buttons.map((btn, index) => (
            <div key={index} className="flex items-center text-xs">
              <input
                type="text"
                value={btn.text}
                maxLength={MAX_BUTTON_TEXT_LENGTH}
                onChange={(e) => {
                  const value = e.target.value.slice(0, MAX_BUTTON_TEXT_LENGTH);

                  const updated = [...buttons];
                  updated[index] = { ...updated[index], text: value };

                  setButtons(updated);
                  data.buttons = updated;
                }}
                className="w-full p-1 border border-blue-200 rounded mr-1"
                placeholder="Button text"
              />

              
              <div className="text-[10px] text-gray-400 text-right">
            {btn.text.length}/{MAX_BUTTON_TEXT_LENGTH}
            </div>
            <button onClick={() => handleDeleteButton(index)} className="text-red-500 hover:text-red-700">
                <Trash2 size={14} />
              </button>
            </div>
            

          ))}

          <button
            onClick={handleAddButton}
            className="flex items-center text-xs text-blue-600 hover:text-blue-800"
          >
            <Plus size={12} className="mr-1" />
            Add Button
          </button>

          <button
            onClick={handleSave}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mt-1"
          >
            Save
          </button>
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
        </div>
      ) : (
        <>
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
          <div className="text-xs bg-white p-2 rounded border border-blue-100 text-gray-700 max-h-[80px] overflow-y-auto mb-2">
            {message || 'Empty message'}
          </div>
          <div className="text-xs bg-white p-2 rounded border border-blue-100 text-gray-700 max-h-[80px] overflow-y-auto mb-2">
            {footer || 'Empty footer message'}
          </div>

          <div className="space-y-1">
            {buttons.length > 0 ? (
              buttons.map((button, index) => (
                <div key={index} className="bg-blue-50 text-xs p-1.5 rounded border border-blue-100 text-blue-700 flex items-center justify-between">
                  {button.text}
                </div>
              ))
            ) : (
              <button
                onClick={handleAddButton}
                disabled={buttons.length >= MAX_BUTTONS}
                className={`flex items-center text-xs
                  ${
                    buttons.length >= MAX_BUTTONS
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
              >
                <Plus size={12} className="mr-1" />
                Add Button
              </button>

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
          
          </div>
        </>
      )}

      {/* Dynamic source handles for each button */}
      {buttons.map((_, index) => (
        <Handle
          key={`handle-${index}`}
          type="source"
          position={Position.Bottom}
          id={`button${index + 1}`}
          style={{ left: `${(100 / (buttons.length + 1)) * (index + 1)}%` }}
        />
      ))}
    </div>
  );
};

export default memo(TextButtonsNode);

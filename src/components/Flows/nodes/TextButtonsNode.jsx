import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare, Plus, Pencil, Trash2 } from 'lucide-react';
import VariablePicker from '../VariablePicker';
import FollowUpEditor from '../FollowUpEditor';
import ParallelSendsEditor from '../ParallelSendsEditor';


const TextButtonsNode = ({ data, selected }) => {
  const MAX_BUTTONS = 3;
  const MAX_TEXT_LENGTH = 20;

  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(data.message || '');
  const [buttons, setButtons] = useState(
    data.buttons || [{ text: 'Button 1', value: '1', collect_cart: false, collect_payment_method: false, checkout: false }]
  );
  

  const [stopFlow, setStopFlow] = useState(data.stop_flow || false);

  const [localFollowUps, setLocalFollowUps] = useState(data.follow_ups || []);
  const [parallelSends, setParallelSends] = useState(data.parallel_sends || []);
  
  
  const textareaRef = React.useRef(null);

  const handleAddButton = () => {
    if (buttons.length >= MAX_BUTTONS) return; // 🚫 hard stop

    const newButton = {
      text: `Button ${buttons.length + 1}`.slice(0, MAX_TEXT_LENGTH),
      value: `${buttons.length + 1}`,
      collect_cart: false,
      collect_payment_method: false,
      checkout: false
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

  const handleButtonChange = (index, field, value) => {
    const updatedButtons = [...buttons];

    if (field === 'text') {
      value = value.slice(0, MAX_TEXT_LENGTH); // 🛑 enforce limit
    }

    updatedButtons[index] = {
      ...updatedButtons[index],
      [field]: value
    };

    setButtons(updatedButtons);
    data.buttons = updatedButtons;
  };


  const handleSave = () => {
    data.message = message;
    data.buttons = buttons;
    data.stop_flow = stopFlow;
    data.follow_ups = localFollowUps; // ✅ ADD THIS
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
            Text + Buttons
          </div>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="text-blue-500 hover:text-blue-700"
        >
          <Pencil size={14} />
        </button>
      </div>
       

      {/* Stop flow indicator */}
      {data.stop_flow && (
        <div className="mt-2 text-xs p-1 bg-red-50 text-red-600 rounded text-center">
          🚫 Flow stops here
        </div>
      )}
      
    </div>


      {editing ? (
        <div className="space-y-2 mb-2">
           <input
                type="checkbox"
                checked={stopFlow}
                onChange={(e) => setStopFlow(e.target.checked)}
                className="mr-2"
              />
              <span className="text-xs text-red-600 font-medium">
                Stop flow after this message
              </span>
              <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Message</span>
              <VariablePicker
                textareaRef={textareaRef}
                currentText={message}
                onInsert={setMessage}
              />
            </div>
          <textarea ref={textareaRef}
            className="w-full text-xs p-2 border border-blue-200 rounded"
            rows={3}
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
         


          {buttons.map((btn, index) => (
            <div key={index} className="space-y-1 border p-2 rounded">
              <div className="flex items-center">
                <input
                  type="text"
                  value={btn.text}
                  maxLength={MAX_TEXT_LENGTH}
                  onChange={(e) =>
                    handleButtonChange(index, 'text', e.target.value)
                  }
                  className="w-full text-xs p-1 border border-blue-200 rounded mr-1"
                  placeholder="Button text"
                />

                <button onClick={() => handleDeleteButton(index)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="text-[10px] text-gray-400 text-right">
                {btn.text.length}/{MAX_TEXT_LENGTH}
              </div>

              <input
                type="text"
                value={btn.value}
                onChange={(e) => handleButtonChange(index, 'value', e.target.value)}
                className="w-full text-xs p-1 border border-blue-200 rounded"
                placeholder="Button value"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={btn.collect_cart || false}
                  onChange={(e) => handleButtonChange(index, 'collect_cart', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs">Add to Cart</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={btn.collect_payment_method || false}
                  onChange={(e) => handleButtonChange(index, 'collect_payment_method', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs">Collect Payment Method</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={btn.checkout || false}
                  onChange={(e) => handleButtonChange(index, 'checkout', e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs">Checkout</span>
              </label>
            </div>
          ))}

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
          <div className="text-xs bg-white p-2 rounded border border-blue-100 text-gray-700 max-h-[80px] overflow-y-auto mb-2">
            {message || 'Empty message'}
          </div>

          <div className="space-y-1">
            {buttons.length > 0 ? (
              buttons.map((button, index) => (
                <div key={index} className="bg-blue-50 text-xs p-1.5 rounded border border-blue-100 text-blue-700 flex items-center justify-between">
                  <span>{button.text}</span>
                  <div className="flex space-x-1">
                    {button.collect_cart && (
                      <span className="text-xs bg-blue-200 px-1 rounded">Cart</span>
                    )}
                    {button.collect_payment_method && (
                      <span className="text-xs bg-green-200 px-1 rounded">Payment</span>
                    )}
                    {button.checkout && (
                      <span className="text-xs bg-purple-200 px-1 rounded">Checkout</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 text-xs p-1.5 rounded border border-gray-200 text-gray-500 flex items-center justify-center">
                <Plus size={12} className="mr-1" />
                Add buttons
              </div>
            )}
          </div>
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
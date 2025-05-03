import React from 'react';
import { X } from 'lucide-react';
import MessageNodeEditor from './properties/MessageNodeEditor';
import WaitNodeEditor from './properties/WaitNodeEditor';
import ConditionalNodeEditor from './properties/ConditionalNodeEditor';
import ApiNodeEditor from './properties/ApiNodeEditor';
import EndNodeEditor from './properties/EndNodeEditor';
import TextButtonsNodeEditor from './properties/TextButtonsNodeEditor';

const PropertyPanel = ({ node, onChange, onClose }) => {
  const handleChange = (data) => {
    onChange(node.id, data);
  };

  const renderEditor = () => {
    switch (node.type) {
      case 'messageNode':
        return <MessageNodeEditor data={node.data} onChange={handleChange} />;
      case 'waitNode':
        return <WaitNodeEditor data={node.data} onChange={handleChange} />;
      case 'conditionalNode':
        return <ConditionalNodeEditor data={node.data} onChange={handleChange} />;
      case 'apiNode':
        return <ApiNodeEditor data={node.data} onChange={handleChange} />;
      case 'endNode':
        return <EndNodeEditor data={node.data} onChange={handleChange} />;
      case 'textButtonsNode':
        return <TextButtonsNodeEditor data={node.data} onChange={handleChange} />;
      default:
        return <div className="p-4 text-center text-gray-500">No properties to edit for this node type.</div>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="sidebar-title">Node Properties</h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="bg-gray-100 px-3 py-2 rounded-md mb-4">
        <div className="text-sm font-medium text-gray-700">Type: {node.type.replace('Node', '')}</div>
        <div className="text-xs text-gray-500">ID: {node.id}</div>
      </div>
      
      <div className="flex-grow overflow-auto">
        {renderEditor()}
      </div>
    </div>
  );
};

export default PropertyPanel;
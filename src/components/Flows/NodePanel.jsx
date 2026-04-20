import React from 'react';
import { 
  MessageSquare, 
  Square, 
  X, 
  MessageCircle,
  ListPlus,
  List,
  SquarePower,
  Image,
  Filter
} from 'lucide-react';


const NODE_TYPES = [
  {
    type: 'start',
    label: 'Start Flow',
    desc: 'Entry point of the flow',
    icon: SquarePower,
    color: 'blue',
  },
  {
    type: 'messageNode',
    label: 'Send Media + Message',
    desc: 'Send media with text',
    icon: MessageSquare,
    color: 'blue',
  },
  {
    type: 'listMessageNode',
    label: 'List Message',
    desc: 'Send list options',
    icon: List,
    color: 'blue',
  },
  {
    type: 'keywordListenerNode',
    label: 'Keyword Router',
    desc: 'Route user input',
    icon: Filter,
    color: 'purple',
  },
  {
    type: 'textButtonsNode',
    label: 'Text + Buttons',
    desc: 'Message with buttons',
    icon: ListPlus,
    color: 'blue',
  },
  {
    type: 'imageTextButtonsNode',
    label: 'Media + Buttons',
    desc: 'Media + buttons',
    icon: Image,
    color: 'blue',
  },
  {
    type: 'catalogCarouselNode',
    label: 'Catalog',
    desc: 'Show product catalog',
    icon: List, // ✅ better than Image
    color: 'blue',
  },
  {
    type: 'waitNode',
    label: 'Wait',
    desc: 'Delay execution',
    icon: Square, // or Clock if added
    color: 'gray',
  },
  {
    type: 'leadcollector',
    label: 'Lead Collector',
    desc: 'Collect user data',
    icon: MessageCircle,
    color: 'blue',
  },
  {
    type: 'apiNode',
    label: 'API Call',
    desc: 'Connect external API',
    icon: Filter,
    color: 'blue',
  },
  {
    type: 'endNode',
    label: 'End Flow',
    desc: 'Terminate flow',
    icon: Square,
    color: 'red',
  },
];


const NodePanel = ({ onClose, onDragStart, touchDragHandlers }) => {
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = touchDragHandlers || {};

  return (
    <div className="max-h-screen flex flex-col h-full p-4 sm:p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">Flow Nodes</h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>
      
      <p className="text-xs sm:text-sm text-gray-500 mb-4">
        Drag and drop nodes onto the canvas to build your WhatsApp flow
      </p>

      <div className="flex-grow space-y-3 overflow-y-auto">
        {NODE_TYPES.map((node) => {
          const Icon = node.icon;

          return (
              <div
                key={node.type}
                className={`p-3 rounded-lg border cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none 
                ${node.color === 'red' ? 'bg-node-end border-red-200' : 'bg-node-message border-blue-200'}`}
                
                onDragStart={(e) => onDragStart(e, node.type)}
                onTouchStart={(e) => handleTouchStart && handleTouchStart(e, node.type)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                draggable
              >
                <Icon className={`mr-3 ${node.color === 'red' ? 'text-red-500' : 'text-blue-500'}`} size={20} />

                <div>
                  <h4 className="font-medium text-sm">{node.label}</h4>
                  <p className="text-xs text-gray-500">{node.desc}</p>
                </div>
              </div>
            );
          })}
        </div>


      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="rounded-lg p-3 bg-whatsapp-light">
          <h4 className="font-medium flex items-center mb-2 text-sm">
            <MessageCircle className="text-whatsapp-dark mr-2" size={16} />
            Tips
          </h4>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Drag nodes onto the canvas</li>
            <li>• Connect nodes by dragging from handles</li>
            <li>• Tap on a node to edit its properties</li>
            <li>• Use Save button to store your flow</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NodePanel;
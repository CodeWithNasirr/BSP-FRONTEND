import React from 'react';
import { 
  MessageSquare, 
  Clock, 
  GitBranch, 
  Globe, 
  Square, 
  X, 
  MessageCircle,
  ListPlus,
  List,
  Circle,
  SquarePower,Image
} from 'lucide-react';

const NodePanel = ({ onClose }) => {
  
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };



  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="sidebar-title">Flow Nodes</h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">
        Drag and drop nodes onto the canvas to build your WhatsApp flow
      </p>
     

      <div className="space-y-3">
      <div 
          className="p-3 bg-node-end rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md"
          onDragStart={(e) => onDragStart(e, 'start')}
          draggable
        >
          <SquarePower className="mr-3 text-blue-500" size={24} />
          <div>
            <h4 className="font-medium">Start Flow</h4>
            <p className="text-xs text-gray-500">Entry point of the flow</p>
          </div>
        </div>

        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md"
          onDragStart={(e) => onDragStart(e, 'messageNode')}
          draggable
        >
          <MessageSquare className="mr-3 text-blue-500" size={24} />
          <div>
            <h4 className="font-medium">Send Message</h4>
            <p className="text-xs text-gray-500">Send text or media message</p>
          </div>
        </div>

        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md"
          onDragStart={(e) => onDragStart(e, 'listMessageNode')}
          draggable
        >
          <List className="mr-3 text-blue-500" size={24} />
          <div>
            <h4 className="font-medium">List Message</h4>
            <p className="text-xs text-gray-500">Send text or media message</p>
          </div>
        </div>
        
        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md"
          onDragStart={(e) => onDragStart(e, 'singleSelectNode')}
          draggable
        >
          <Circle className="mr-3 text-blue-500" size={24} />
          <div>
            <h4 className="font-medium">Single List Message</h4>
            <p className="text-xs text-gray-500">Send text or media message</p>
          </div>
        </div>

        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md"
          onDragStart={(e) => onDragStart(e, 'textButtonsNode')}
          draggable
        >
          <ListPlus className="mr-3 text-blue-500" size={24} />
          <div>
            <h4 className="font-medium">Text + Buttons</h4>
            <p className="text-xs text-gray-500">Message with button options</p>
          </div>
        </div>

        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md"
          onDragStart={(e) => onDragStart(e, 'imageTextButtonsNode')}
          draggable
        >
          <Image className="mr-3 text-blue-500" size={24} />
          <div>
            <h4 className="font-medium">Image + Text + Buttons</h4>
            <p className="text-xs text-gray-500">Message with image and buttons</p>
          </div>
        </div> 

        {/* <div 
          className="p-3 bg-node-wait rounded-lg border border-amber-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md"
          onDragStart={(e) => onDragStart(e, 'waitNode')}
          draggable
        >
          <Clock className="mr-3 text-amber-500" size={24} />
          <div>
            <h4 className="font-medium">Wait for Reply</h4>
            <p className="text-xs text-gray-500">Wait for user response</p>
          </div>
        </div>  */}
 
        {/* <div 
          className="p-3 bg-node-condition rounded-lg border border-indigo-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md"
          onDragStart={(e) => onDragStart(e, 'conditionalNode')}
          draggable
        >
          <GitBranch className="mr-3 text-indigo-500" size={24} />
          <div>
            <h4 className="font-medium">Conditional Split</h4>
            <p className="text-xs text-gray-500">Branch based on conditions</p>
          </div>
        </div> */}

        {/* <div 
          className="p-3 bg-node-api rounded-lg border border-purple-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md"
          onDragStart={(e) => onDragStart(e, 'apiNode')}
          draggable
        >
          <Globe className="mr-3 text-purple-500" size={24} />
          <div>
            <h4 className="font-medium">Call API</h4>
            <p className="text-xs text-gray-500">Make external API requests</p>
          </div>
        </div> */}

        <div 
          className="p-3 bg-node-end rounded-lg border border-red-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md"
          onDragStart={(e) => onDragStart(e, 'endNode')}
          draggable
        >
          <Square className="mr-3 text-red-500" size={24} />
          <div>
            <h4 className="font-medium">End Flow</h4>
            <p className="text-xs text-gray-500">Terminate conversation flow</p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="rounded-lg p-3 bg-whatsapp-light">
          <h4 className="font-medium flex items-center mb-2">
            <MessageCircle className="text-whatsapp-dark mr-2" size={18} />
            Tips
          </h4>
          <ul className="text-xs text-gray-700 space-y-2">
            <li>• Drag nodes onto the canvas</li>
            <li>• Connect nodes by dragging from handles</li>
            <li>• Click on a node to edit its properties</li>
            <li>• Use Save button to store your flow</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NodePanel;
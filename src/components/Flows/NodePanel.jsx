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
        <div 
          className="p-3 bg-node-end rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'start')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'start')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <SquarePower className="mr-3 text-blue-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">Start Flow</h4>
            <p className="text-xs text-gray-500">Entry point of the flow</p>
          </div>
        </div>

        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'messageNode')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'messageNode')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <MessageSquare className="mr-3 text-blue-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">Send Media + Message</h4>
            <p className="text-xs text-gray-500">Add an image, video, or document URL to send along with your message.</p>
          </div>
        </div>

        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'listMessageNode')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'listMessageNode')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <List className="mr-3 text-blue-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">List Message</h4>
            <p className="text-xs text-gray-500">Send text or media message</p>
          </div>
        </div>

        <div 
            className="p-3 bg-node-message rounded-lg border border-purple-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
            onDragStart={(e) => onDragStart(e, 'keywordListenerNode')}
            onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'keywordListenerNode')}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            draggable
          >
          <Filter className="mr-3 text-purple-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">Keyword Router</h4>
            <p className="text-xs text-gray-500">Route user's typed reply to different paths</p>
          </div>
        </div>



        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'listMessageNode')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'listMessageNode')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <List className="mr-3 text-blue-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">List Message</h4>
            <p className="text-xs text-gray-500">Send text or media message</p>
          </div>
        </div>

        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'textButtonsNode')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'textButtonsNode')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <ListPlus className="mr-3 text-blue-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">Text + Buttons</h4>
            <p className="text-xs text-gray-500">Message with button options</p>
          </div>
        </div>

        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'imageTextButtonsNode')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'imageTextButtonsNode')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <Image className="mr-3 text-blue-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">Media + Text + Buttons</h4>
            <p className="text-xs text-gray-500">Message with Media and buttons</p>
          </div>
        </div> 

        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'catalogCarouselNode')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'catalogCarouselNode')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <Image className="mr-3 text-blue-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">catalogCarouselNode</h4>
            <p className="text-xs text-gray-500">Message with catalogCarouselNode</p>
          </div>
        </div> 

        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'waitNode')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'waitNode')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <Image className="mr-3 text-blue-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">waitNode</h4>
            <p className="text-xs text-gray-500">Message with waitNode</p>
          </div>
        </div> 

        {/* lead collector */}
        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'leadcollector')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'leadcollector')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <Image className="mr-3 text-blue-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">leadcollector</h4>
            <p className="text-xs text-gray-500">Message with leadcollector</p>
          </div>
        </div> 
        {/*  */}
        {/* Api node */}
        <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'apiNode')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'apiNode')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <Image className="mr-3 text-blue-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">apiNode</h4>
            <p className="text-xs text-gray-500">Connect with apiNode</p>
          </div>
        </div> 
        {/*  */}
        {/* Booking Node */}
        {/* <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'bookingNode')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'bookingNode')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <Image className="mr-3 text-blue-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">Booking Node</h4>
            <p className="text-xs text-gray-500">Message with bookingNode</p>
          </div>
        </div>  */}
        {/*  */} 
        {/* Booking Node */}
        {/* <div 
          className="p-3 bg-node-message rounded-lg border border-blue-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'paymentMethodNode')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'paymentMethodNode')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <Image className="mr-3 text-blue-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">paymentMethodNode</h4>
            <p className="text-xs text-gray-500">Message with paymentMethodNode</p>
          </div>
        </div>  */}
        {/*  */} 

        {/* End node  */}
        <div 
          className="p-3 bg-node-end rounded-lg border border-red-200 cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none"
          onDragStart={(e) => onDragStart(e, 'endNode')}
          onTouchStart={(e) => handleTouchStart && handleTouchStart(e, 'endNode')}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable
        >
          <Square className="mr-3 text-red-500" size={20} />
          <div>
            <h4 className="font-medium text-sm">End Flow</h4>
            <p className="text-xs text-gray-500">Terminate conversation flow</p>
          </div>
        </div>
        {/*  */}

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
// import React from 'react';
// import { 
//   MessageSquare, 
//   Square, 
//   X, 
//   MessageCircle,
//   ListPlus,
//   List,
//   SquarePower,
//   Image,
//   Filter,
//   ScanLine
// } from 'lucide-react';


// const NODE_TYPES = [
//   {
//     type: 'start',
//     label: 'Start Flow',
//     desc: 'Entry point of the flow',
//     icon: SquarePower,
//     color: 'blue',
//   },
//   {
//     type: 'messageNode',
//     label: 'Send Media + Message',
//     desc: 'Send media with text',
//     icon: MessageSquare,
//     color: 'blue',
//   },
//   {
//     type: 'listMessageNode',
//     label: 'List Message',
//     desc: 'Send list options',
//     icon: List,
//     color: 'blue',
//   },
//   {
//     type: 'keywordListenerNode',
//     label: 'Keyword Router',
//     desc: 'Route user input',
//     icon: Filter,
//     color: 'purple',
//   },

//   {
//     type: 'mediaConditionNode',
//     label: 'Media Router',
//     desc: 'Route by media/message type',
//     icon: ScanLine,
//     color: 'rose',
//   },

//   {
//     type: 'textButtonsNode',
//     label: 'Text + Buttons',
//     desc: 'Message with buttons',
//     icon: ListPlus,
//     color: 'blue',
//   },
//   {
//     type: 'imageTextButtonsNode',
//     label: 'Media + Buttons',
//     desc: 'Media + buttons',
//     icon: Image,
//     color: 'blue',
//   },
//   {
//     type: 'catalogCarouselNode',
//     label: 'Catalog',
//     desc: 'Show product catalog',
//     icon: List, // ✅ better than Image
//     color: 'blue',
//   },
//   {
//     type: 'waitNode',
//     label: 'Wait',
//     desc: 'Delay execution',
//     icon: Square, // or Clock if added
//     color: 'gray',
//   },
//   {
//     type: 'leadcollector',
//     label: 'Lead Collector',
//     desc: 'Collect user data',
//     icon: MessageCircle,
//     color: 'blue',
//   },
//   {
//     type: 'apiNode',
//     label: 'API Call',
//     desc: 'Connect external API',
//     icon: Filter,
//     color: 'blue',
//   },
//   {
//     type: 'endNode',
//     label: 'End Flow',
//     desc: 'Terminate flow',
//     icon: Square,
//     color: 'red',
//   },
// ];


// const NodePanel = ({ onClose, onDragStart, touchDragHandlers }) => {
//   const { handleTouchStart, handleTouchMove, handleTouchEnd } = touchDragHandlers || {};

//   return (
//     <div className="max-h-screen flex flex-col h-full p-4 sm:p-6 bg-white">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-lg sm:text-xl font-semibold">Flow Nodes</h3>
//         <button 
//           onClick={onClose}
//           className="p-1 rounded-full hover:bg-gray-100"
//         >
//           <X size={18} />
//         </button>
//       </div>
      
//       <p className="text-xs sm:text-sm text-gray-500 mb-4">
//         Drag and drop nodes onto the canvas to build your WhatsApp flow
//       </p>

//       <div className="flex-grow space-y-3 overflow-y-auto">
//         {NODE_TYPES.map((node) => {
//           const Icon = node.icon;

//           return (
//               <div
//                 key={node.type}
//                 className={`p-3 rounded-lg border cursor-move flex items-center transition-transform transform hover:scale-105 hover:shadow-md touch-action-none
//                 ${node.color === 'red'
//                   ? 'bg-node-end border-red-200'
//                   : node.color === 'purple'
//                   ? 'bg-purple-50 border-purple-200'
//                   : node.color === 'rose'
//                   ? 'bg-rose-50 border-rose-200'
//                   : 'bg-node-message border-blue-200'
//                 }`}
                
//                 onDragStart={(e) => onDragStart(e, node.type)}
//                 onTouchStart={(e) => handleTouchStart && handleTouchStart(e, node.type)}
//                 onTouchMove={handleTouchMove}
//                 onTouchEnd={handleTouchEnd}
//                 draggable
//               >
//                 <Icon
//                   className={`mr-3
//                   ${node.color === 'red'
//                     ? 'text-red-500'
//                     : node.color === 'purple'
//                     ? 'text-purple-500'
//                     : node.color === 'rose'
//                     ? 'text-rose-500'
//                     : 'text-blue-500'
//                   }`}
//                   size={20}
//                 />

//                 <div>
//                   <h4 className="font-medium text-sm">{node.label}</h4>
//                   <p className="text-xs text-gray-500">{node.desc}</p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>


//       <div className="mt-auto pt-4 border-t border-gray-200">
//         <div className="rounded-lg p-3 bg-whatsapp-light">
//           <h4 className="font-medium flex items-center mb-2 text-sm">
//             <MessageCircle className="text-whatsapp-dark mr-2" size={16} />
//             Tips
//           </h4>
//           <ul className="text-xs text-gray-700 space-y-1">
//             <li>• Drag nodes onto the canvas</li>
//             <li>• Connect nodes by dragging from handles</li>
//             <li>• Tap on a node to edit its properties</li>
//             <li>• Use Save button to store your flow</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NodePanel;

import React from 'react';
import { MessageSquare, Square, X, MessageCircle, ListPlus, List, SquarePower, Image, Filter, ScanLine } from 'lucide-react';

const NODE_TYPES = [
  { type: 'start', label: 'Start Flow', desc: 'Entry point of the flow', icon: SquarePower, color: 'teal' },
  { type: 'messageNode', label: 'Send Media + Message', desc: 'Send media with text', icon: MessageSquare, color: 'blue' },
  { type: 'listMessageNode', label: 'List Message', desc: 'Send list options', icon: List, color: 'blue' },
  { type: 'keywordListenerNode', label: 'Keyword Router', desc: 'Route user input', icon: Filter, color: 'purple' },
  { type: 'mediaConditionNode', label: 'Media Router', desc: 'Route by media/message type', icon: ScanLine, color: 'rose' },
  { type: 'textButtonsNode', label: 'Text + Buttons', desc: 'Message with buttons', icon: ListPlus, color: 'blue' },
  { type: 'imageTextButtonsNode', label: 'Media + Buttons', desc: 'Media + buttons', icon: Image, color: 'blue' },
  { type: 'catalogCarouselNode', label: 'Catalog', desc: 'Show product catalog', icon: List, color: 'blue' },
  { type: 'waitNode', label: 'Wait', desc: 'Delay execution', icon: Square, color: 'gray' },
  { type: 'leadcollector', label: 'Lead Collector', desc: 'Collect user data', icon: MessageCircle, color: 'blue' },
  { type: 'apiNode', label: 'API Call', desc: 'Connect external API', icon: Filter, color: 'blue' },
  { type: 'endNode', label: 'End Flow', desc: 'Terminate flow', icon: Square, color: 'red' },
];

const colorMap = {
  teal: { light: 'bg-teal-50 border-teal-200 hover:bg-teal-100', dark: 'dark:bg-teal-500/10 dark:border-teal-500/20 dark:hover:bg-teal-500/20', icon: 'text-teal-600 dark:text-teal-400' },
  blue: { light: 'bg-blue-50 border-blue-200 hover:bg-blue-100', dark: 'dark:bg-blue-500/10 dark:border-blue-500/20 dark:hover:bg-blue-500/20', icon: 'text-blue-600 dark:text-blue-400' },
  purple: { light: 'bg-purple-50 border-purple-200 hover:bg-purple-100', dark: 'dark:bg-purple-500/10 dark:border-purple-500/20 dark:hover:bg-purple-500/20', icon: 'text-purple-600 dark:text-purple-400' },
  rose: { light: 'bg-rose-50 border-rose-200 hover:bg-rose-100', dark: 'dark:bg-rose-500/10 dark:border-rose-500/20 dark:hover:bg-rose-500/20', icon: 'text-rose-600 dark:text-rose-400' },
  gray: { light: 'bg-gray-50 border-gray-200 hover:bg-gray-100', dark: 'dark:bg-gray-500/10 dark:border-gray-500/20 dark:hover:bg-gray-500/20', icon: 'text-gray-600 dark:text-gray-400' },
  red: { light: 'bg-red-50 border-red-200 hover:bg-red-100', dark: 'dark:bg-red-500/10 dark:border-red-500/20 dark:hover:bg-red-500/20', icon: 'text-red-600 dark:text-red-400' },
};

const NodePanel = ({ onClose, onDragStart, touchDragHandlers }) => {
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = touchDragHandlers || {};

  return (
    <div className="max-h-screen flex flex-col h-full p-4 sm:p-6 bg-white dark:bg-[#111827] transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Flow Nodes</h3>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
          <X size={18} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
        Drag and drop nodes onto the canvas to build your WhatsApp flow
      </p>

      <div className="flex-grow space-y-2.5 overflow-y-auto scrollbar-thin pr-1">
        {NODE_TYPES.map((node) => {
          const Icon = node.icon;
          const colors = colorMap[node.color] || colorMap.blue;
          return (
            <div
              key={node.type}
              className={`p-3 rounded-xl border cursor-move flex items-center transition-all duration-200 hover:shadow-md active:scale-95 touch-action-none ${colors.light} ${colors.dark}`}
              onDragStart={(e) => onDragStart(e, node.type)}
              onTouchStart={(e) => handleTouchStart && handleTouchStart(e, node.type)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              draggable
            >
              <Icon className={`mr-3 shrink-0 ${colors.icon}`} size={20} />
              <div className="min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{node.label}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{node.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/5">
        <div className="rounded-xl p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
          <h4 className="font-semibold flex items-center mb-2 text-sm text-gray-900 dark:text-green-300">
            <MessageCircle className="text-green-600 dark:text-green-400 mr-2" size={16} />
            Tips
          </h4>
          <ul className="text-xs text-gray-700 dark:text-gray-400 space-y-1">
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
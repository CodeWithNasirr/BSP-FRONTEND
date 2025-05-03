import React, { useState, useEffect } from 'react';
import { X, Send, RotateCw } from 'lucide-react';
import classNames from 'classnames';
import { nanoid } from 'nanoid';

const FlowSimulator = ({ flow, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentNode, setCurrentNode] = useState(null);
  const [variables, setVariables] = useState({});
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (flow?.nodes) {
      // Find the starting node (usually the first node)
      const startNode = flow.nodes.find(node => !flow.edges.some(edge => edge.target === node.id));
      if (startNode) {
        setCurrentNode(startNode);
        processNode(startNode);
      }
    }
  }, [flow]);

  const processNode = async (node) => {
    if (!node) return;

    switch (node.type) {
      case 'messageNode':
        addMessage('bot', node.data.message);
        if (node.data.mediaUrl) {
          addMessage('bot', `[Media: ${node.data.mediaUrl}]`);
        }
        moveToNextNode(node);
        break;

      case 'textButtonsNode':
        addMessage('bot', node.data.message, node.data.buttons);
        setIsWaiting(true);
        break;

      case 'waitNode':
        setIsWaiting(true);
        if (node.data.timeout > 0) {
          setTimeout(() => {
            setIsWaiting(false);
            moveToNextNode(node);
          }, node.data.timeout * 1000);
        }
        break;

      case 'conditionalNode':
        const condition = evaluateCondition(node.data.condition);
        const nextEdge = flow.edges.find(edge => 
          edge.source === node.id && 
          edge.sourceHandle === (condition ? 'true' : 'false')
        );
        if (nextEdge) {
          const nextNode = flow.nodes.find(n => n.id === nextEdge.target);
          setCurrentNode(nextNode);
          processNode(nextNode);
        }
        break;

    //   case 'apiNode':
    //     addMessage('bot', '🔄 Processing API call...');
    //     try {
    //       const response = await simulateApiCall(node.data);
    //       addMessage('bot', `✅ API Response: ${JSON.stringify(response)}`);
    //     } catch (error) {
    //       addMessage('bot', `❌ API Error: ${error.message}`);
    //     }
    //     moveToNextNode(node);
    //     break;

      case 'endNode':
        if (node.data.endMessage) {
          addMessage('bot', node.data.endMessage);
        }
        addMessage('system', 'Flow completed');
        setIsWaiting(false);
        break;
    }
  };

  const simulateApiCall = async (data) => {
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Simulated API response' };
  };    

  const evaluateCondition = (condition) => {
    try {
      // Replace variables in condition
      const evaluableCondition = condition.replace(/\{(\w+)\}/g, (match, variable) => {
        return JSON.stringify(variables[variable] || '');
      });
      return eval(evaluableCondition);
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  };

  const moveToNextNode = (currentNode, sourceHandle = null) => {
    const nextEdge = flow.edges.find(edge => 
      edge.source === currentNode.id && 
      (sourceHandle ? edge.sourceHandle === sourceHandle : true)
    );
  
    if (nextEdge) {
      const nextNode = flow.nodes.find(node => node.id === nextEdge.target);
      setCurrentNode(nextNode);
      processNode(nextNode);
    }
  };

  const addMessage = (sender, text, buttons = null) => {
    setMessages(prev => [...prev, { 
      id: nanoid(), 
      sender, 
      text, 
      buttons,
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const handleSendMessage = () => {
    if (!userInput.trim() && !currentNode?.type === 'textButtonsNode') return;

    addMessage('user', userInput);
    setVariables(prev => ({
      ...prev,
      [currentNode?.data?.variable || 'response']: userInput
    }));
    setUserInput('');
    setIsWaiting(false);
    moveToNextNode(currentNode);
  };

  const handleButtonClick = (button, index) => {
    addMessage('user', button.text);
    setVariables(prev => ({
      ...prev,
      [currentNode?.data?.variable || 'response']: button.value || button.text
    }));
    setIsWaiting(false);
    moveToNextNode(currentNode, `button${index + 1}`);
  };

  const handleReset = () => {
    setMessages([]);
    setVariables({});
    setUserInput('');
    setIsWaiting(false);
    const startNode = flow.nodes.find(node => !flow.edges.some(edge => edge.target === node.id));
    if (startNode) {
      setCurrentNode(startNode);
      processNode(startNode);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-100 w-full max-w-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-whatsapp-teal p-4 flex items-center justify-between text-white">
          <h3 className="font-medium">Flow Simulator</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleReset}
              className="p-1 hover:bg-whatsapp-dark rounded"
              title="Reset Simulation"
            >
              <RotateCw size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-whatsapp-dark rounded"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="bg-[#E5DDD5] h-[400px] overflow-y-auto p-4 space-y-2">
          {messages.map(message => (
            <div
              key={message.id}
              className={classNames(
                'max-w-[80%] rounded-lg p-2 relative',
                {
                  'ml-auto bg-[#DCF8C6]': message.sender === 'user',
                  'bg-white': message.sender === 'bot',
                  'bg-yellow-100 mx-auto text-center': message.sender === 'system'
                }
              )}
            >
              <div className="text-sm">{message.text}</div>
              {message.buttons && (
                <div className="mt-2 space-y-1">
                  {message.buttons.map((button, index) => (
                    <button
                      key={`${message.id}-btn-${index}`}
                      onClick={() => handleButtonClick(button,index)}
                      className="w-full text-left px-3 py-1.5 bg-whatsapp-light text-whatsapp-teal rounded hover:bg-whatsapp-green hover:text-white transition-colors"
                    >
                      {button.text}
                    </button>
                  ))}
                </div>
              )}
              <div className="text-[10px] text-gray-500 text-right mt-1">
                {message.timestamp}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-gray-200 p-3 flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isWaiting ? "Type your response..." : "Waiting for bot..."}
            disabled={!isWaiting}
            className="flex-grow px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-whatsapp-green disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={!isWaiting}
            className="p-2 bg-whatsapp-green text-white rounded-full hover:bg-whatsapp-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlowSimulator;
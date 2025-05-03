import { nanoid } from 'nanoid';

// Export flow to a downloadable JSON file
export const exportFlow = (flow) => {
  const flowJson = JSON.stringify(flow, null, 2);
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(flowJson)}`;
  
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', `whatsapp-flow-${new Date().toISOString()}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

// Import flow from a JSON file
export const importFlow = () => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      
      if (!file) {
        resolve(null);
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const flow = JSON.parse(event.target.result);
          resolve(flow);
        } catch (error) {
          console.error('Error parsing flow JSON:', error);
          resolve(null);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  });
};

// Generate a unique node ID
export const generateNodeId = (nodeType) => {
  return `${nodeType}-${nanoid(6)}`;
};

// Create a default node based on type
export const createDefaultNode = (type, position) => {
  const nodeData = getDefaultDataForNodeType(type);
  
  return {
    id: generateNodeId(type),
    type,
    position,
    data: nodeData,
  };
};

// Get default data for a node type
export const getDefaultDataForNodeType = (type) => {
  switch (type) {
    case 'messageNode':
      return { 
        message: 'Hello, welcome to our WhatsApp bot!', 
        mediaUrl: '' 
      };
      
    case 'textButtonsNode':
      return {
        message: 'Please select an option:',
        buttons: [
          { text: 'Option 1', value: '1' },
          { text: 'Option 2', value: '2' }
        ]
      };
      
    case 'waitNode':
      return { 
        timeout: 60, 
        variable: 'userResponse' 
      };
      
    case 'conditionalNode':
      return { 
        condition: 'response == "yes"', 
        trueLabel: 'Yes', 
        falseLabel: 'No' 
      };
      
    case 'apiNode':
      return { 
        url: 'https://api.example.com/endpoint', 
        method: 'GET', 
        headers: {}, 
        body: '' 
      };
      
    case 'endNode':
      return { 
        endMessage: 'Thank you for using our service!' 
      };
      
    default:
      return {};
  }
};

// Simple flow validation
export const validateFlow = (flow) => {
  const errors = [];
  
  // Check if there are any nodes
  if (!flow.nodes || flow.nodes.length === 0) {
    errors.push('Flow must contain at least one node');
  }
  
  // Check if all required nodes are present
  const hasEndNode = flow.nodes.some(node => node.type === 'endNode');
  if (!hasEndNode) {
    errors.push('Flow should have at least one End Node');
  }
  
  // Find disconnected nodes
  const connectedNodeIds = new Set();
  flow.edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });
  
  const disconnectedNodes = flow.nodes.filter(node => !connectedNodeIds.has(node.id));
  if (disconnectedNodes.length > 0) {
    errors.push(`There are ${disconnectedNodes.length} disconnected nodes`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
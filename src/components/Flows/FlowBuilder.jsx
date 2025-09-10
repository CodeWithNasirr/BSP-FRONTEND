import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Trash2, Download, Upload, Play,Workflow } from 'lucide-react';
import NodePanel from './NodePanel';
import PropertyPanel from './PropertyPanel';
import FlowSimulator from './FlowSimulator';
import { nodeTypes } from './nodes';
import useFlowStore from '../../store/flowStore';
import { exportFlow, importFlow } from '../../utils/flowUtils';
import RequireSubscription from '../Subscriptions/RequireSubscription';
import { useTouchDrag } from './useTouchDrag';

const FlowBuilder = ({ setEnableChatFlow }) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [flowName, setFlowName] = useState('Flow 1');
  const [isChatFlowEnabled, setIsChatFlowEnabled] = useState(() => localStorage.getItem('chatFlowEnabled') === 'true');

  const { setCurrentFlow, saveFlow, fetchFlows } = useFlowStore();
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchDrag(
    reactFlowWrapper,
    reactFlowInstance,
    setNodes,
    nodes
  );
  useEffect(() => {
    localStorage.setItem('chatFlowEnabled', isChatFlowEnabled);
    setEnableChatFlow(isChatFlowEnabled);
  }, [isChatFlowEnabled, setEnableChatFlow]);

  useEffect(() => { 
    const loadFlows = async () => {
      const flows = await fetchFlows();
      const existingFlow = flows[0];
      if (existingFlow) {
        setNodes(existingFlow.nodes || []);
        setEdges(existingFlow.edges || []);
        setCurrentFlow(existingFlow);
        setFlowName(existingFlow.name);
      }
    };
    loadFlows();
  }, [fetchFlows, setNodes, setEdges, setCurrentFlow]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
  (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type || !reactFlowInstance || !reactFlowWrapper.current) return;

      if (type === 'start' && nodes.some((node) => node.type === 'start')) {
        alert('Only one Start Flow node is allowed.');
        return;
      }

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const clientX = event.clientX - bounds.left;
      const clientY = event.clientY - bounds.top;

      const position = reactFlowInstance.screenToFlowPosition({
        x: clientX,
        y: clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type} node`, ...getDefaultDataForType(type) },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, nodes]
  );
  

  const getDefaultDataForType = (type) => {
    switch (type) {
      case 'start':
        return { label: 'Start Flow' };
      case 'messageNode':
        return { message: 'Hello, welcome to our WhatsApp bot!', mediaUrl: '' };
      case 'imageTextButtonsNode':
        return {
          message: 'Choose an option:',
          image: '',
          footerText: '',
          buttons: [
            { text: 'Button 1', value: '1' },
            { text: 'Button 2', value: '2' },
          ],
        };
      case 'waitNode':
        return { timeout: 60, variable: 'userResponse' };
      case 'conditionalNode':
        return { condition: 'response == "yes"', trueLabel: 'Yes', falseLabel: 'No' };
      case 'apiNode':
        return { url: 'https://api.example.com/endpoint', method: 'GET', headers: {} };
      case 'endNode':
        return { endMessage: 'Flow completed' };
      case 'textButtonsNode':
        return {
          message: 'Please select an option:',
          buttons: [
            { text: 'Option 1', value: '1' },
            { text: 'Option 2', value: '2' },
          ],
        };
      default:
        return {};
    }
  };

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    setPropertiesOpen(true);
  }, []);

  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...newData } };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleSaveFlow = useCallback(async () => {
    if (reactFlowInstance) {
      const startNodes = nodes.filter((node) => node.type === 'start');
      if (startNodes.length !== 1) {
        alert('Flow must have exactly one Start Flow node.');
        return;
      }

      const flow = reactFlowInstance.toObject();
      try {
        await saveFlow({
          ...flow,
          name: flowName,
        });
        alert('Flow saved successfully!');
      } catch (error) {
        alert(`Failed to save flow: ${error.message}`);
      }
    }
  }, [reactFlowInstance, saveFlow, flowName, nodes]);

  const handleExportFlow = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      exportFlow(flow);
    }
  }, [reactFlowInstance]);

  const handleImportFlow = useCallback(() => {
    importFlow().then(async (flow) => {
      if (flow) {
        const startNodes = (flow.nodes || []).filter((node) => node.type === 'start');
        if (startNodes.length !== 1) {
          alert('Imported flow must have exactly one Start Flow node.');
          return;
        }

        try {
          await saveFlow({
            ...flow,
            name: flow.name || 'Imported Flow',
          });
          setNodes(flow.nodes || []);
          setEdges(flow.edges || []);
          setCurrentFlow(flow);
          setFlowName(flow.name || 'Imported Flow');
          alert('Flow imported successfully!');
        } catch (error) {
          alert(`Failed to save flow: ${error.message}`);
        }
      }
    });
  }, [setNodes, setEdges, setCurrentFlow, saveFlow]);

  const handleDeleteSelectedNodes = useCallback(() => {
    const deletedNodeIds = nodes
      .filter((node) => node.selected)
      .map((node) => node.id);

    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !edge.selected &&
          !deletedNodeIds.includes(edge.source) &&
          !deletedNodeIds.includes(edge.target)
      )
    );

    setNodes((nds) => nds.filter((node) => !node.selected));
  }, [setNodes, setEdges, nodes]);

  const handleSimulateFlow = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      setSimulatorOpen(true);
    }
  }, [reactFlowInstance]);

  return (
    <RequireSubscription>
      <div className="max-h-screen flex flex-col">
        <div className="flex-grow flex flex-col sm:flex-row">
          {sidebarOpen && (
            <div className="fixed inset-y-0 left-0 w-64 sm:w-80 bg-white shadow-lg z-50 sm:static sm:shadow-none transform sm:transform-none transition-transform duration-300 ease-in-out sm:flex sm:flex-col">
              <NodePanel
                onClose={() => setSidebarOpen(false)}
                onDragStart={(event, nodeType) => {
                  event.dataTransfer.setData('application/reactflow', nodeType);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                touchDragHandlers={{ handleTouchStart, handleTouchMove, handleTouchEnd }}
              />
            </div>
          )}

          <div className="flex-grow relative h-[calc(100vh-4rem)] sm:h-screen">
            <ReactFlowProvider>
              <div className="h-full w-full" ref={reactFlowWrapper}>
                <ReactFlow 
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={setReactFlowInstance}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                  snapToGrid
                  snapGrid={[15, 15]}
                  className="touch-none sm:touch-auto"
                >
                  <Controls position="bottom-right" />
                  <MiniMap
                    nodeStrokeColor={(n) => (n.selected ? '#25D366' : '#ddd')}
                    nodeColor={(n) => {
                      switch (n.type) {
                        case 'start': return '#CCFBF1';
                        case 'messageNode': return '#E0F2FE';
                        case 'listMessageNode': return '#E0F2FE';
                        case 'catalogCarouselNode': return '#E0F2FE';
                        case 'singleSelectNode': return '#E0F2FE';
                        case 'imageTextButtonsNode': return '#EEF2FF';
                        case 'waitNode': return '#FEF3C7';
                        case 'conditionalNode': return '#E0E7FF';
                        case 'apiNode': return '#F3E8FF';
                        case 'endNode': return '#FFE2E2';
                        default: return '#ffffff';
                      }
                    }}
                    className="sm:block hidden"
                  />
                  <Background color="#aaa" gap={16} />

                  <Panel position="top-left">
                    <div className="bg-white shadow-md rounded-md p-2 sm:p-3 flex flex-row flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={flowName}
                        onChange={(e) => setFlowName(e.target.value)}
                        placeholder="Flow Name"
                        className="border rounded px-2 py-1 text-xs sm:text-sm w-full sm:w-32"
                      />
                      <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="flow-button flow-button-secondary py-1 px-2 text-xs sm:text-sm w-auto flex items-center justify-center rounded-md"
                      >
                        {sidebarOpen ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={handleSaveFlow}
                        className="flow-button flow-button-primary py-1 px-2 text-xs sm:text-sm w-auto flex items-center justify-center rounded-md"
                        title="Save Flow"
                      >
                        <Save size={14} className="mr-1 sm:mr-2" />
                        Save
                      </button>
                      <button
                        onClick={handleExportFlow}
                        className="flow-button flow-button-secondary py-1 px-2 text-xs sm:text-sm w-auto flex items-center justify-center rounded-md"
                        title="Export Flow"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={handleImportFlow}
                        className="flow-button flow-button-secondary py-1 px-2 text-xs sm:text-sm w-auto flex items-center justify-center rounded-md"
                        title="Import Flow"
                      >
                        <Upload size={14} />
                      </button>
                      <button
                        onClick={handleDeleteSelectedNodes}
                        className="flow-button flow-button-danger py-1 px-2 text-xs sm:text-sm w-auto flex items-center justify-center rounded-md"
                        title="Delete Selected"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={handleSimulateFlow}
                        className="flow-button flow-button-secondary py-1 px-2 text-xs sm:text-sm w-auto flex items-center justify-center rounded-md"
                        title="Simulate Flow"
                      >
                        <Play size={14} className="mr-1 sm:mr-2" />
                        Simulate
                      </button>
                      <div className="flex items-center space-x-2 w-auto">
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={isChatFlowEnabled}
                              onChange={() => setIsChatFlowEnabled(!isChatFlowEnabled)}
                              className="sr-only"
                            />
                            <div
                              className={`w-8 h-4 sm:w-10 sm:h-6 rounded-full shadow-inner ${
                                isChatFlowEnabled ? 'bg-green-400' : 'bg-gray-200'
                              }`}
                            >
                              <div
                                className={`absolute w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow transform transition duration-200 ease-in-out ${
                                  isChatFlowEnabled ? 'translate-x-4 sm:translate-x-6' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          </div>
                          <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                            <Workflow size={14} className="mr-1" />
                            Flows
                          </span>
                        </label>
                      </div>
                    </div>
                  </Panel>
                </ReactFlow>
              </div>
            </ReactFlowProvider>
          </div>

          {/* {propertiesOpen && selectedNode && (
            <div className="fixed inset-y-0 right-0 w-64 sm:w-80 bg-white shadow-lg z-50 sm:static sm:shadow-none transform sm:transform-none transition-transform duration-300 ease-in-out sm:flex sm:flex-col">
              <PropertyPanel
                node={selectedNode}
                onChange={updateNodeData}
                onClose={() => setPropertiesOpen(false)}
              />
            </div>
          )} */}
        </div>

        {simulatorOpen && (
          <FlowSimulator
            flow={reactFlowInstance?.toObject()}
            onClose={() => setSimulatorOpen(false)}
          />
        )}
      </div>
    </RequireSubscription>
  );
};

export default FlowBuilder;
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
import { Save, Trash2, Download, Upload, Play } from 'lucide-react';
import NodePanel from './NodePanel';
import PropertyPanel from './PropertyPanel';
import FlowSimulator from './FlowSimulator';
import { nodeTypes } from './nodes';
import useFlowStore from '../../store/flowStore';
import { exportFlow, importFlow } from '../../utils/flowUtils';
import RequireSubscription from '../Subscriptions/RequireSubscription';
const FlowBuilder = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [flowName, setFlowName] = useState('Flow 1');

  const { setCurrentFlow, saveFlow, fetchFlows } = useFlowStore();

  // Fetch flows on component mount
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

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Enforce single start node
      if (type === 'start' && nodes.some((node) => node.type === 'start')) {
        alert('Only one Start Flow node is allowed.');
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
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
      // Validate: Ensure exactly one start node
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
        // Validate imported flow: Ensure exactly one start node
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
          alert(`Failed to import flow: ${error.message}`);
        }
      }
    });
  }, [setNodes, setEdges, setCurrentFlow, saveFlow]);

  const handleDeleteSelectedNodes = useCallback(() => {
    // Get IDs of nodes to be deleted
    const deletedNodeIds = nodes
      .filter((node) => node.selected)
      .map((node) => node.id);

    // Remove edges connected to deleted nodes or selected edges
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !edge.selected &&
          !deletedNodeIds.includes(edge.source) &&
          !deletedNodeIds.includes(edge.target)
      )
    );

    // Remove selected nodes
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
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex">
        {sidebarOpen && (
          <div className="w-64 sidebar-panel">
            <NodePanel onClose={() => setSidebarOpen(false)} />
          </div>
        )}

        <div className="flex-grow relative">
          <ReactFlowProvider>
            <div className="h-full" ref={reactFlowWrapper}>
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
              >
                <Controls />
                <MiniMap
                  nodeStrokeColor={(n) => {
                    if (n.selected) return '#25D366';
                    return '#ddd';
                  }}
                  nodeColor={(n) => {
                    switch (n.type) {
                      case 'start':
                        return '#CCFBF1';
                      case 'messageNode':
                        return '#E0F2FE';

                      case 'listMessageNode':
                        return '#E0F2FE';
                      case 'singleSelectNode':
                        return '#E0F2FE';
                        
                      case 'imageTextButtonsNode':
                        return '#EEF2FF';
                      case 'waitNode':
                        return '#FEF3C7';
                      case 'conditionalNode':
                        return '#E0E7FF';
                      case 'apiNode':
                        return '#F3E8FF';
                      case 'endNode':
                        return '#FFE2E2';
                      default:
                        return '#ffffff';
                    }
                  }}
                />
                <Background color="#aaa" gap={16} />

                <Panel position="top-center">
                  <div className="bg-white shadow-md rounded-md p-2 flex items-center space-x-2">
                    <input
                      type="text"
                      value={flowName}
                      onChange={(e) => setFlowName(e.target.value)}
                      placeholder="Flow Name"
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="flow-button flow-button-secondary py-1 flex items-center"
                    >
                      {sidebarOpen ? 'Hide Nodes' : 'Show Nodes'}
                    </button>
                    <button
                      onClick={handleSaveFlow}
                      className="flow-button flow-button-primary py-1 flex items-center"
                      title="Save Flow"
                    >
                      <Save size={18} className="mr-1" />
                      Save
                    </button>
                    <button
                      onClick={handleExportFlow}
                      className="flow-button flow-button-secondary py-1"
                      title="Export Flow"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={handleImportFlow}
                      className="flow-button flow-button-secondary py-1"
                      title="Import Flow"
                    >
                      <Upload size={18} />
                    </button>
                    <button
                      onClick={handleDeleteSelectedNodes}
                      className="flow-button flow-button-danger py-1"
                      title="Delete Selected"
                    >
                      <Trash2 size={18} />
                    </button>
                    {/* <button
                      onClick={handleSimulateFlow}
                      className="flow-button flow-button-secondary py-1 flex items-center"
                      title="Simulate Flow"
                    >
                      <Play size={18} className="mr-1" />
                      Simulate
                    </button> */}
                  </div>
                </Panel>
              </ReactFlow>
            </div>
          </ReactFlowProvider>
        </div>
          
        {/* {propertiesOpen && selectedNode && (
          <div className="w-80 sidebar-panel">
            <PropertyPanel
              node={selectedNode}
              onChange={updateNodeData}
              onClose={() => setPropertiesOpen(false)}
            />
          </div>
        )} */}
      </div>

      {/* {simulatorOpen && (
        <FlowSimulator
          flow={reactFlowInstance?.toObject()}
          onClose={() => setSimulatorOpen(false)}
        />
      )} */}
    </div>
    </RequireSubscription>
  );
};

export default FlowBuilder;
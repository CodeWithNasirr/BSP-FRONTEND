import { useState, useRef, useCallback } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
import FlowCanvas from './FlowCanvas';
import { useTouchDrag } from './useTouchDrag';

const ParentComponent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [flowName, setFlowName] = useState('');
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchDrag(reactFlowWrapper, reactFlowInstance);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type} Node` },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    // Handle node click (e.g., open properties panel)
  }, []);

  const handleSaveFlow = useCallback(() => {
    // Save flow logic
  }, []);

  const handleExportFlow = useCallback(() => {
    // Export flow logic
  }, []);

  const handleImportFlow = useCallback(() => {
    // Import flow logic
  }, []);

  const handleDeleteSelectedNodes = useCallback(() => {
    // Delete selected nodes logic
  }, []);

  return (
    <ReactFlowProvider>
      <FlowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        setReactFlowInstance={setReactFlowInstance}
        reactFlowWrapper={reactFlowWrapper}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        flowName={flowName}
        setFlowName={setFlowName}
        handleSaveFlow={handleSaveFlow}
        handleExportFlow={handleExportFlow}
        handleImportFlow={handleImportFlow}
        handleDeleteSelectedNodes={handleDeleteSelectedNodes}
        nodeTypes={nodeTypes}
        touchDragHandlers={{ handleTouchStart, handleTouchMove, handleTouchEnd }}
      />
    </ReactFlowProvider>
  );
};

export default ParentComponent;
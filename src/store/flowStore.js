import { create } from 'zustand';

const useFlowStore = create((set) => ({
  // Current flow data
  flow: null,
  
  // All saved flows 
  savedFlows: [],
  
  // Set the current flow
  setCurrentFlow: (flow) => set({ flow }),
  
  // Save the current flow
  saveFlow: (flow) => set((state) => {
    // Give the flow a unique ID if it doesn't have one
    const flowToSave = {
      ...flow,
      id: flow.id || `flow-${Date.now()}`,
      name: flow.name || `Flow ${state.savedFlows.length + 1}`,
      createdAt: flow.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Check if this flow already exists by ID
    const existingFlowIndex = state.savedFlows.findIndex(f => f.id === flowToSave.id);
    
    if (existingFlowIndex >= 0) {
      // Update existing flow
      const updatedFlows = [...state.savedFlows];
      updatedFlows[existingFlowIndex] = flowToSave;
      return { savedFlows: updatedFlows, flow: flowToSave };
    } else {
      // Add new flow
      return { 
        savedFlows: [...state.savedFlows, flowToSave],
        flow: flowToSave
      };
    }
  }),
  
  // Delete a flow
  deleteFlow: (flowId) => set((state) => ({
    savedFlows: state.savedFlows.filter(flow => flow.id !== flowId),
    flow: state.flow && state.flow.id === flowId ? null : state.flow
  })),
  
  // Duplicate a flow
  duplicateFlow: (flowId) => set((state) => {
    const flowToDuplicate = state.savedFlows.find(flow => flow.id === flowId);
    
    if (!flowToDuplicate) return state;
    
    const duplicatedFlow = {
      ...flowToDuplicate,
      id: `flow-${Date.now()}`,
      name: `${flowToDuplicate.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return {
      savedFlows: [...state.savedFlows, duplicatedFlow]
    };
  })
}));

export default useFlowStore;
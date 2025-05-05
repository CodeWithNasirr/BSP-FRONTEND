import { create } from 'zustand';
import axios from 'axios';
import API_BASE_URL from '../config';
const URL = `${API_BASE_URL}/api/chatbot-flows/`;

 
const useFlowStore = create((set) => ({
  // Current flow data
  flow: null,
  // Single saved flow (array with at most one item)
  savedFlows: [],

  // Set the current flow
  setCurrentFlow: (flow) => set({ flow }),

  // Fetch the single flow from the backend
  fetchFlows: async () => {
    try {
      const token = localStorage.getItem('authToken'); // Adjust based on your auth setup
      const response = await axios.get(URL, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Keep only the most recent flow (if multiple exist)
      const flows = response.data
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 1)
        .map((flow) => ({
          id: flow.id,
          name: flow.name,
          ...flow.flow_data, // Spread nodes and edges
          createdAt: flow.created_at,
          updatedAt: flow.updated_at,
        }));

      set({ savedFlows: flows, flow: flows[0] || null });
      return flows;
    } catch (error) {
      console.error('Error fetching flows:', error);
      return [];
    }
  },

  // Save or update the single flow
  saveFlow: async (flow) => {
    try {
      const token = localStorage.getItem('authToken'); // Adjust based on your auth setup
      const state = useFlowStore.getState();
      const existingFlow = state.savedFlows[0]; // Only one flow allowed

      const flowToSave = {
        ...flow,
        id: existingFlow ? existingFlow.id : `flow-${Date.now()}`, // Temp ID for new flow
        name: flow.name || existingFlow?.name || 'Flow 1',
        createdAt: existingFlow ? existingFlow.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Prepare payload for backend
      const payload = {
        name: flowToSave.name,
        flow_data: {
          nodes: flowToSave.nodes || [],
          edges: flowToSave.edges || [],
        },
        language: 'en', // Adjust as needed
      };

      let response;
      if (existingFlow && String(existingFlow.id).startsWith('flow-') === false) {
        try {
          response = await axios.put(`${URL}${existingFlow.id}/`, payload, {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (error) {
          if (error.response?.status === 404) {
            // Flow not found, clear savedFlows and create new
            // set({ savedFlows: [], flow: null });
            response = await axios.post(URL, payload, {
              headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json',
              },
            });
          } else {
            throw error;
          }
        }
      } else {
        response = await axios.post(URL, payload, {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }


      const savedFlow = {
        id: response.data.id,
        name: response.data.name,
        ...response.data.flow_data,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
      };

      return set({
        savedFlows: [savedFlow], // Always keep only one flow
        flow: savedFlow,
      });
    } catch (error) {
      console.error('Error saving flow:', error);
      throw error;
    }
  },

  // Delete the single flow
  deleteFlow: () => set({
    savedFlows: [],
    flow: null,
  }),
}));

export default useFlowStore;
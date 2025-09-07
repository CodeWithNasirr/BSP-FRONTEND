import MessageNode from './MessageNode';
import WaitNode from './WaitNode';
import ConditionalNode from './ConditionalNode';
import ApiNode from './ApiNode';
import EndNode from './EndNode';
import LeadCollectorNode from './LeadCollectorNode';
// import MetaFlowNode from './MetaFlowNode';
import CatalogCarouselNode from './CatalogCarouselNode';
import Appointment_Booking from './Appointment_Booking';
import TextButtonsNode from './TextButtonsNode';
import TextImageNode from './TextImageNode';
import ListMessageNode from './ListMessageNode';
import { Handle, Position } from 'reactflow';
import { SquarePower } from 'lucide-react';
 
const nodeStyles = {
  base: 'p-3 rounded-lg shadow-md flex items-center space-x-2 min-w-[150px]',
  start: 'bg-teal-100 border-teal-300',
};

const StartNode = ({ data }) => (
  <div className={`${nodeStyles.base} ${nodeStyles.start}`}>
    <SquarePower size={20} className="text-teal-600" />
    <span className="font-medium">{data.label || 'Start Flow'}</span>
    <Handle type="source" position={Position.Bottom} id="source" />
  </div>
);

export const nodeTypes = {
  start: StartNode,
  messageNode: MessageNode,
  waitNode: WaitNode,
  conditionalNode: ConditionalNode,
  apiNode: ApiNode,
  endNode: EndNode,
  textButtonsNode: TextButtonsNode,
  imageTextButtonsNode:TextImageNode,
  listMessageNode: ListMessageNode,
  // metaFlowNode: MetaFlowNode,
  catalogCarouselNode: CatalogCarouselNode, // ✅ Add this
  appointment: Appointment_Booking, // ✅ Add this
  leadcollector: LeadCollectorNode, // ✅ Add this
};
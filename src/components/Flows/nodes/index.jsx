import MessageNode from './MessageNode';
import WaitNode from './WaitNode';
import ConditionalNode from './ConditionalNode';
import ApiNode from './ApiNode';
import EndNode from './EndNode';
import LeadCollectorNode from './LeadCollectorNode';
// import MetaFlowNode from './MetaFlowNode';
import CatalogCarouselNode from './CatalogCarouselNode';
import PaymentMethodNode from './PaymentMethodNode';
import Appointment_Booking from './Appointment_Booking';
import TextButtonsNode from './TextButtonsNode';
import TextImageNode from './TextImageNode';
import ListMessageNode from './ListMessageNode';
import BookingNode from './BookingNode';
import KeywordListenerNode from './KeywordListenerNode';
import MediaConditionNode from './MediaConditionNode';

import { Handle, Position } from 'reactflow';
import { SquarePower } from 'lucide-react';
 
const nodeStyles = {
  base: 'p-3 rounded-lg shadow-md flex items-center space-x-2 min-w-[150px]',
  start: 'bg-teal-100 border-teal-300',
};

const StartNode = ({ data, selected }) => (
  <div
    className={`p-3 rounded-xl shadow-md flex items-center space-x-2 min-w-[150px] border transition-colors ${
      selected
        ? 'bg-teal-100 dark:bg-teal-500/20 border-teal-400 dark:border-teal-400'
        : 'bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20'
    }`}
  >
    <SquarePower size={20} className="text-teal-600 dark:text-teal-400 shrink-0" />
    <span className="font-bold text-sm text-teal-800 dark:text-teal-300">
      {data.label || 'Start Flow'}
    </span>
    <Handle type="source" position={Position.Bottom} id="source" className="!bg-teal-500" />
  </div>
);

export const nodeTypes = {
  start: StartNode,
  messageNode: MessageNode,
  waitNode: WaitNode,
  conditionalNode: ConditionalNode,
  apiNode: ApiNode,
  // bookingNode: BookingNode,
  endNode: EndNode,
  textButtonsNode: TextButtonsNode,
  imageTextButtonsNode:TextImageNode,
  listMessageNode: ListMessageNode,
  // metaFlowNode: MetaFlowNode,
  catalogCarouselNode: CatalogCarouselNode, 
  appointment: Appointment_Booking, 
  leadcollector: LeadCollectorNode, 
  // paymentMethodNode: PaymentMethodNode, 
  keywordListenerNode: KeywordListenerNode,
  mediaConditionNode: MediaConditionNode,  // NEW — routes by media type
 
};
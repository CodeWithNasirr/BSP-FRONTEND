import MessageNode from './MessageNode';
import WaitNode from './WaitNode';
import ConditionalNode from './ConditionalNode';
import ApiNode from './ApiNode';
import EndNode from './EndNode';
import TextButtonsNode from './TextButtonsNode';

export const nodeTypes = {
  messageNode: MessageNode,
  waitNode: WaitNode,
  conditionalNode: ConditionalNode,
  apiNode: ApiNode,
  endNode: EndNode,
  textButtonsNode: TextButtonsNode,
};
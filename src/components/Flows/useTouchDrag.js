import { useRef, useEffect } from 'react';

export const useTouchDrag = (reactFlowWrapper, reactFlowInstance, setNodes, nodes) => {
  const touchData = useRef(null);
  const isProcessing = useRef(false);

  const getDefaultDataForType = (type) => {
    switch (type) {
      case 'start':
        return { label: 'Start Flow' };
      case 'messageNode':
        return { message: 'Hello, welcome to our WhatsApp bot!', mediaUrl: '',follow_ups: [] };
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
        return {delay_seconds: 5};
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

      case 'mediaConditionNode':
        return {
          allowed_types: ['image', 'document'],
          fallback_message: 'Please send an image or document.',
        };
        
      default:
        return {};
    }
  };

  const handleTouchStart = (event, nodeType) => {
    event.stopPropagation();
    event.preventDefault();
    if (isProcessing.current) return;

    const touch = event.touches[0];
    touchData.current = {
      nodeType,
      startX: touch.clientX,
      startY: touch.clientY,
      isWithinBounds: false,
    };
  };

  const handleTouchMove = (event) => {
    if (!touchData.current || isProcessing.current) return;
    event.stopPropagation();

    const touch = event.touches[0];
    const wrapper = reactFlowWrapper.current;
    if (!wrapper) return;

    const bounds = wrapper.getBoundingClientRect();
    const dragElement = touchData.current.dragElement || document.createElement('div');
    dragElement.style.position = 'fixed';
    dragElement.style.left = `${touch.clientX}px`;
    dragElement.style.top = `${touch.clientY}px`;
    dragElement.style.transform = 'translate(-50%, -50%)';
    dragElement.style.padding = '8px';
    dragElement.style.background = '#fff';
    dragElement.style.border = '1px solid #ddd';
    dragElement.style.borderRadius = '4px';
    dragElement.style.zIndex = '1000';
    dragElement.style.pointerEvents = 'none';
    dragElement.innerText = touchData.current.nodeType;

    if (!touchData.current.dragElement) {
      document.body.appendChild(dragElement);
      touchData.current.dragElement = dragElement;
    }

    touchData.current.isWithinBounds = 
      touch.clientX >= bounds.left &&
      touch.clientX <= bounds.right &&
      touch.clientY >= bounds.top &&
      touch.clientY <= bounds.bottom;
  };

  const handleTouchEnd = (event) => {
    if (!touchData.current || !reactFlowInstance || !reactFlowWrapper.current || isProcessing.current) {
      if (touchData.current?.dragElement) {
        touchData.current.dragElement.remove();
      }
      touchData.current = null;
      isProcessing.current = false;
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    isProcessing.current = true;

    if (!touchData.current.isWithinBounds) {
      if (touchData.current.dragElement) {
        touchData.current.dragElement.remove();
      }
      touchData.current = null;
      isProcessing.current = false;
      return;
    }

    const touch = event.changedTouches[0];
    const wrapper = reactFlowWrapper.current;
    const bounds = wrapper.getBoundingClientRect();
    const clientX = Math.max(0, Math.min(touch.clientX - bounds.left, bounds.width));
    const clientY = Math.max(0, Math.min(touch.clientY - bounds.top, bounds.height));

    if (touchData.current.nodeType === 'start' && nodes.some((node) => node.type === 'start')) {
      alert('Only one Start Flow node is allowed.');
      if (touchData.current.dragElement) {
        touchData.current.dragElement.remove();
      }
      touchData.current = null;
      isProcessing.current = false;
      return;
    }

    const flowPosition = reactFlowInstance.screenToFlowPosition({
      x: clientX,
      y: clientY,
    });

    const newNode = {
      id: `${touchData.current.nodeType}-${Date.now()}`,
      type: touchData.current.nodeType,
      position: flowPosition,
      data: {
        label: `${touchData.current.nodeType} Node`,
        ...getDefaultDataForType(touchData.current.nodeType),
      },
    };

    setNodes((nds) => [...nds, newNode]);

    if (touchData.current.dragElement) {
      touchData.current.dragElement.remove();
    }
    touchData.current = null;

    setTimeout(() => {
      isProcessing.current = false;
    }, 100);
  };

  // Add touchmove event listener with passive: false
  useEffect(() => {
    const wrapper = reactFlowWrapper.current;
    if (!wrapper) return;

    wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      wrapper.removeEventListener('touchmove', handleTouchMove, { passive: false });
    };
  }, [reactFlowWrapper]);

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};
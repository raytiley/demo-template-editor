import { useCallback, useRef, useState, useEffect } from 'react';

export type DragMode = 'none' | 'move' | 'resize-e' | 'resize-s' | 'resize-se';

interface DragState {
  mode: DragMode;
  startX: number;
  startY: number;
  startBlockX: number;
  startBlockY: number;
  startBlockWidth: number;
  startBlockHeight: number;
}

interface BlockBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseBlockInteractionsOptions {
  block: BlockBounds;
  scaleFactor: number;
  templateWidth: number;
  templateHeight: number;
  isSelected: boolean;
  onUpdate: (updates: Partial<BlockBounds>) => void;
  onSelect: () => void;
  minSize?: number;
}

interface UseBlockInteractionsResult {
  isDragging: boolean;
  dragMode: DragMode;
  handleMouseDown: (e: React.MouseEvent, mode?: DragMode) => void;
  handleTouchStart: (e: React.TouchEvent, mode?: DragMode) => void;
}

/**
 * Hook for handling block drag-to-move and resize interactions.
 * Supports both mouse and touch input.
 */
export function useBlockInteractions({
  block,
  scaleFactor,
  templateWidth,
  templateHeight,
  isSelected,
  onUpdate,
  onSelect,
  minSize = 20,
}: UseBlockInteractionsOptions): UseBlockInteractionsResult {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const dragStateRef = useRef<DragState | null>(null);

  /**
   * Start drag operation
   */
  const startDrag = useCallback(
    (clientX: number, clientY: number, mode: DragMode) => {
      // Select the block if not already selected
      if (!isSelected) {
        onSelect();
      }

      // Only allow resize if selected
      if (mode !== 'move' && !isSelected) {
        return;
      }

      dragStateRef.current = {
        mode,
        startX: clientX,
        startY: clientY,
        startBlockX: block.x,
        startBlockY: block.y,
        startBlockWidth: block.width,
        startBlockHeight: block.height,
      };

      setIsDragging(true);
      setDragMode(mode);
    },
    [block, isSelected, onSelect]
  );

  /**
   * Handle drag movement
   */
  const handleDrag = useCallback(
    (clientX: number, clientY: number) => {
      const state = dragStateRef.current;
      if (!state || state.mode === 'none') return;

      // Calculate delta in template coordinates (accounting for scale)
      const deltaX = (clientX - state.startX) / scaleFactor;
      const deltaY = (clientY - state.startY) / scaleFactor;

      let updates: Partial<BlockBounds> = {};

      switch (state.mode) {
        case 'move': {
          // Calculate new position with bounds checking
          let newX = state.startBlockX + deltaX;
          let newY = state.startBlockY + deltaY;

          // Constrain to template bounds
          newX = Math.max(0, Math.min(templateWidth - block.width, newX));
          newY = Math.max(0, Math.min(templateHeight - block.height, newY));

          updates = { x: Math.round(newX), y: Math.round(newY) };
          break;
        }

        case 'resize-e': {
          // Resize from east (right) edge
          let newWidth = state.startBlockWidth + deltaX;
          newWidth = Math.max(minSize, Math.min(templateWidth - block.x, newWidth));
          updates = { width: Math.round(newWidth) };
          break;
        }

        case 'resize-s': {
          // Resize from south (bottom) edge
          let newHeight = state.startBlockHeight + deltaY;
          newHeight = Math.max(minSize, Math.min(templateHeight - block.y, newHeight));
          updates = { height: Math.round(newHeight) };
          break;
        }

        case 'resize-se': {
          // Resize from southeast corner
          let newWidth = state.startBlockWidth + deltaX;
          let newHeight = state.startBlockHeight + deltaY;
          newWidth = Math.max(minSize, Math.min(templateWidth - block.x, newWidth));
          newHeight = Math.max(minSize, Math.min(templateHeight - block.y, newHeight));
          updates = { width: Math.round(newWidth), height: Math.round(newHeight) };
          break;
        }
      }

      if (Object.keys(updates).length > 0) {
        onUpdate(updates);
      }
    },
    [block.x, block.y, block.width, block.height, scaleFactor, templateWidth, templateHeight, minSize, onUpdate]
  );

  /**
   * End drag operation
   */
  const endDrag = useCallback(() => {
    dragStateRef.current = null;
    setIsDragging(false);
    setDragMode('none');
  }, []);

  /**
   * Mouse event handlers
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, mode: DragMode = 'move') => {
      e.preventDefault();
      e.stopPropagation();
      startDrag(e.clientX, e.clientY, mode);
    },
    [startDrag]
  );

  /**
   * Touch event handlers
   */
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, mode: DragMode = 'move') => {
      if (e.touches.length !== 1) return;
      e.stopPropagation();
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY, mode);
    },
    [startDrag]
  );

  /**
   * Set up global mouse/touch move and end handlers
   */
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      endDrag();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      handleDrag(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      endDrag();
    };

    // Add global listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleDrag, endDrag]);

  return {
    isDragging,
    dragMode,
    handleMouseDown,
    handleTouchStart,
  };
}

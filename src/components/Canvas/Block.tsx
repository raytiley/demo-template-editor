import { useCallback, useState, useEffect, useRef } from 'react';
import type { Block as BlockType } from '../../types';
import { useEditorStore } from '../../stores';
import { buildRenderUrl } from '../../services/renderService';
import { apiService } from '../../services/apiService';
import { useBlockInteractions } from '../../hooks';
import type { DragMode } from '../../hooks';
import styles from './Canvas.module.css';

interface BlockProps {
  block: BlockType;
  scaleFactor: number;
  templateWidth: number;
  templateHeight: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

/**
 * Individual block rendered on the canvas.
 * Displays the server-rendered image of the block.
 * Supports drag-to-move and resize interactions.
 */
export function Block({
  block,
  scaleFactor,
  templateWidth,
  templateHeight,
  isSelected,
  onSelect,
  onDragStart,
  onDragEnd,
}: BlockProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const deleteBlock = useEditorStore((state) => state.deleteBlock);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const blockRef = useRef<HTMLDivElement>(null);

  // Drag and resize interaction handling
  const { isDragging, dragMode, handleMouseDown, handleTouchStart } = useBlockInteractions({
    block: {
      x: block.x,
      y: block.y,
      width: block.width,
      height: block.height,
    },
    scaleFactor,
    templateWidth,
    templateHeight,
    isSelected,
    onUpdate: (updates) => updateBlock(block.id, updates),
    onSelect,
    minSize: 20,
  });

  // Notify parent of drag state changes
  useEffect(() => {
    if (isDragging && onDragStart) {
      onDragStart();
    } else if (!isDragging && onDragEnd) {
      onDragEnd();
    }
  }, [isDragging, onDragStart, onDragEnd]);

  // Build render URL whenever block properties change (debounced via image preload)
  useEffect(() => {
    const apiConfig = apiService.getConfig();
    const url = buildRenderUrl(block, {
      templateSize: { width: templateWidth, height: templateHeight },
      apiBaseUrl: apiConfig?.baseUrl,
    });
    setIsLoading(true);

    // Preload image to avoid flicker
    const img = new Image();
    img.onload = () => {
      setImageUrl(url);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };
    img.src = url;
  }, [block, templateWidth, templateHeight]);

  // Handle click to select (only if not dragging)
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isDragging) {
        onSelect();
      }
    },
    [onSelect, isDragging]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isSelected) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
        return;
      }

      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          updateBlock(block.id, { y: Math.max(0, block.y - step) });
          break;
        case 'ArrowDown':
          e.preventDefault();
          updateBlock(block.id, { y: Math.min(templateHeight - block.height, block.y + step) });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          updateBlock(block.id, { x: Math.max(0, block.x - step) });
          break;
        case 'ArrowRight':
          e.preventDefault();
          updateBlock(block.id, { x: Math.min(templateWidth - block.width, block.x + step) });
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          deleteBlock(block.id);
          break;
      }
    },
    [isSelected, block, updateBlock, deleteBlock, templateWidth, templateHeight, onSelect]
  );

  // Handle resize handle mouse/touch events
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, mode: DragMode) => {
      e.stopPropagation();
      handleMouseDown(e, mode);
    },
    [handleMouseDown]
  );

  const handleResizeTouchStart = useCallback(
    (e: React.TouchEvent, mode: DragMode) => {
      e.stopPropagation();
      handleTouchStart(e, mode);
    },
    [handleTouchStart]
  );

  // Calculate position and size in screen coordinates
  const style: React.CSSProperties = {
    left: block.x * scaleFactor,
    top: block.y * scaleFactor,
    width: block.width * scaleFactor,
    height: block.height * scaleFactor,
    zIndex: 50 - (block.id ? 1 : 0), // Will be managed by z-order later
    cursor: isDragging && dragMode === 'move' ? 'grabbing' : 'grab',
  };

  // Apply rotation if set
  if (block.rotateDegrees && block.rotateDegrees !== 0) {
    style.transform = `rotate(${block.rotateDegrees}deg)`;
  }

  return (
    <div
      ref={blockRef}
      className={`${styles.block} ${isSelected ? styles.blockSelected : ''} ${isDragging ? styles.blockDragging : ''}`}
      style={style}
      onClick={handleClick}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
      onTouchStart={(e) => handleTouchStart(e, 'move')}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${block.blockType} block: ${block.name}. Position ${Math.round(block.x)}, ${Math.round(block.y)}. Size ${Math.round(block.width)} by ${Math.round(block.height)}`}
      aria-pressed={isSelected}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${block.blockType}: ${block.name}`}
          className={`${styles.blockContent} ${isLoading ? styles.blockLoading : ''}`}
          draggable={false}
        />
      ) : (
        <div className={styles.blockPlaceholder}>
          {isLoading ? 'Loading...' : block.blockType}
        </div>
      )}

      {/* Selection overlay with resize handles */}
      {isSelected && (
        <div className={styles.selectionOverlay}>
          <div
            className={`${styles.resizeHandle} ${styles.handleE}`}
            data-handle="e"
            onMouseDown={(e) => handleResizeMouseDown(e, 'resize-e')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'resize-e')}
            role="slider"
            aria-label="Resize width"
            aria-orientation="horizontal"
            tabIndex={-1}
          />
          <div
            className={`${styles.resizeHandle} ${styles.handleS}`}
            data-handle="s"
            onMouseDown={(e) => handleResizeMouseDown(e, 'resize-s')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'resize-s')}
            role="slider"
            aria-label="Resize height"
            aria-orientation="vertical"
            tabIndex={-1}
          />
          <div
            className={`${styles.resizeHandle} ${styles.handleSE}`}
            data-handle="se"
            onMouseDown={(e) => handleResizeMouseDown(e, 'resize-se')}
            onTouchStart={(e) => handleResizeTouchStart(e, 'resize-se')}
            role="slider"
            aria-label="Resize width and height"
            tabIndex={-1}
          />
        </div>
      )}
    </div>
  );
}

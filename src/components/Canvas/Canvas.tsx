import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../stores';
import { buildBackgroundUrl } from '../../services/renderService';
import { apiService } from '../../services/apiService';
import { useSnapGuides, usePinchZoom } from '../../hooks';
import { Block } from './Block';
import styles from './Canvas.module.css';

/**
 * Main canvas component that displays the template with all blocks.
 * Handles scaling, background, block rendering, and snap guides.
 */
export function Canvas() {
  const template = useEditorStore((state) => state.template);
  const selectedBlockId = useEditorStore((state) => state.selectedBlockId);
  const scaleFactor = useEditorStore((state) => state.scaleFactor);
  const selectBlock = useEditorStore((state) => state.selectBlock);
  const setScaleFactor = useEditorStore((state) => state.setScaleFactor);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Pinch-to-zoom support for touch devices
  const pinchZoomRef = usePinchZoom({
    onZoom: setScaleFactor,
    currentScale: scaleFactor,
    minScale: 0.1,
    maxScale: 3,
  });

  // Track which block is being dragged (for snap guides)
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);

  // Get snap guides for the currently dragging block
  const snapGuides = useSnapGuides({
    draggingBlockId,
    blocks: template?.blocks || [],
    templateWidth: template?.width || 0,
    templateHeight: template?.height || 0,
    snapThreshold: 10,
  });

  // Calculate optimal scale factor to fit canvas in container
  const calculateFitScale = useCallback(() => {
    if (!wrapperRef.current || !template) return 1;

    const wrapper = wrapperRef.current;
    const padding = 48; // Padding around canvas
    const availableWidth = wrapper.clientWidth - padding;
    const availableHeight = wrapper.clientHeight - padding;

    const scaleX = availableWidth / template.width;
    const scaleY = availableHeight / template.height;

    return Math.min(scaleX, scaleY, 1);
  }, [template]);

  // Combine refs for wrapper (resize observer + pinch zoom)
  const setWrapperRef = useCallback(
    (el: HTMLDivElement | null) => {
      // Set our local ref
      (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      // Set pinch zoom ref
      (pinchZoomRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    },
    [pinchZoomRef]
  );

  // Update scale factor on resize
  useEffect(() => {
    const updateScale = () => {
      setScaleFactor(calculateFitScale());
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [calculateFitScale, setScaleFactor]);

  // Handle click on canvas background (deselect)
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      // Only deselect if clicking directly on canvas, not on a block
      if (e.target === e.currentTarget || (canvasRef.current && e.target === canvasRef.current)) {
        selectBlock(null);
      }
    },
    [selectBlock]
  );

  // Handle keyboard navigation on canvas
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!template) return;

      switch (e.key) {
        case 'Escape':
          selectBlock(null);
          break;

        case 'Tab': {
          // Cycle through blocks
          if (template.blocks.length === 0) return;
          e.preventDefault();

          const currentIndex = selectedBlockId
            ? template.blocks.findIndex((b) => b.id === selectedBlockId)
            : -1;

          let nextIndex: number;
          if (e.shiftKey) {
            // Shift+Tab: go backwards
            nextIndex = currentIndex <= 0 ? template.blocks.length - 1 : currentIndex - 1;
          } else {
            // Tab: go forwards
            nextIndex = currentIndex >= template.blocks.length - 1 ? 0 : currentIndex + 1;
          }

          selectBlock(template.blocks[nextIndex].id);
          break;
        }
      }
    },
    [template, selectedBlockId, selectBlock]
  );

  // Zoom controls
  const handleZoomIn = () => setScaleFactor(Math.min(scaleFactor + 0.1, 3));
  const handleZoomOut = () => setScaleFactor(Math.max(scaleFactor - 0.1, 0.1));
  const handleZoomFit = () => setScaleFactor(calculateFitScale());

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScaleFactor(Math.max(0.1, Math.min(3, scaleFactor + delta)));
      }
    },
    [scaleFactor, setScaleFactor]
  );

  if (!template) {
    return (
      <div className={styles.canvasWrapper} ref={setWrapperRef}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📄</div>
          <div className={styles.emptyStateText}>No template loaded</div>
          <div className={styles.emptyStateHint}>
            Waiting for template data...
          </div>
        </div>
      </div>
    );
  }

  const apiConfig = apiService.getConfig();
  const backgroundUrl = buildBackgroundUrl(template.backgroundID, apiConfig?.baseUrl);

  return (
    <div
      className={styles.canvasWrapper}
      ref={setWrapperRef}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Canvas */}
      <div
        ref={canvasRef}
        className={styles.canvas}
        style={{
          width: template.width * scaleFactor,
          height: template.height * scaleFactor,
        }}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        role="application"
        aria-label={`Template canvas: ${template.name}, ${template.width}x${template.height} pixels`}
      >
        {/* Background image */}
        {backgroundUrl && (
          <img
            src={backgroundUrl}
            alt="Template background"
            className={styles.background}
          />
        )}

        {/* Snap guides */}
        {snapGuides.map((guide, index) => (
          <div
            key={`guide-${guide.type}-${index}`}
            className={`${styles.snapGuide} ${
              guide.type === 'horizontal' ? styles.snapGuideH : styles.snapGuideV
            }`}
            style={
              guide.type === 'horizontal'
                ? { top: guide.position * scaleFactor }
                : { left: guide.position * scaleFactor }
            }
          />
        ))}

        {/* Blocks container */}
        <div className={styles.blocksContainer}>
          {template.blocks.map((block) => (
            <Block
              key={block.id}
              block={block}
              scaleFactor={scaleFactor}
              templateWidth={template.width}
              templateHeight={template.height}
              isSelected={block.id === selectedBlockId}
              onSelect={() => selectBlock(block.id)}
              onDragStart={() => setDraggingBlockId(block.id)}
              onDragEnd={() => setDraggingBlockId(null)}
            />
          ))}
        </div>

        {/* Empty state for no blocks */}
        {template.blocks.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>➕</div>
            <div className={styles.emptyStateText}>No blocks yet</div>
            <div className={styles.emptyStateHint}>
              Add a text or shape block to get started
            </div>
          </div>
        )}
      </div>

      {/* Zoom controls */}
      <div
        className={styles.zoomControls}
        role="toolbar"
        aria-label="Zoom controls"
      >
        <button
          className={styles.zoomButton}
          onClick={handleZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>
        <span className={styles.zoomLevel} aria-live="polite">
          {Math.round(scaleFactor * 100)}%
        </span>
        <button
          className={styles.zoomButton}
          onClick={handleZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>
        <button
          className={styles.zoomButton}
          onClick={handleZoomFit}
          aria-label="Fit to window"
          title="Fit to window"
        >
          ⊡
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className={styles.shortcutsHint} aria-hidden="true">
        <span>Tab: cycle blocks</span>
        <span>Arrow keys: move</span>
        <span>Shift+Arrow: move 10px</span>
        <span>Delete: remove</span>
        <span>Ctrl+Scroll: zoom</span>
      </div>
    </div>
  );
}

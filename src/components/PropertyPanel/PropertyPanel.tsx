import { useCallback } from 'react';
import { useEditorStore, useSelectedBlock } from '../../stores';
import { PropertySection } from './PropertySection';
import { PositionPanel } from './panels/PositionPanel';
import { TextPanel } from './panels/TextPanel';
import { FontPanel } from './panels/FontPanel';
import { TextEffectsPanel } from './panels/TextEffectsPanel';
import { ShapePanel } from './panels/ShapePanel';
import { ShapeEffectsPanel } from './panels/ShapeEffectsPanel';
import { MediaPanel } from './panels/MediaPanel';
import styles from './PropertyPanel.module.css';

/**
 * Property panel sidebar for editing the selected block's properties.
 * Shows different property sections based on block type.
 */
export function PropertyPanel() {
  const selectedBlock = useSelectedBlock();
  const deleteBlock = useEditorStore((state) => state.deleteBlock);

  const handleDelete = useCallback(() => {
    if (selectedBlock) {
      deleteBlock(selectedBlock.id);
    }
  }, [selectedBlock, deleteBlock]);

  if (!selectedBlock) {
    return (
      <div className={styles.propertyPanel}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>&#9998;</div>
          <div className={styles.emptyStateText}>
            Select a block to edit its properties
          </div>
        </div>
      </div>
    );
  }

  const blockType = selectedBlock.blockType;
  const isTextBlock = blockType === 'Text';
  const isShapeBlock = blockType === 'Rectangle' || blockType === 'Ellipse';
  const isMediaBlock = blockType === 'Picture' || blockType === 'WebPicture' || blockType === 'Video';

  return (
    <div className={styles.propertyPanel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>
          {selectedBlock.name}
          <span className={styles.blockType}> ({blockType})</span>
        </h2>
      </div>

      <div className={styles.panelBody}>
        {/* Position & Size - all block types */}
        <PropertySection title="Position & Size" defaultExpanded={true}>
          <PositionPanel block={selectedBlock} />
        </PropertySection>

        {/* Text Content - Text blocks only */}
        {isTextBlock && (
          <PropertySection title="Text" defaultExpanded={true}>
            <TextPanel block={selectedBlock} />
          </PropertySection>
        )}

        {/* Font - Text blocks only */}
        {isTextBlock && (
          <PropertySection title="Font" defaultExpanded={true}>
            <FontPanel block={selectedBlock} />
          </PropertySection>
        )}

        {/* Text Effects - Text blocks only */}
        {isTextBlock && (
          <PropertySection title="Text Effects" defaultExpanded={false}>
            <TextEffectsPanel block={selectedBlock} />
          </PropertySection>
        )}

        {/* Media - Picture/WebPicture/Video blocks */}
        {isMediaBlock && (
          <PropertySection title="Media" defaultExpanded={true}>
            <MediaPanel block={selectedBlock} />
          </PropertySection>
        )}

        {/* Shape Fill & Outline - all blocks have background options */}
        <PropertySection title="Fill & Outline" defaultExpanded={!isTextBlock}>
          <ShapePanel block={selectedBlock} />
        </PropertySection>

        {/* Shape Effects - shadow, reflection */}
        <PropertySection title="Effects" defaultExpanded={false}>
          <ShapeEffectsPanel block={selectedBlock} />
        </PropertySection>

        {/* Delete button */}
        <div style={{ padding: '0 var(--space-md)' }}>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={handleDelete}
            aria-label={`Delete ${selectedBlock.name}`}
          >
            <span aria-hidden="true">&#128465;</span>
            Delete Block
          </button>
        </div>
      </div>
    </div>
  );
}

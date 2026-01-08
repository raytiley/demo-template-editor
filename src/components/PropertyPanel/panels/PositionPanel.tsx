import { useCallback } from 'react';
import type { Block } from '../../../types';
import { useEditorStore } from '../../../stores';
import { NumericInput } from '../../shared';
import styles from '../PropertyPanel.module.css';

interface PositionPanelProps {
  block: Block;
}

/**
 * Panel for editing block position (x, y) and size (width, height).
 */
export function PositionPanel({ block }: PositionPanelProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const template = useEditorStore((state) => state.template);

  const maxX = template ? template.width - block.width : 9999;
  const maxY = template ? template.height - block.height : 9999;
  const maxWidth = template ? template.width - block.x : 9999;
  const maxHeight = template ? template.height - block.y : 9999;

  const handleXChange = useCallback(
    (value: number) => updateBlock(block.id, { x: value }),
    [updateBlock, block.id]
  );

  const handleYChange = useCallback(
    (value: number) => updateBlock(block.id, { y: value }),
    [updateBlock, block.id]
  );

  const handleWidthChange = useCallback(
    (value: number) => updateBlock(block.id, { width: value }),
    [updateBlock, block.id]
  );

  const handleHeightChange = useCallback(
    (value: number) => updateBlock(block.id, { height: value }),
    [updateBlock, block.id]
  );

  const handleRotationChange = useCallback(
    (value: number) => updateBlock(block.id, { rotateDegrees: value }),
    [updateBlock, block.id]
  );

  return (
    <div className={styles.propertyGrid}>
      <div className={styles.propertyGrid2}>
        <NumericInput
          label="X"
          value={block.x}
          onChange={handleXChange}
          min={0}
          max={maxX}
          step={1}
          unit="px"
        />
        <NumericInput
          label="Y"
          value={block.y}
          onChange={handleYChange}
          min={0}
          max={maxY}
          step={1}
          unit="px"
        />
      </div>
      <div className={styles.propertyGrid2}>
        <NumericInput
          label="Width"
          value={block.width}
          onChange={handleWidthChange}
          min={20}
          max={maxWidth}
          step={1}
          unit="px"
        />
        <NumericInput
          label="Height"
          value={block.height}
          onChange={handleHeightChange}
          min={20}
          max={maxHeight}
          step={1}
          unit="px"
        />
      </div>
      <NumericInput
        label="Rotation"
        value={block.rotateDegrees}
        onChange={handleRotationChange}
        min={-360}
        max={360}
        step={1}
        unit="deg"
      />
    </div>
  );
}

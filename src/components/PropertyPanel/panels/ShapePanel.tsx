import { useCallback } from 'react';
import type { Block, GradientMode } from '../../../types';
import { useEditorStore } from '../../../stores';
import { Checkbox, ColorPicker, Select, NumericInput } from '../../shared';
import styles from '../PropertyPanel.module.css';

interface ShapePanelProps {
  block: Block;
}

const GRADIENT_MODE_OPTIONS = [
  { value: 'Horizontal', label: 'Horizontal' },
  { value: 'Vertical', label: 'Vertical' },
  { value: 'ForwardDiagonal', label: 'Diagonal /' },
  { value: 'BackwardDiagonal', label: 'Diagonal \\' },
];

/**
 * Panel for shape fill (background) and outline properties.
 * Available for all block types.
 */
export function ShapePanel({ block }: ShapePanelProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  // Fill handlers
  const handleFillColor = useCallback(
    (value: string) => updateBlock(block.id, { rectColor: value }),
    [updateBlock, block.id]
  );

  const handleFillOpacity = useCallback(
    (value: number) => updateBlock(block.id, { rectColorOpacity: value }),
    [updateBlock, block.id]
  );

  // Fill gradient handlers
  const handleGradientToggle = useCallback(
    (value: boolean) => updateBlock(block.id, { rectGradient: value }),
    [updateBlock, block.id]
  );

  const handleGradientColor = useCallback(
    (value: string) => updateBlock(block.id, { rectGradientColor: value }),
    [updateBlock, block.id]
  );

  const handleGradientOpacity = useCallback(
    (value: number) => updateBlock(block.id, { rectGradientOpacity: value }),
    [updateBlock, block.id]
  );

  const handleGradientMode = useCallback(
    (value: string) => updateBlock(block.id, { rectGradientMode: value as GradientMode }),
    [updateBlock, block.id]
  );

  // Outline handlers
  const handleOutlineToggle = useCallback(
    (value: boolean) => updateBlock(block.id, { rectOutline: value }),
    [updateBlock, block.id]
  );

  const handleOutlineColor = useCallback(
    (value: string) => updateBlock(block.id, { rectOutlineColor: value }),
    [updateBlock, block.id]
  );

  const handleOutlineOpacity = useCallback(
    (value: number) => updateBlock(block.id, { rectOutlineOpacity: value }),
    [updateBlock, block.id]
  );

  const handleOutlineWidth = useCallback(
    (value: number) => updateBlock(block.id, { rectOutlineWidth: value }),
    [updateBlock, block.id]
  );

  const hasFill = block.rectColorOpacity > 0;

  return (
    <div className={styles.propertyGrid}>
      {/* Fill Color */}
      <ColorPicker
        label="Fill Color"
        value={block.rectColor}
        opacity={block.rectColorOpacity}
        onChange={handleFillColor}
        onOpacityChange={handleFillOpacity}
        showOpacity
      />

      {/* Fill Gradient */}
      <Checkbox
        label="Fill Gradient"
        checked={block.rectGradient}
        onChange={handleGradientToggle}
        disabled={!hasFill}
      />
      {block.rectGradient && hasFill && (
        <div className={styles.propertyGrid} style={{ paddingLeft: 'var(--space-md)' }}>
          <ColorPicker
            label="Gradient Color"
            value={block.rectGradientColor}
            opacity={block.rectGradientOpacity}
            onChange={handleGradientColor}
            onOpacityChange={handleGradientOpacity}
            showOpacity
          />
          <Select
            label="Direction"
            value={block.rectGradientMode}
            options={GRADIENT_MODE_OPTIONS}
            onChange={handleGradientMode}
          />
        </div>
      )}

      {/* Outline */}
      <Checkbox
        label="Outline"
        checked={block.rectOutline}
        onChange={handleOutlineToggle}
      />
      {block.rectOutline && (
        <div className={styles.propertyGrid} style={{ paddingLeft: 'var(--space-md)' }}>
          <ColorPicker
            label="Outline Color"
            value={block.rectOutlineColor}
            opacity={block.rectOutlineOpacity}
            onChange={handleOutlineColor}
            onOpacityChange={handleOutlineOpacity}
            showOpacity
          />
          <NumericInput
            label="Width"
            value={block.rectOutlineWidth}
            onChange={handleOutlineWidth}
            min={1}
            max={50}
            step={1}
            unit="px"
          />
        </div>
      )}
    </div>
  );
}

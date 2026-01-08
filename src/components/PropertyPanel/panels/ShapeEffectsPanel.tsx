import { useCallback } from 'react';
import type { Block } from '../../../types';
import { useEditorStore } from '../../../stores';
import { Checkbox, ColorPicker, NumericInput, Slider } from '../../shared';
import styles from '../PropertyPanel.module.css';

interface ShapeEffectsPanelProps {
  block: Block;
}

/**
 * Panel for shape effects: shadow and reflection.
 * Available for all block types.
 */
export function ShapeEffectsPanel({ block }: ShapeEffectsPanelProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  // Shadow handlers
  const handleShadowToggle = useCallback(
    (value: boolean) => updateBlock(block.id, { rectShadow: value }),
    [updateBlock, block.id]
  );

  const handleShadowColor = useCallback(
    (value: string) => updateBlock(block.id, { rectShadowColor: value }),
    [updateBlock, block.id]
  );

  const handleShadowOpacity = useCallback(
    (value: number) => updateBlock(block.id, { rectShadowOpacity: value }),
    [updateBlock, block.id]
  );

  const handleShadowDepth = useCallback(
    (value: number) => updateBlock(block.id, { rectShadowDepth: value }),
    [updateBlock, block.id]
  );

  // Reflection handlers
  const handleReflectionToggle = useCallback(
    (value: boolean) => updateBlock(block.id, { reflection: value }),
    [updateBlock, block.id]
  );

  const handleReflectionOpacity = useCallback(
    (value: number) => updateBlock(block.id, { reflectionOpacity: value }),
    [updateBlock, block.id]
  );

  const handleReflectionOffset = useCallback(
    (value: number) => updateBlock(block.id, { reflectionOffset: value }),
    [updateBlock, block.id]
  );

  const handleReflectionHeight = useCallback(
    (value: number) => updateBlock(block.id, { reflectionHeight: value }),
    [updateBlock, block.id]
  );

  return (
    <div className={styles.propertyGrid}>
      {/* Drop Shadow */}
      <Checkbox
        label="Drop Shadow"
        checked={block.rectShadow}
        onChange={handleShadowToggle}
      />
      {block.rectShadow && (
        <div className={styles.propertyGrid} style={{ paddingLeft: 'var(--space-md)' }}>
          <ColorPicker
            label="Shadow Color"
            value={block.rectShadowColor}
            opacity={block.rectShadowOpacity}
            onChange={handleShadowColor}
            onOpacityChange={handleShadowOpacity}
            showOpacity
          />
          <NumericInput
            label="Depth"
            value={block.rectShadowDepth}
            onChange={handleShadowDepth}
            min={0}
            max={50}
            step={1}
            unit="px"
          />
        </div>
      )}

      {/* Reflection */}
      <Checkbox
        label="Reflection"
        checked={block.reflection}
        onChange={handleReflectionToggle}
      />
      {block.reflection && (
        <div className={styles.propertyGrid} style={{ paddingLeft: 'var(--space-md)' }}>
          <Slider
            label="Opacity"
            value={block.reflectionOpacity}
            onChange={handleReflectionOpacity}
            min={0}
            max={255}
            formatValue={(v) => `${Math.round((v / 255) * 100)}%`}
          />
          <NumericInput
            label="Offset"
            value={block.reflectionOffset}
            onChange={handleReflectionOffset}
            min={0}
            max={100}
            step={1}
            unit="px"
          />
          <Slider
            label="Height"
            value={block.reflectionHeight}
            onChange={handleReflectionHeight}
            min={0}
            max={100}
            formatValue={(v) => `${v}%`}
          />
        </div>
      )}
    </div>
  );
}

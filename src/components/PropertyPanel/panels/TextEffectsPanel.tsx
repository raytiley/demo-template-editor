import { useCallback } from 'react';
import type { Block, GradientMode } from '../../../types';
import { useEditorStore } from '../../../stores';
import { Checkbox, ColorPicker, Select, NumericInput } from '../../shared';
import styles from '../PropertyPanel.module.css';

interface TextEffectsPanelProps {
  block: Block;
}

const GRADIENT_MODE_OPTIONS = [
  { value: 'Horizontal', label: 'Horizontal' },
  { value: 'Vertical', label: 'Vertical' },
  { value: 'ForwardDiagonal', label: 'Diagonal /' },
  { value: 'BackwardDiagonal', label: 'Diagonal \\' },
];

/**
 * Panel for text effects: gradient, shadow, outline, glow.
 */
export function TextEffectsPanel({ block }: TextEffectsPanelProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  // Gradient handlers
  const handleGradientToggle = useCallback(
    (value: boolean) => updateBlock(block.id, { textGradient: value }),
    [updateBlock, block.id]
  );

  const handleGradientColor = useCallback(
    (value: string) => updateBlock(block.id, { textGradientColor: value }),
    [updateBlock, block.id]
  );

  const handleGradientOpacity = useCallback(
    (value: number) => updateBlock(block.id, { textGradientOpacity: value }),
    [updateBlock, block.id]
  );

  const handleGradientMode = useCallback(
    (value: string) => updateBlock(block.id, { textGradientMode: value as GradientMode }),
    [updateBlock, block.id]
  );

  // Shadow handlers
  const handleShadowToggle = useCallback(
    (value: boolean) => updateBlock(block.id, { textShadow: value }),
    [updateBlock, block.id]
  );

  const handleShadowColor = useCallback(
    (value: string) => updateBlock(block.id, { textShadowColor: value }),
    [updateBlock, block.id]
  );

  const handleShadowOpacity = useCallback(
    (value: number) => updateBlock(block.id, { textShadowOpacity: value }),
    [updateBlock, block.id]
  );

  const handleShadowDepth = useCallback(
    (value: number) => updateBlock(block.id, { textShadowDepth: value }),
    [updateBlock, block.id]
  );

  // Outline handlers
  const handleOutlineToggle = useCallback(
    (value: boolean) => updateBlock(block.id, { textOutline: value }),
    [updateBlock, block.id]
  );

  const handleOutlineColor = useCallback(
    (value: string) => updateBlock(block.id, { textOutlineColor: value }),
    [updateBlock, block.id]
  );

  const handleOutlineOpacity = useCallback(
    (value: number) => updateBlock(block.id, { textOutlineOpacity: value }),
    [updateBlock, block.id]
  );

  // Glow handlers
  const handleGlowToggle = useCallback(
    (value: boolean) => updateBlock(block.id, { textGlow: value }),
    [updateBlock, block.id]
  );

  const handleGlowColor = useCallback(
    (value: string) => updateBlock(block.id, { textGlowColor: value }),
    [updateBlock, block.id]
  );

  return (
    <div className={styles.propertyGrid}>
      {/* Text Gradient */}
      <Checkbox
        label="Text Gradient"
        checked={block.textGradient}
        onChange={handleGradientToggle}
      />
      {block.textGradient && (
        <div className={styles.propertyGrid} style={{ paddingLeft: 'var(--space-md)' }}>
          <ColorPicker
            label="Gradient Color"
            value={block.textGradientColor}
            opacity={block.textGradientOpacity}
            onChange={handleGradientColor}
            onOpacityChange={handleGradientOpacity}
            showOpacity
          />
          <Select
            label="Direction"
            value={block.textGradientMode}
            options={GRADIENT_MODE_OPTIONS}
            onChange={handleGradientMode}
          />
        </div>
      )}

      {/* Text Shadow */}
      <Checkbox
        label="Text Shadow"
        checked={block.textShadow}
        onChange={handleShadowToggle}
      />
      {block.textShadow && (
        <div className={styles.propertyGrid} style={{ paddingLeft: 'var(--space-md)' }}>
          <ColorPicker
            label="Shadow Color"
            value={block.textShadowColor}
            opacity={block.textShadowOpacity}
            onChange={handleShadowColor}
            onOpacityChange={handleShadowOpacity}
            showOpacity
          />
          <NumericInput
            label="Depth"
            value={block.textShadowDepth}
            onChange={handleShadowDepth}
            min={0}
            max={50}
            step={1}
            unit="px"
          />
        </div>
      )}

      {/* Text Outline */}
      <Checkbox
        label="Text Outline"
        checked={block.textOutline}
        onChange={handleOutlineToggle}
      />
      {block.textOutline && (
        <div className={styles.propertyGrid} style={{ paddingLeft: 'var(--space-md)' }}>
          <ColorPicker
            label="Outline Color"
            value={block.textOutlineColor}
            opacity={block.textOutlineOpacity}
            onChange={handleOutlineColor}
            onOpacityChange={handleOutlineOpacity}
            showOpacity
          />
        </div>
      )}

      {/* Text Glow */}
      <Checkbox
        label="Text Glow"
        checked={block.textGlow}
        onChange={handleGlowToggle}
      />
      {block.textGlow && (
        <div className={styles.propertyGrid} style={{ paddingLeft: 'var(--space-md)' }}>
          <ColorPicker
            label="Glow Color"
            value={block.textGlowColor}
            onChange={handleGlowColor}
          />
        </div>
      )}
    </div>
  );
}

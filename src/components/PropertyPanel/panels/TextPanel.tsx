import { useCallback } from 'react';
import type { Block, TextAlignment } from '../../../types';
import { useEditorStore } from '../../../stores';
import { TextInput, ColorPicker, ButtonGroup, Checkbox } from '../../shared';
import styles from '../PropertyPanel.module.css';

interface TextPanelProps {
  block: Block;
}

const HORIZ_ALIGNMENT_OPTIONS = [
  { value: 'Near', label: 'Left', icon: '\u2190' },
  { value: 'Center', label: 'Center', icon: '\u2194' },
  { value: 'Far', label: 'Right', icon: '\u2192' },
];

const VERT_ALIGNMENT_OPTIONS = [
  { value: 'Near', label: 'Top', icon: '\u2191' },
  { value: 'Center', label: 'Middle', icon: '\u2195' },
  { value: 'Far', label: 'Bottom', icon: '\u2193' },
];

/**
 * Panel for editing text content, color, and alignment.
 */
export function TextPanel({ block }: TextPanelProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const handleTextChange = useCallback(
    (value: string) => updateBlock(block.id, { text: value }),
    [updateBlock, block.id]
  );

  const handleTextColorChange = useCallback(
    (value: string) => updateBlock(block.id, { textColor: value }),
    [updateBlock, block.id]
  );

  const handleTextOpacityChange = useCallback(
    (value: number) => updateBlock(block.id, { textColorOpacity: value }),
    [updateBlock, block.id]
  );

  const handleHorizAlignChange = useCallback(
    (value: string) => updateBlock(block.id, { textHorizAlignment: value as TextAlignment }),
    [updateBlock, block.id]
  );

  const handleVertAlignChange = useCallback(
    (value: string) => updateBlock(block.id, { textVertAlignment: value as TextAlignment }),
    [updateBlock, block.id]
  );

  const handleWrapChange = useCallback(
    (value: boolean) => updateBlock(block.id, { textWrap: value }),
    [updateBlock, block.id]
  );

  const handleAutoSizeChange = useCallback(
    (value: boolean) => updateBlock(block.id, { autoSizeText: value }),
    [updateBlock, block.id]
  );

  return (
    <div className={styles.propertyGrid}>
      <TextInput
        label="Text Content"
        value={block.text}
        onChange={handleTextChange}
        multiline
        rows={3}
        maxLength={block.textMaxLength > 0 ? block.textMaxLength : undefined}
      />

      <ColorPicker
        label="Text Color"
        value={block.textColor}
        opacity={block.textColorOpacity}
        onChange={handleTextColorChange}
        onOpacityChange={handleTextOpacityChange}
        showOpacity
      />

      <ButtonGroup
        label="Horizontal Align"
        value={block.textHorizAlignment}
        options={HORIZ_ALIGNMENT_OPTIONS}
        onChange={handleHorizAlignChange}
        iconOnly
      />

      <ButtonGroup
        label="Vertical Align"
        value={block.textVertAlignment}
        options={VERT_ALIGNMENT_OPTIONS}
        onChange={handleVertAlignChange}
        iconOnly
      />

      <div className={styles.propertyRow}>
        <Checkbox
          label="Word Wrap"
          checked={block.textWrap}
          onChange={handleWrapChange}
        />
      </div>

      <div className={styles.propertyRow}>
        <Checkbox
          label="Auto Size"
          checked={block.autoSizeText}
          onChange={handleAutoSizeChange}
        />
      </div>
    </div>
  );
}

import { useCallback, useMemo } from 'react';
import type { Block } from '../../../types';
import { useEditorStore } from '../../../stores';
import { Select, NumericInput } from '../../shared';
import styles from '../PropertyPanel.module.css';

interface FontPanelProps {
  block: Block;
}

/**
 * Panel for editing font family, size, and style (bold, italic, etc).
 */
export function FontPanel({ block }: FontPanelProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const fonts = useEditorStore((state) => state.fonts);

  // Build font options from store
  const fontOptions = useMemo(() => {
    return fonts.map((font) => ({
      value: font.name,
      label: font.name,
    }));
  }, [fonts]);

  const handleFontChange = useCallback(
    (value: string) => updateBlock(block.id, { textFont: value }),
    [updateBlock, block.id]
  );

  const handleSizeChange = useCallback(
    (value: number) => updateBlock(block.id, { textSize: value }),
    [updateBlock, block.id]
  );

  const handlePaddingChange = useCallback(
    (value: number) => updateBlock(block.id, { textPadding: value }),
    [updateBlock, block.id]
  );

  const toggleBold = useCallback(() => {
    updateBlock(block.id, { textBold: !block.textBold });
  }, [updateBlock, block.id, block.textBold]);

  const toggleItalic = useCallback(() => {
    updateBlock(block.id, { textItalic: !block.textItalic });
  }, [updateBlock, block.id, block.textItalic]);

  const toggleUnderline = useCallback(() => {
    updateBlock(block.id, { textUnderline: !block.textUnderline });
  }, [updateBlock, block.id, block.textUnderline]);

  const toggleStrikeout = useCallback(() => {
    updateBlock(block.id, { textStrikeout: !block.textStrikeout });
  }, [updateBlock, block.id, block.textStrikeout]);

  return (
    <div className={styles.propertyGrid}>
      <Select
        label="Font Family"
        value={block.textFont}
        options={fontOptions}
        onChange={handleFontChange}
        placeholder="Select font..."
      />

      <div className={styles.propertyGrid2}>
        <NumericInput
          label="Size"
          value={block.textSize}
          onChange={handleSizeChange}
          min={1}
          max={500}
          step={1}
          unit="pt"
        />
        <NumericInput
          label="Padding"
          value={block.textPadding}
          onChange={handlePaddingChange}
          min={0}
          max={100}
          step={1}
          unit="px"
        />
      </div>

      <div>
        <span className={styles.label}>Style</span>
        <div className={styles.propertyRow}>
          <button
            type="button"
            className={`${styles.toggleButton} ${block.textBold ? styles.active : ''}`}
            onClick={toggleBold}
            aria-pressed={block.textBold}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${block.textItalic ? styles.active : ''}`}
            onClick={toggleItalic}
            aria-pressed={block.textItalic}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${block.textUnderline ? styles.active : ''}`}
            onClick={toggleUnderline}
            aria-pressed={block.textUnderline}
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${block.textStrikeout ? styles.active : ''}`}
            onClick={toggleStrikeout}
            aria-pressed={block.textStrikeout}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>
      </div>
    </div>
  );
}

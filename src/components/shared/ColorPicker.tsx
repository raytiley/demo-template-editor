import { useCallback, useState, useEffect } from 'react';
import styles from './shared.module.css';

interface ColorPickerProps {
  label: string;
  /** Hex color without # prefix (e.g., "2cb466") */
  value: string;
  /** Opacity 0-255 */
  opacity?: number;
  onChange: (color: string) => void;
  onOpacityChange?: (opacity: number) => void;
  showOpacity?: boolean;
  disabled?: boolean;
  id?: string;
}

/**
 * Color picker with hex input and optional opacity slider.
 * Colors are stored as hex without # prefix (e.g., "2cb466").
 */
export function ColorPicker({
  label,
  value,
  opacity = 255,
  onChange,
  onOpacityChange,
  showOpacity = false,
  disabled = false,
  id,
}: ColorPickerProps) {
  const inputId = id || `color-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const [hexInput, setHexInput] = useState(value.toUpperCase());

  // Sync hex input when value prop changes
  useEffect(() => {
    setHexInput(value.toUpperCase());
  }, [value]);

  // Ensure 6-character hex
  const normalizedHex = value.padStart(6, '0').slice(0, 6);
  const hexWithHash = `#${normalizedHex}`;

  // Calculate CSS color with opacity
  const opacityPercent = opacity / 255;
  const rgbaColor = hexToRgba(normalizedHex, opacityPercent);

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Native color picker returns #RRGGBB
      const newColor = e.target.value.slice(1).toUpperCase();
      onChange(newColor);
    },
    [onChange]
  );

  const handleHexInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let raw = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
      if (raw.length > 6) raw = raw.slice(0, 6);
      setHexInput(raw);

      if (raw.length === 6 || raw.length === 3) {
        // Expand 3-char to 6-char
        const expanded = raw.length === 3
          ? raw[0] + raw[0] + raw[1] + raw[1] + raw[2] + raw[2]
          : raw;
        onChange(expanded);
      }
    },
    [onChange]
  );

  const handleHexBlur = useCallback(() => {
    // Ensure valid hex on blur
    let normalized = hexInput.padEnd(6, '0').slice(0, 6);
    setHexInput(normalized);
    onChange(normalized);
  }, [hexInput, onChange]);

  const handleOpacityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onOpacityChange) {
        onOpacityChange(parseInt(e.target.value, 10));
      }
    },
    [onOpacityChange]
  );

  return (
    <div className={styles.colorPicker}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.colorPickerRow}>
        <div className={styles.colorSwatch}>
          <div className={styles.colorSwatchBg} />
          <div
            className={styles.colorSwatchColor}
            style={{ backgroundColor: rgbaColor }}
          />
          <input
            type="color"
            className={styles.colorInput}
            value={hexWithHash}
            onChange={handleColorChange}
            disabled={disabled}
            aria-label={`${label} color picker`}
          />
        </div>
        <input
          id={inputId}
          type="text"
          className={styles.colorHexInput}
          value={hexInput}
          onChange={handleHexInputChange}
          onBlur={handleHexBlur}
          disabled={disabled}
          maxLength={6}
          placeholder="FFFFFF"
          aria-label={`${label} hex value`}
        />
      </div>
      {showOpacity && onOpacityChange && (
        <div className={styles.sliderContainer} style={{ marginTop: 'var(--space-sm)' }}>
          <input
            type="range"
            className={styles.sliderInput}
            style={{ position: 'relative', opacity: 1, height: '20px' }}
            value={opacity}
            onChange={handleOpacityChange}
            min={0}
            max={255}
            step={1}
            disabled={disabled}
            aria-label={`${label} opacity`}
          />
          <span className={styles.sliderValue}>{Math.round((opacity / 255) * 100)}%</span>
        </div>
      )}
    </div>
  );
}

/**
 * Convert hex color to rgba string
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

import { useCallback, useRef } from 'react';
import styles from './shared.module.css';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  id?: string;
}

/**
 * Range slider with visual fill indicator and optional value display.
 */
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  formatValue,
  disabled = false,
  id,
}: SliderProps) {
  const inputId = id || `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const trackRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange]
  );

  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <div className={styles.slider}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.sliderContainer}>
        <div className={styles.sliderTrack} ref={trackRef}>
          <div
            className={styles.sliderFill}
            style={{ width: `${percentage}%` }}
          />
          <div
            className={styles.sliderThumb}
            style={{ left: `${percentage}%` }}
          />
          <input
            id={inputId}
            type="range"
            className={styles.sliderInput}
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={displayValue}
          />
        </div>
        {showValue && (
          <span className={styles.sliderValue}>{displayValue}</span>
        )}
      </div>
    </div>
  );
}

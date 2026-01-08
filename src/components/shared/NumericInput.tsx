import { useCallback, useState, useRef, useEffect } from 'react';
import styles from './shared.module.css';

interface NumericInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  id?: string;
}

/**
 * Numeric input with increment/decrement buttons and optional unit display.
 * Supports keyboard stepping with arrow keys.
 */
export function NumericInput({
  label,
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  unit,
  disabled = false,
  id,
}: NumericInputProps) {
  const inputId = id || `numeric-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const [localValue, setLocalValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value when prop changes (from external updates)
  useEffect(() => {
    setLocalValue(String(Math.round(value * 100) / 100));
  }, [value]);

  const clamp = useCallback(
    (val: number) => Math.max(min, Math.min(max, val)),
    [min, max]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setLocalValue(raw);

      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onChange(clamp(parsed));
      }
    },
    [onChange, clamp]
  );

  const handleBlur = useCallback(() => {
    const parsed = parseFloat(localValue);
    if (isNaN(parsed)) {
      setLocalValue(String(value));
    } else {
      const clamped = clamp(parsed);
      setLocalValue(String(Math.round(clamped * 100) / 100));
      onChange(clamped);
    }
  }, [localValue, value, onChange, clamp]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newValue = clamp(value + (e.shiftKey ? step * 10 : step));
        onChange(newValue);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newValue = clamp(value - (e.shiftKey ? step * 10 : step));
        onChange(newValue);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        inputRef.current?.blur();
      }
    },
    [value, step, clamp, onChange]
  );

  const increment = useCallback(() => {
    onChange(clamp(value + step));
  }, [value, step, clamp, onChange]);

  const decrement = useCallback(() => {
    onChange(clamp(value - step));
  }, [value, step, clamp, onChange]);

  return (
    <div className={styles.numericInput}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.numericInputGroup}>
        <button
          type="button"
          className={styles.numericButton}
          onClick={decrement}
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label}`}
          tabIndex={-1}
        >
          -
        </button>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          className={styles.numericInputField}
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-valuemin={min !== -Infinity ? min : undefined}
          aria-valuemax={max !== Infinity ? max : undefined}
          aria-valuenow={value}
        />
        {unit && <span className={styles.numericUnit}>{unit}</span>}
        <button
          type="button"
          className={styles.numericButton}
          onClick={increment}
          disabled={disabled || value >= max}
          aria-label={`Increase ${label}`}
          tabIndex={-1}
        >
          +
        </button>
      </div>
    </div>
  );
}

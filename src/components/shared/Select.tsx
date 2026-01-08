import { useCallback } from 'react';
import styles from './shared.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

/**
 * Dropdown select input with customizable options.
 */
export function Select({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
  id,
}: SelectProps) {
  const inputId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className={styles.select}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <select
        id={inputId}
        className={styles.selectInput}
        value={value}
        onChange={handleChange}
        disabled={disabled}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

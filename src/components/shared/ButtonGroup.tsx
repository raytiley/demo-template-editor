import { useCallback } from 'react';
import styles from './shared.module.css';

export interface ButtonOption {
  value: string;
  label: string;
  icon?: string;
}

interface ButtonGroupProps {
  label: string;
  value: string;
  options: ButtonOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  iconOnly?: boolean;
  id?: string;
}

/**
 * Group of toggle buttons where one option is selected at a time.
 * Good for alignment, mode selection, etc.
 */
export function ButtonGroup({
  label,
  value,
  options,
  onChange,
  disabled = false,
  iconOnly = false,
  id,
}: ButtonGroupProps) {
  const groupId = id || `btn-group-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleClick = useCallback(
    (optionValue: string) => {
      if (!disabled && optionValue !== value) {
        onChange(optionValue);
      }
    },
    [disabled, value, onChange]
  );

  return (
    <div className={styles.buttonGroup} role="group" aria-labelledby={`${groupId}-label`}>
      <span id={`${groupId}-label`} className={styles.label}>
        {label}
      </span>
      <div className={`${styles.buttonGroupButtons} ${iconOnly ? styles.buttonGroupIcon : ''}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.buttonGroupButton} ${value === option.value ? styles.active : ''}`}
            onClick={() => handleClick(option.value)}
            disabled={disabled}
            aria-pressed={value === option.value}
            title={option.label}
          >
            {option.icon ? (
              <span aria-hidden="true">{option.icon}</span>
            ) : (
              option.label
            )}
            {option.icon && <span className="sr-only">{option.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

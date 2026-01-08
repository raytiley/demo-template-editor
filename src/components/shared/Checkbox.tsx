import { useCallback } from 'react';
import styles from './shared.module.css';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

/**
 * Styled checkbox with custom appearance.
 */
export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  id,
}: CheckboxProps) {
  const inputId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.checked);
    },
    [onChange]
  );

  return (
    <label className={styles.checkbox} htmlFor={inputId}>
      <input
        id={inputId}
        type="checkbox"
        className={styles.checkboxInput}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className={styles.checkboxBox}>
        <span className={styles.checkboxCheck}>&#10003;</span>
      </span>
      <span className={styles.checkboxLabel}>{label}</span>
    </label>
  );
}

import { useCallback } from 'react';
import styles from './shared.module.css';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  id?: string;
}

/**
 * Text input or textarea with consistent styling.
 */
export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  multiline = false,
  rows = 3,
  maxLength,
  id,
}: TextInputProps) {
  const inputId = id || `text-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const inputProps = {
    id: inputId,
    className: `${styles.textInputField} ${multiline ? styles.textarea : ''}`,
    value,
    onChange: handleChange,
    placeholder,
    disabled,
    maxLength: maxLength && maxLength > 0 ? maxLength : undefined,
  };

  return (
    <div className={styles.textInput}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {multiline ? (
        <textarea {...inputProps} rows={rows} />
      ) : (
        <input type="text" {...inputProps} />
      )}
    </div>
  );
}

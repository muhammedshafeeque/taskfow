import { useEffect, useState } from 'react';
import { isoDateToDisplayDDMMYYYY, parseDDMMYYYYToIso } from '../lib/dateFormat';

interface DateInputDDMMYYYYProps {
  value: string;
  onChange: (iso: string) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
  /** When true, blur with empty text clears the value (emits ''). */
  allowEmpty?: boolean;
  /** Called after blur once the value is parsed and applied (or reverted). */
  onCommit?: () => void;
}

export default function DateInputDDMMYYYY({
  value,
  onChange,
  className = '',
  id,
  disabled,
  allowEmpty = false,
  onCommit,
}: DateInputDDMMYYYYProps) {
  const [text, setText] = useState(() => isoDateToDisplayDDMMYYYY(value));

  useEffect(() => {
    setText(isoDateToDisplayDDMMYYYY(value));
  }, [value]);

  function commit() {
    const trimmed = text.trim();
    if (trimmed === '') {
      if (allowEmpty) {
        onChange('');
        onCommit?.();
        return;
      }
      setText(isoDateToDisplayDDMMYYYY(value));
      onCommit?.();
      return;
    }
    const iso = parseDDMMYYYYToIso(trimmed);
    if (iso) {
      onChange(iso);
      setText(isoDateToDisplayDDMMYYYY(iso));
    } else {
      setText(isoDateToDisplayDDMMYYYY(value));
    }
    onCommit?.();
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder="DD/MM/YYYY"
      disabled={disabled}
      className={className}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          (e.target as HTMLInputElement).blur();
        }
      }}
      autoComplete="off"
    />
  );
}

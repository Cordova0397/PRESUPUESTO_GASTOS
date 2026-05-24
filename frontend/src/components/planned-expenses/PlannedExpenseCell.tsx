import { useEffect, useId, useRef, useState } from "react";
import { isValidMoneyInput } from "../../utils/money";

type Props = {
  value: string;
  existingId: number | null;
  disabled: boolean;
  onChange: (value: string) => void;
};

export function PlannedExpenseCell({ value, existingId, disabled, onChange }: Props) {
  const [localValue, setLocalValue] = useState(value);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const invalid = touched && !isValidMoneyInput(localValue);
  const existingButEmpty =
    touched && existingId !== null && localValue.trim() === "";

  const showError = invalid || existingButEmpty;
  const errorMsg = existingButEmpty
    ? "Ingresa 0 si deseas presupuesto cero"
    : "Monto inválido. Usa solo números positivos o cero, con máximo 2 decimales.";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocalValue(e.target.value);
    setTouched(true);
    onChange(e.target.value);
  }

  function handleBlur() {
    setTouched(true);
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder="—"
        className={[
          "w-full rounded border px-2 py-1 text-right text-sm outline-none transition-colors",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
          showError
            ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-300"
            : "border-slate-200 bg-white focus:border-brand-400 focus:ring-1 focus:ring-brand-200",
        ].join(" ")}
        style={{ minWidth: "82px" }}
        aria-invalid={showError}
        aria-describedby={showError ? errorId : undefined}
        title={showError ? errorMsg : undefined}
      />
      {showError && (
        <p
          id={errorId}
          className="absolute right-0 top-full z-10 mt-0.5 whitespace-nowrap rounded bg-red-600 px-2 py-0.5 text-xs text-white shadow"
        >
          {errorMsg}
        </p>
      )}
    </div>
  );
}

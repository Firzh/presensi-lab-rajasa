import { useState } from 'preact/hooks';

export function SingleSelect({ value, options, placeholder, disabled = false, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => String(option.value) === String(value));

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm disabled:bg-slate-100 disabled:text-slate-400"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <span className="text-slate-500">▾</span>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {options.map((option) => {
            const selected = String(option.value) === String(value);

            return (
              <button
                key={option.value}
                type="button"
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  selected ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700'
                }`}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
                {selected ? <span>✓</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
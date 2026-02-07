"use client";

interface AgeGateProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function AgeGate({ checked, onChange, error }: AgeGateProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-gold"
        />
        I confirm I am 18 years of age or older
      </label>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

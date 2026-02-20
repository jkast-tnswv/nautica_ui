import { useState, useEffect } from 'react';
import { SelectField } from './SelectField';

const UNITS = [
  { value: 'minutes', label: 'minutes', minutes: 1 },
  { value: 'hours', label: 'hours', minutes: 60 },
  { value: 'days', label: 'days', minutes: 1440 },
  { value: 'weeks', label: 'weeks', minutes: 10080 },
] as const;

type Unit = typeof UNITS[number]['value'];

function decompose(totalMinutes: number): { amount: number; unit: Unit } {
  if (totalMinutes <= 0) return { amount: 0, unit: 'minutes' };
  // Pick the largest unit that divides evenly, falling back to minutes
  for (let i = UNITS.length - 1; i >= 0; i--) {
    const u = UNITS[i];
    if (totalMinutes >= u.minutes && totalMinutes % u.minutes === 0) {
      return { amount: totalMinutes / u.minutes, unit: u.value };
    }
  }
  return { amount: totalMinutes, unit: 'minutes' };
}

function toMinutes(amount: number, unit: Unit): number {
  const multiplier = UNITS.find((u) => u.value === unit)!.minutes;
  return amount * multiplier;
}

interface TimeRangeSelectorProps {
  /** Current value in minutes. 0 means "all time" / no filter. */
  value: number;
  onChange: (minutes: number) => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const initial = decompose(value);
  const [amount, setAmount] = useState(initial.amount);
  const [unit, setUnit] = useState<Unit>(initial.unit);

  // Sync local state when value changes externally
  useEffect(() => {
    const decomposed = decompose(value);
    setAmount(decomposed.amount);
    setUnit(decomposed.unit);
  }, [value]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') { setAmount(0); return; }
    const parsed = parseInt(raw);
    if (!isNaN(parsed) && parsed >= 0) {
      setAmount(parsed);
      onChange(toMinutes(parsed, unit));
    }
  };

  const handleUnitChange = (e: { target: { name: string; value: string } }) => {
    const newUnit = e.target.value as Unit;
    setUnit(newUnit);
    onChange(toMinutes(amount, newUnit));
  };

  return (
    <div className="time-range-selector">
      <input
        type="number"
        className="time-range-input"
        value={amount}
        onChange={handleAmountChange}
        min={0}
      />
      <SelectField
        name="time-range-unit"
        options={UNITS}
        value={unit}
        onChange={handleUnitChange}
        className="time-range-unit"
      />
    </div>
  );
}

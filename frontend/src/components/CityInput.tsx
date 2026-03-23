import { useState, useRef, useEffect } from 'react';

const CITIES = [
  'Aberdeen', 'Bath', 'Belfast', 'Birmingham', 'Bradford', 'Brighton', 'Bristol',
  'Cambridge', 'Canterbury', 'Cardiff', 'Carlisle', 'Chelmsford', 'Chester',
  'Chichester', 'Colchester', 'Coventry', 'Derby', 'Derry', 'Dundee', 'Durham',
  'Edinburgh', 'Ely', 'Exeter', 'Glasgow', 'Gloucester', 'Hereford', 'Inverness',
  'Kingston upon Hull', 'Lancaster', 'Leeds', 'Leicester', 'Lichfield', 'Lincoln',
  'Liverpool', 'London', 'Manchester', 'Milton Keynes', 'Newcastle upon Tyne',
  'Norwich', 'Nottingham', 'Oxford', 'Perth', 'Peterborough', 'Plymouth',
  'Portsmouth', 'Preston', 'Ripon', 'Salford', 'Salisbury', 'Sheffield',
  'Southampton', 'Stirling', 'Stoke-on-Trent', 'Sunderland', 'Truro',
  'Wakefield', 'Wells', 'Westminster', 'Winchester', 'Wolverhampton', 'Worcester',
  'York',
  // Ireland
  'Cork', 'Dublin', 'Galway', 'Kilkenny', 'Limerick', 'Waterford',
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export default function CityInput({ value, onChange, placeholder = 'Your city', required, className, id }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim().length > 0
    ? CITIES.filter((c) => c.toLowerCase().startsWith(value.trim().toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const select = (city: string) => {
    onChange(city);
    setOpen(false);
    setHighlighted(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      select(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        required={required}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlighted(-1); }}
        onFocus={() => { if (filtered.length > 0) setOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className || 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none'}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {filtered.map((city, i) => (
            <li
              key={city}
              onMouseDown={() => select(city)}
              onMouseEnter={() => setHighlighted(i)}
              className={`px-3 py-2 text-sm cursor-pointer ${i === highlighted ? 'bg-indigo-50 text-indigo-700' : 'text-gray-800 hover:bg-gray-50'}`}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

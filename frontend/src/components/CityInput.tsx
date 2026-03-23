import { useState, useRef, useEffect } from 'react';

interface CityEntry {
  city: string;
  region: string;
}

const CITIES: CityEntry[] = [
  // United Kingdom - England
  { city: 'Bath', region: 'England' },
  { city: 'Birmingham', region: 'England' },
  { city: 'Bradford', region: 'England' },
  { city: 'Brighton', region: 'England' },
  { city: 'Bristol', region: 'England' },
  { city: 'Cambridge', region: 'England' },
  { city: 'Canterbury', region: 'England' },
  { city: 'Carlisle', region: 'England' },
  { city: 'Chelmsford', region: 'England' },
  { city: 'Chester', region: 'England' },
  { city: 'Chichester', region: 'England' },
  { city: 'Coventry', region: 'England' },
  { city: 'Derby', region: 'England' },
  { city: 'Durham', region: 'England' },
  { city: 'Exeter', region: 'England' },
  { city: 'Gloucester', region: 'England' },
  { city: 'Hereford', region: 'England' },
  { city: 'Kingston upon Hull', region: 'England' },
  { city: 'Lancaster', region: 'England' },
  { city: 'Leeds', region: 'England' },
  { city: 'Leicester', region: 'England' },
  { city: 'Lincoln', region: 'England' },
  { city: 'Liverpool', region: 'England' },
  { city: 'London', region: 'England' },
  { city: 'Manchester', region: 'England' },
  { city: 'Milton Keynes', region: 'England' },
  { city: 'Newcastle upon Tyne', region: 'England' },
  { city: 'Norwich', region: 'England' },
  { city: 'Nottingham', region: 'England' },
  { city: 'Oxford', region: 'England' },
  { city: 'Peterborough', region: 'England' },
  { city: 'Plymouth', region: 'England' },
  { city: 'Portsmouth', region: 'England' },
  { city: 'Preston', region: 'England' },
  { city: 'Salford', region: 'England' },
  { city: 'Salisbury', region: 'England' },
  { city: 'Sheffield', region: 'England' },
  { city: 'Southampton', region: 'England' },
  { city: 'Stoke-on-Trent', region: 'England' },
  { city: 'Sunderland', region: 'England' },
  { city: 'Wakefield', region: 'England' },
  { city: 'Winchester', region: 'England' },
  { city: 'Wolverhampton', region: 'England' },
  { city: 'Worcester', region: 'England' },
  { city: 'York', region: 'England' },
  // United Kingdom - Scotland
  { city: 'Aberdeen', region: 'Scotland' },
  { city: 'Dundee', region: 'Scotland' },
  { city: 'Edinburgh', region: 'Scotland' },
  { city: 'Glasgow', region: 'Scotland' },
  { city: 'Inverness', region: 'Scotland' },
  { city: 'Perth', region: 'Scotland' },
  { city: 'Stirling', region: 'Scotland' },
  // United Kingdom - Wales
  { city: 'Cardiff', region: 'Wales' },
  { city: 'Newport', region: 'Wales' },
  { city: 'Swansea', region: 'Wales' },
  // United Kingdom - Northern Ireland
  { city: 'Belfast', region: 'NI' },
  { city: 'Derry', region: 'NI' },
  // Ireland
  { city: 'Cork', region: 'Ireland' },
  { city: 'Dublin', region: 'Ireland' },
  { city: 'Galway', region: 'Ireland' },
  { city: 'Kilkenny', region: 'Ireland' },
  { city: 'Limerick', region: 'Ireland' },
  { city: 'Waterford', region: 'Ireland' },
  // USA
  { city: 'Atlanta', region: 'USA' },
  { city: 'Austin', region: 'USA' },
  { city: 'Baltimore', region: 'USA' },
  { city: 'Boston', region: 'USA' },
  { city: 'Charlotte', region: 'USA' },
  { city: 'Chicago', region: 'USA' },
  { city: 'Columbus', region: 'USA' },
  { city: 'Dallas', region: 'USA' },
  { city: 'Denver', region: 'USA' },
  { city: 'Detroit', region: 'USA' },
  { city: 'El Paso', region: 'USA' },
  { city: 'Fort Worth', region: 'USA' },
  { city: 'Houston', region: 'USA' },
  { city: 'Indianapolis', region: 'USA' },
  { city: 'Jacksonville', region: 'USA' },
  { city: 'Las Vegas', region: 'USA' },
  { city: 'Los Angeles', region: 'USA' },
  { city: 'Louisville', region: 'USA' },
  { city: 'Memphis', region: 'USA' },
  { city: 'Miami', region: 'USA' },
  { city: 'Milwaukee', region: 'USA' },
  { city: 'Minneapolis', region: 'USA' },
  { city: 'Nashville', region: 'USA' },
  { city: 'New Orleans', region: 'USA' },
  { city: 'New York', region: 'USA' },
  { city: 'Oklahoma City', region: 'USA' },
  { city: 'Philadelphia', region: 'USA' },
  { city: 'Phoenix', region: 'USA' },
  { city: 'Portland', region: 'USA' },
  { city: 'Raleigh', region: 'USA' },
  { city: 'Sacramento', region: 'USA' },
  { city: 'San Antonio', region: 'USA' },
  { city: 'San Diego', region: 'USA' },
  { city: 'San Francisco', region: 'USA' },
  { city: 'San Jose', region: 'USA' },
  { city: 'Seattle', region: 'USA' },
  { city: 'Tucson', region: 'USA' },
  { city: 'Washington DC', region: 'USA' },
  // Canada
  { city: 'Calgary', region: 'Canada' },
  { city: 'Edmonton', region: 'Canada' },
  { city: 'Halifax', region: 'Canada' },
  { city: 'Montreal', region: 'Canada' },
  { city: 'Ottawa', region: 'Canada' },
  { city: 'Quebec City', region: 'Canada' },
  { city: 'Toronto', region: 'Canada' },
  { city: 'Vancouver', region: 'Canada' },
  { city: 'Winnipeg', region: 'Canada' },
  // Australia
  { city: 'Adelaide', region: 'Australia' },
  { city: 'Brisbane', region: 'Australia' },
  { city: 'Canberra', region: 'Australia' },
  { city: 'Darwin', region: 'Australia' },
  { city: 'Gold Coast', region: 'Australia' },
  { city: 'Melbourne', region: 'Australia' },
  { city: 'Perth', region: 'Australia' },
  { city: 'Sydney', region: 'Australia' },
  // New Zealand
  { city: 'Auckland', region: 'NZ' },
  { city: 'Christchurch', region: 'NZ' },
  { city: 'Wellington', region: 'NZ' },
  // Germany
  { city: 'Berlin', region: 'Germany' },
  { city: 'Bremen', region: 'Germany' },
  { city: 'Cologne', region: 'Germany' },
  { city: 'Dortmund', region: 'Germany' },
  { city: 'Dresden', region: 'Germany' },
  { city: 'Dusseldorf', region: 'Germany' },
  { city: 'Essen', region: 'Germany' },
  { city: 'Frankfurt', region: 'Germany' },
  { city: 'Hamburg', region: 'Germany' },
  { city: 'Hanover', region: 'Germany' },
  { city: 'Leipzig', region: 'Germany' },
  { city: 'Munich', region: 'Germany' },
  { city: 'Nuremberg', region: 'Germany' },
  { city: 'Stuttgart', region: 'Germany' },
  // France
  { city: 'Bordeaux', region: 'France' },
  { city: 'Lille', region: 'France' },
  { city: 'Lyon', region: 'France' },
  { city: 'Marseille', region: 'France' },
  { city: 'Nantes', region: 'France' },
  { city: 'Nice', region: 'France' },
  { city: 'Paris', region: 'France' },
  { city: 'Strasbourg', region: 'France' },
  { city: 'Toulouse', region: 'France' },
  // Spain
  { city: 'Barcelona', region: 'Spain' },
  { city: 'Bilbao', region: 'Spain' },
  { city: 'Madrid', region: 'Spain' },
  { city: 'Malaga', region: 'Spain' },
  { city: 'Seville', region: 'Spain' },
  { city: 'Valencia', region: 'Spain' },
  { city: 'Zaragoza', region: 'Spain' },
  // Italy
  { city: 'Bologna', region: 'Italy' },
  { city: 'Florence', region: 'Italy' },
  { city: 'Genoa', region: 'Italy' },
  { city: 'Milan', region: 'Italy' },
  { city: 'Naples', region: 'Italy' },
  { city: 'Palermo', region: 'Italy' },
  { city: 'Rome', region: 'Italy' },
  { city: 'Turin', region: 'Italy' },
  { city: 'Venice', region: 'Italy' },
  // Netherlands
  { city: 'Amsterdam', region: 'Netherlands' },
  { city: 'Eindhoven', region: 'Netherlands' },
  { city: 'Rotterdam', region: 'Netherlands' },
  { city: 'The Hague', region: 'Netherlands' },
  { city: 'Utrecht', region: 'Netherlands' },
  // Belgium
  { city: 'Antwerp', region: 'Belgium' },
  { city: 'Brussels', region: 'Belgium' },
  { city: 'Ghent', region: 'Belgium' },
  // Switzerland
  { city: 'Basel', region: 'Switzerland' },
  { city: 'Bern', region: 'Switzerland' },
  { city: 'Geneva', region: 'Switzerland' },
  { city: 'Zurich', region: 'Switzerland' },
  // Austria
  { city: 'Graz', region: 'Austria' },
  { city: 'Innsbruck', region: 'Austria' },
  { city: 'Linz', region: 'Austria' },
  { city: 'Salzburg', region: 'Austria' },
  { city: 'Vienna', region: 'Austria' },
  // Portugal
  { city: 'Braga', region: 'Portugal' },
  { city: 'Lisbon', region: 'Portugal' },
  { city: 'Porto', region: 'Portugal' },
  // Scandinavia
  { city: 'Aarhus', region: 'Denmark' },
  { city: 'Copenhagen', region: 'Denmark' },
  { city: 'Gothenburg', region: 'Sweden' },
  { city: 'Helsinki', region: 'Finland' },
  { city: 'Malmo', region: 'Sweden' },
  { city: 'Oslo', region: 'Norway' },
  { city: 'Stockholm', region: 'Sweden' },
  // Eastern Europe
  { city: 'Bratislava', region: 'Slovakia' },
  { city: 'Bucharest', region: 'Romania' },
  { city: 'Budapest', region: 'Hungary' },
  { city: 'Krakow', region: 'Poland' },
  { city: 'Prague', region: 'Czech Rep.' },
  { city: 'Sofia', region: 'Bulgaria' },
  { city: 'Warsaw', region: 'Poland' },
  { city: 'Wroclaw', region: 'Poland' },
  { city: 'Zagreb', region: 'Croatia' },
  // Middle East
  { city: 'Abu Dhabi', region: 'UAE' },
  { city: 'Beirut', region: 'Lebanon' },
  { city: 'Doha', region: 'Qatar' },
  { city: 'Dubai', region: 'UAE' },
  { city: 'Istanbul', region: 'Turkey' },
  { city: 'Kuwait City', region: 'Kuwait' },
  { city: 'Muscat', region: 'Oman' },
  { city: 'Riyadh', region: 'Saudi Arabia' },
  { city: 'Tel Aviv', region: 'Israel' },
  // South Asia
  { city: 'Bangalore', region: 'India' },
  { city: 'Chennai', region: 'India' },
  { city: 'Delhi', region: 'India' },
  { city: 'Dhaka', region: 'Bangladesh' },
  { city: 'Hyderabad', region: 'India' },
  { city: 'Karachi', region: 'Pakistan' },
  { city: 'Kolkata', region: 'India' },
  { city: 'Lahore', region: 'Pakistan' },
  { city: 'Mumbai', region: 'India' },
  { city: 'Pune', region: 'India' },
  // East & Southeast Asia
  { city: 'Bangkok', region: 'Thailand' },
  { city: 'Beijing', region: 'China' },
  { city: 'Chengdu', region: 'China' },
  { city: 'Guangzhou', region: 'China' },
  { city: 'Ho Chi Minh City', region: 'Vietnam' },
  { city: 'Hong Kong', region: 'HK' },
  { city: 'Jakarta', region: 'Indonesia' },
  { city: 'Kuala Lumpur', region: 'Malaysia' },
  { city: 'Manila', region: 'Philippines' },
  { city: 'Osaka', region: 'Japan' },
  { city: 'Seoul', region: 'South Korea' },
  { city: 'Shanghai', region: 'China' },
  { city: 'Singapore', region: 'Singapore' },
  { city: 'Taipei', region: 'Taiwan' },
  { city: 'Tokyo', region: 'Japan' },
  // Africa
  { city: 'Accra', region: 'Ghana' },
  { city: 'Addis Ababa', region: 'Ethiopia' },
  { city: 'Cairo', region: 'Egypt' },
  { city: 'Cape Town', region: 'South Africa' },
  { city: 'Casablanca', region: 'Morocco' },
  { city: 'Johannesburg', region: 'South Africa' },
  { city: 'Lagos', region: 'Nigeria' },
  { city: 'Nairobi', region: 'Kenya' },
  { city: 'Tunis', region: 'Tunisia' },
  // Latin America
  { city: 'Bogota', region: 'Colombia' },
  { city: 'Buenos Aires', region: 'Argentina' },
  { city: 'Caracas', region: 'Venezuela' },
  { city: 'Guadalajara', region: 'Mexico' },
  { city: 'Lima', region: 'Peru' },
  { city: 'Medellin', region: 'Colombia' },
  { city: 'Mexico City', region: 'Mexico' },
  { city: 'Monterrey', region: 'Mexico' },
  { city: 'Rio de Janeiro', region: 'Brazil' },
  { city: 'Santiago', region: 'Chile' },
  { city: 'Sao Paulo', region: 'Brazil' },
  { city: 'Tijuana', region: 'Mexico' },
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
    ? CITIES.filter((c) => c.city.toLowerCase().startsWith(value.trim().toLowerCase())).slice(0, 8)
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

  const select = (entry: CityEntry) => {
    onChange(entry.city);
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
          {filtered.map((entry, i) => (
            <li
              key={entry.city}
              onMouseDown={() => select(entry)}
              onMouseEnter={() => setHighlighted(i)}
              className={`px-3 py-2 text-sm cursor-pointer flex justify-between items-center ${i === highlighted ? 'bg-indigo-50 text-indigo-700' : 'text-gray-800 hover:bg-gray-50'}`}
            >
              <span>{entry.city}</span>
              <span className={`text-xs ${i === highlighted ? 'text-indigo-400' : 'text-gray-400'}`}>{entry.region}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

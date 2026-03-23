import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xPng from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon broken in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIconPng,
  iconRetinaUrl: markerIcon2xPng,
  shadowUrl: markerShadowPng,
});

const RADIUS_OPTIONS = [5, 10, 25, 50];

function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onLocationChange(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom()); }, [lat, lng]); // eslint-disable-line
  return null;
}

interface MapPickerProps {
  lat: number | null;
  lng: number | null;
  radius?: number;
  mode: 'pick' | 'filter';
  onLocationChange: (lat: number, lng: number) => void;
  onRadiusChange?: (km: number) => void;
  onClear?: () => void;
}

export default function MapPicker({ lat, lng, radius = 10, mode, onLocationChange, onRadiusChange, onClear }: MapPickerProps) {
  const center: [number, number] = lat !== null && lng !== null ? [lat, lng] : [51.505, -0.09];

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={lat !== null ? 11 : 5}
        style={{ height: mode === 'filter' ? '260px' : '200px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapClickHandler onLocationChange={onLocationChange} />
        {lat !== null && lng !== null && (
          <>
            <Marker position={[lat, lng]} />
            {mode === 'filter' && <Circle center={[lat, lng]} radius={radius * 1000} color="#4f46e5" fillColor="#4f46e5" fillOpacity={0.1} />}
            <FlyTo lat={lat} lng={lng} />
          </>
        )}
      </MapContainer>
      {mode === 'filter' && onRadiusChange && (
        <div className="px-3 py-2 bg-white border-t border-gray-200 flex items-center gap-3">
          <span className="text-xs text-gray-500 whitespace-nowrap">Radius:</span>
          <div className="flex gap-1">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRadiusChange(r)}
                className={`px-2 py-1 text-xs rounded ${radius === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {r}km
              </button>
            ))}
          </div>
          {lat !== null && (
            <span className="text-xs text-gray-400 ml-auto">
              {lat.toFixed(3)}, {lng!.toFixed(3)}
            </span>
          )}
        </div>
      )}
      {mode === 'pick' && lat === null && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-400">Click the map to pin your location</p>
        </div>
      )}
      {mode === 'pick' && lat !== null && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">{lat.toFixed(4)}, {lng!.toFixed(4)}</span>
          <button type="button" onClick={onClear} className="text-xs text-red-400 hover:underline">clear</button>
        </div>
      )}
    </div>
  );
}

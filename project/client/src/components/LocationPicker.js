import React, { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// react-leaflet ships with a Marker icon whose default URLs (marker-icon.png,
// marker-shadow.png, marker-icon-2x.png) point at "/" — webpack obviously
// doesn't serve those at site root, so the marker renders as a broken image.
// Rebind the prototype to the actual asset URLs that webpack resolves for
// the bundled leaflet package.
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// Default center: KubGU main campus area (Krasnodar). Used until the user
// clicks somewhere.
const DEFAULT_CENTER = [45.0355, 38.9739];
const DEFAULT_ZOOM = 14;

// Helper: returns a valid [lat, lon] pair from props, or null.
function normaliseValue(value) {
  if (!value) return null;
  const lat = Number(value.lat);
  const lon = Number(value.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return [lat, lon];
}

// Inner component: captures map clicks. Has to be a child of MapContainer.
const ClickCatcher = ({ onPick }) => {
  useMapEvents({
    click: (e) => onPick({ lat: e.latlng.lat, lon: e.latlng.lng }),
  });
  return null;
};

// Inner component: re-centres the map when the controlled value flips from
// null to a real coordinate (e.g. when the form opens in edit mode).
const RecenterOnValue = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, Math.max(map.getZoom(), DEFAULT_ZOOM));
  }, [position, map]);
  return null;
};

// Pin-on-map picker — replaces the manual lat/lon inputs in the event form.
// `value` is { lat, lon } (numbers) or empty/null; `onChange` fires with the
// same shape, or with null when the user clears the marker.
const LocationPicker = ({ value, onChange, height = 260 }) => {
  const position = normaliseValue(value);
  const center = position || DEFAULT_CENTER;

  const handleClear = () => onChange(null);

  return (
    <div>
      <div
        style={{
          height,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
      >
        <MapContainer
          center={center}
          zoom={position ? DEFAULT_ZOOM : 12}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCatcher onPick={onChange} />
          <RecenterOnValue position={position} />
          {position && (
            <Marker
              position={position}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  onChange({ lat, lon: lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="d-flex align-items-center justify-content-between mt-2"
           style={{ fontSize: 13, color: 'var(--color-text-muted)', flexWrap: 'wrap', gap: 8 }}>
        {position ? (
          <span>
            Координаты: <code style={{ color: 'var(--color-text-secondary)' }}>
              {position[0].toFixed(5)}, {position[1].toFixed(5)}
            </code>
            <span style={{ marginLeft: 8 }}>· можно тащить маркер</span>
          </span>
        ) : (
          <span>Кликните по карте, чтобы отметить место проведения.</span>
        )}
        {position && (
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={handleClear}
            style={{ borderRadius: 12 }}
          >
            Очистить метку
          </Button>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;

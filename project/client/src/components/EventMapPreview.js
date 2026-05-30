import React from 'react';

// OpenStreetMap embed — no API key required, no JS library.
// Renders nothing if either coordinate is missing or out of range.
const EventMapPreview = ({ lat, lon, height = 280, zoom = 0.01 }) => {
  if (lat === null || lat === undefined || lat === '' ||
      lon === null || lon === undefined || lon === '') return null;
  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;
  if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) return null;

  const bbox = `${lonNum - zoom},${latNum - zoom},${lonNum + zoom},${latNum + zoom}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latNum},${lonNum}`;

  return (
    <iframe
      src={src}
      title="Карта мероприятия"
      loading="lazy"
      style={{
        width: '100%',
        height,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
    />
  );
};

export default EventMapPreview;

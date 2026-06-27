import { City } from '../types';

const BASE_URL = 'https://api.astronomyapi.com/api/v2';

const getToken = () => {
  const id = import.meta.env.VITE_ASTRONOMY_APP_ID;
  const secret = import.meta.env.VITE_ASTRONOMY_APP_SECRET;
  return btoa(`${id}:${secret}`);
};

export interface SkyPosition {
  altitude: number;
  azimuth: number;
  visible: boolean;
  compassDirection: string;
  viewingTip: string;
}

const getCompassDirection = (azimuth: number): string => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(azimuth / 45) % 8];
};

const getViewingTip = (altitude: number, azimuth: number): string => {
  const dir = getCompassDirection(azimuth);
  if (altitude <= 0) return 'Not visible from your location at this time.';
  if (altitude < 15) return `Very low on the horizon. Face ${dir} and find an open area with no buildings or trees blocking the view.`;
  if (altitude < 45) return `Face ${dir} and look about ${Math.round(altitude)}° above the horizon — roughly ${Math.round(altitude / 9)} fist-widths up.`;
  return `Face ${dir} and look high — ${Math.round(altitude)}° above the horizon. Nearly overhead!`;
};

export const getSkyPosition = async (
  city: City,
  date: Date,
  bodyId: string = 'moon'
): Promise<SkyPosition> => {
  // Always query at 21:00 PKT (16:00 UTC) — prime viewing time
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = '21:00:00';

  const url = `${BASE_URL}/bodies/positions?latitude=${city.lat}&longitude=${city.lng}&elevation=0&from_date=${dateStr}&to_date=${dateStr}&time=${timeStr}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${getToken()}` },
    });
    const data = await res.json();
    const rows = data?.data?.table?.rows || [];
    const bodyRow = rows.find((r: any) => r.entry.id === bodyId);

    if (!bodyRow) return fallback();

    const alt = parseFloat(bodyRow.cells[0].position.horizontal.altitude.degrees);
    const az = parseFloat(bodyRow.cells[0].position.horizontal.azimuth.degrees);

    return {
      altitude: Math.round(alt * 10) / 10,
      azimuth: Math.round(az * 10) / 10,
      visible: alt > 0,
      compassDirection: getCompassDirection(az),
      viewingTip: getViewingTip(alt, az),
    };
  } catch (e) {
    console.error('AstronomyAPI error:', e);
    return fallback();
  }
};

const fallback = (): SkyPosition => ({
  altitude: 0,
  azimuth: 0,
  visible: false,
  compassDirection: 'N',
  viewingTip: 'Could not retrieve sky data. Please try again.',
});

export const getBodyIdForEvent = (eventType: string, eventName: string): string => {
  if (eventName.toLowerCase().includes('solar')) return 'sun';
  if (eventName.toLowerCase().includes('lunar')) return 'moon';
  if (eventName.toLowerCase().includes('full moon')) return 'moon';
  if (eventName.toLowerCase().includes('new moon')) return 'moon';
  if (eventType === 'Moon') return 'moon';
  if (eventType === 'Eclipse') return 'sun';
  return 'moon';
};

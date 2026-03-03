const WEATHER_BASE = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";
const GEOCODE_BASE = "https://geocoding-api.open-meteo.com/v1/search";

export async function fetchCurrentWeather(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,apparent_temperature,surface_pressure,cloud_cover",
    timezone: "auto",
  });
  const res = await fetch(`${WEATHER_BASE}?${params}`);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  return res.json();
}

export async function fetchForecast(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
    timezone: "auto",
  });
  const res = await fetch(`${WEATHER_BASE}?${params}`);
  if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);
  return res.json();
}

export async function fetchAirQuality(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide",
  });
  const res = await fetch(`${AIR_QUALITY_BASE}?${params}`);
  if (!res.ok) throw new Error(`Air quality API error: ${res.status}`);
  return res.json();
}

export async function fetchGeocode(query: string) {
  const params = new URLSearchParams({
    name: query,
    count: "5",
    language: "en",
  });
  const res = await fetch(`${GEOCODE_BASE}?${params}`);
  if (!res.ok) throw new Error(`Geocode API error: ${res.status}`);
  return res.json();
}

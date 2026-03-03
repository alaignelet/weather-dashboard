const BASE_URL = "https://api.openweathermap.org";

function getApiKey(): string {
  const key = process.env.OPENWEATHERMAP_API_KEY;
  if (!key) throw new Error("OPENWEATHERMAP_API_KEY is not set");
  return key;
}

export async function fetchCurrentWeather(lat: number, lon: number) {
  const res = await fetch(
    `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${getApiKey()}`
  );
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  return res.json();
}

export async function fetchForecast(lat: number, lon: number) {
  const res = await fetch(
    `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${getApiKey()}`
  );
  if (!res.ok) throw new Error(`Forecast API error: ${res.status}`);
  return res.json();
}

export async function fetchAirQuality(lat: number, lon: number) {
  const res = await fetch(
    `${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${getApiKey()}`
  );
  if (!res.ok) throw new Error(`Air quality API error: ${res.status}`);
  return res.json();
}

export async function fetchGeocode(query: string) {
  const res = await fetch(
    `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${getApiKey()}`
  );
  if (!res.ok) throw new Error(`Geocode API error: ${res.status}`);
  return res.json();
}

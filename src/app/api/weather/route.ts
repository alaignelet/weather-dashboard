import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentWeather } from "@/lib/weather-api";
import { getCached, setCache } from "@/lib/cache";

// Map WMO weather codes to descriptions and icon identifiers
function getWeatherInfo(code: number): { description: string; icon: string; main: string } {
  const map: Record<number, { description: string; icon: string; main: string }> = {
    0: { description: "clear sky", icon: "01d", main: "Clear" },
    1: { description: "mainly clear", icon: "02d", main: "Clear" },
    2: { description: "partly cloudy", icon: "03d", main: "Clouds" },
    3: { description: "overcast", icon: "04d", main: "Clouds" },
    45: { description: "foggy", icon: "50d", main: "Fog" },
    48: { description: "depositing rime fog", icon: "50d", main: "Fog" },
    51: { description: "light drizzle", icon: "09d", main: "Drizzle" },
    53: { description: "moderate drizzle", icon: "09d", main: "Drizzle" },
    55: { description: "dense drizzle", icon: "09d", main: "Drizzle" },
    61: { description: "slight rain", icon: "10d", main: "Rain" },
    63: { description: "moderate rain", icon: "10d", main: "Rain" },
    65: { description: "heavy rain", icon: "10d", main: "Rain" },
    71: { description: "slight snow", icon: "13d", main: "Snow" },
    73: { description: "moderate snow", icon: "13d", main: "Snow" },
    75: { description: "heavy snow", icon: "13d", main: "Snow" },
    80: { description: "slight rain showers", icon: "09d", main: "Rain" },
    81: { description: "moderate rain showers", icon: "09d", main: "Rain" },
    82: { description: "violent rain showers", icon: "09d", main: "Rain" },
    85: { description: "slight snow showers", icon: "13d", main: "Snow" },
    86: { description: "heavy snow showers", icon: "13d", main: "Snow" },
    95: { description: "thunderstorm", icon: "11d", main: "Thunderstorm" },
    96: { description: "thunderstorm with slight hail", icon: "11d", main: "Thunderstorm" },
    99: { description: "thunderstorm with heavy hail", icon: "11d", main: "Thunderstorm" },
  };
  return map[code] || { description: "unknown", icon: "01d", main: "Clear" };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const cacheKey = `weather:${lat}:${lon}`;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await fetchCurrentWeather(Number(lat), Number(lon));
    const current = data.current;
    const weatherInfo = getWeatherInfo(current.weather_code);

    const result = {
      temp: current.temperature_2m,
      feels_like: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      wind_speed: Math.round(current.wind_speed_10m * 10 / 36) / 10, // km/h to m/s
      wind_deg: current.wind_direction_10m,
      description: weatherInfo.description,
      icon: weatherInfo.icon,
      main: weatherInfo.main,
      pressure: current.surface_pressure,
      visibility: 10000,
      clouds: current.cloud_cover,
      dt: Math.floor(new Date(current.time).getTime() / 1000),
      sunrise: 0,
      sunset: 0,
    };
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}

export interface City {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  description: string;
  icon: string;
  main: string;
  pressure: number;
  visibility: number;
  clouds: number;
  dt: number;
  sunrise: number;
  sunset: number;
}

export interface ForecastEntry {
  dt: number;
  temp: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  description: string;
  icon: string;
  main: string;
  pop: number;
  wind_speed: number;
}

export interface AirQuality {
  aqi: number;
  components: {
    pm2_5: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
}

export interface UVData {
  value: number;
}


const GEOCODING_URL =
  'https://geocoding-api.open-meteo.com/v1/search';

const FORECAST_URL =
  'https://api.open-meteo.com/v1/forecast';

const fetchJson = async (url) => {
  let response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    if (error.name === 'TimeoutError' ||
        error.name === 'AbortError') {
      const timeoutError = new Error(
        'Weather provider timed out'
      );
      timeoutError.code = 'WEATHER_TIMEOUT';
      throw timeoutError;
    }

    const networkError = new Error(
      'Weather provider is unavailable'
    );
    networkError.code = 'WEATHER_NETWORK_ERROR';
    throw networkError;
  }

  if (!response.ok) {
    const providerError = new Error(
      'Weather provider returned an error'
    );
    providerError.code = 'WEATHER_PROVIDER_ERROR';
    throw providerError;
  }

  try {
    return await response.json();
  } catch {
    const invalidResponseError = new Error(
      'Weather provider returned invalid JSON'
    );
    invalidResponseError.code = 'WEATHER_INVALID_RESPONSE';
    throw invalidResponseError;
  }
};

const getWeatherByCity = async (city) => {
  const geocodingUrl = new URL(GEOCODING_URL);

  geocodingUrl.search = new URLSearchParams({
    name: city,
    count: '1',
    language: 'en',
    format: 'json',
  }).toString();

  const locationData = await fetchJson(geocodingUrl);

  const location = locationData.results?.[0];

  if (!location) {
    const error = new Error('City not found');
    error.code = 'CITY_NOT_FOUND';
    throw error;
  }

  const forecastUrl = new URL(FORECAST_URL);

  forecastUrl.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    timezone: 'auto',
  }).toString();

  const forecastData = await fetchJson(forecastUrl);
  const current = forecastData.current;

  if (!current ||
      typeof current.temperature_2m !== 'number' ||
      typeof current.weather_code !== 'number') {
    const error = new Error('Weather data is incomplete');
    error.code = 'WEATHER_INVALID_RESPONSE';
    throw error;
  }

  return {
    location: {
      name: location.name,
      country: location.country || '',
      latitude: location.latitude,
      longitude: location.longitude,
    },
    current: {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      time: current.time,
    },
    units: {
      temperature: forecastData.current_units?.temperature_2m,
      windSpeed: forecastData.current_units?.wind_speed_10m,
    },
  };
};

module.exports = { getWeatherByCity };

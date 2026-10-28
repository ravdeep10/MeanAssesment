
const { getWeatherByCity } = require('../services/weatherService');

const getWeather = async (req, res) => {
  try {
    const city = req.query.city;

    if (typeof city !== 'string' || !city.trim()) {
      return res.status(400).json({
        message: 'Please provide a city name using ?city=Delhi',
      });
    }

    if (city.trim().length > 100) {
      return res.status(400).json({
        message: 'City name must not exceed 100 characters',
      });
    }

    const weather = await getWeatherByCity(city.trim());

    return res.status(200).json(weather);
  } catch (error) {
    if (error.code === 'CITY_NOT_FOUND') {
      return res.status(404).json({
        message: 'City not found. Please check the city name.',
      });
    }

    if (error.code === 'WEATHER_TIMEOUT') {
      return res.status(504).json({
        message: 'Weather service timed out. Please try again.',
      });
    }

    if (
      error.code === 'WEATHER_NETWORK_ERROR' ||
      error.code === 'WEATHER_PROVIDER_ERROR' ||
      error.code === 'WEATHER_INVALID_RESPONSE'
    ) {
      return res.status(502).json({
        message: 'Weather provider is temporarily unavailable.',
      });
    }

    console.error('Weather controller error:', error.message);

    return res.status(500).json({
      message: 'Unable to retrieve weather data.',
    });
  }
};

module.exports = { getWeather };

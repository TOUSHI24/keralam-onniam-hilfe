import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location } = await req.json();
    
    if (!location) {
      throw new Error('Location is required');
    }

    const openWeatherApiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');
    
    if (!openWeatherApiKey) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    console.log('Fetching weather for location:', location);

    // Get coordinates from location name
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)},Kerala,IN&limit=1&appid=${openWeatherApiKey}`;
    
    const geocodeResponse = await fetch(geocodeUrl);
    if (!geocodeResponse.ok) {
      throw new Error('Failed to geocode location');
    }

    const geocodeData = await geocodeResponse.json();
    if (!geocodeData.length) {
      throw new Error('Location not found');
    }

    const { lat, lon } = geocodeData[0];

    // Get current weather and 5-day forecast
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;
    
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();
    
    // Process the forecast data to get daily summaries
    const dailyForecast = [];
    const processedDays = new Set();

    for (const item of weatherData.list) {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!processedDays.has(date) && dailyForecast.length < 5) {
        processedDays.add(date);
        dailyForecast.push({
          date: date,
          temperature: Math.round(item.main.temp),
          description: item.weather[0].description,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
          icon: item.weather[0].icon
        });
      }
    }

    // Get current weather
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;
    
    const currentResponse = await fetch(currentWeatherUrl);
    const currentData = await currentResponse.json();

    const result = {
      location: geocodeData[0].name,
      current: {
        temperature: Math.round(currentData.main.temp),
        description: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        icon: currentData.weather[0].icon
      },
      forecast: dailyForecast,
      success: true
    };

    console.log('Weather data retrieved successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in weather forecast function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
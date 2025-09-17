import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEATHERBIT_API_KEY = Deno.env.get('WEATHERBIT_API_KEY');

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

    if (!WEATHERBIT_API_KEY) {
      throw new Error('Weatherbit API key not configured');
    }

    // Format location for API call (append Kerala, IN if not already specified)
    const formattedLocation = location.includes('Kerala') ? location : `${location}, Kerala, IN`;
    
    console.log(`Fetching weather for: ${formattedLocation}`);

    // Fetch current weather from Weatherbit
    const currentWeatherResponse = await fetch(
      `https://api.weatherbit.io/v2.0/current?city=${encodeURIComponent(formattedLocation)}&key=${WEATHERBIT_API_KEY}&units=M`
    );

    if (!currentWeatherResponse.ok) {
      throw new Error(`Weather API error: ${currentWeatherResponse.status}`);
    }

    const currentWeatherData = await currentWeatherResponse.json();
    
    if (!currentWeatherData.data || currentWeatherData.data.length === 0) {
      throw new Error('No weather data found for this location');
    }

    // Fetch 5-day forecast with 3-hour intervals from Weatherbit
    const forecastResponse = await fetch(
      `https://api.weatherbit.io/v2.0/forecast/3hourly?city=${encodeURIComponent(formattedLocation)}&key=${WEATHERBIT_API_KEY}&hours=120&units=M`
    );

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();

    const currentData = currentWeatherData.data[0];

    // Format the response
    const formattedResponse = {
      success: true,
      location: `${currentData.city_name}, ${currentData.state_code}`,
      current: {
        temperature: Math.round(currentData.temp),
        description: currentData.weather.description,
        humidity: currentData.rh,
        windSpeed: Math.round(currentData.wind_spd * 3.6) / 3.6, // Convert to m/s and round
        icon: currentData.weather.icon,
      },
      forecast: forecastData.data.slice(0, 40).map((item: any) => ({ // 5 days * 8 intervals = 40
        date: item.datetime,
        temperature: Math.round(item.temp),
        description: item.weather.description,
        humidity: item.rh,
        windSpeed: Math.round(item.wind_spd * 3.6) / 3.6,
        icon: item.weather.icon,
      })),
    };

    console.log('Weather data fetched successfully from Weatherbit');

    return new Response(JSON.stringify(formattedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in weather-forecast function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        location: null,
        current: null,
        forecast: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Eye, Thermometer, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  }>;
}

interface FarmerProfile {
  name: string;
  location: string;
  district: string;
  village: string;
  soil_type: string;
  crops: string[];
  land_size: number | null;
}

const Dashboard = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          name: data.name,
          location: data.location || '',
          district: data.district || '',
          village: data.village || '',
          soil_type: data.soil_type,
          crops: data.crops || [],
          land_size: data.land_size,
        });
        
        // Fetch weather for user's village (primary location)
        const weatherLocation = data.village || data.location;
        if (weatherLocation) {
          await fetchWeather(weatherLocation);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: t('error'),
        description: t('failed_to_load_profile'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (location: string) => {
    if (!location || !session) return;

    setWeatherLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('weather-forecast', {
        body: { location },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        setWeather(data);
      } else {
        throw new Error(data.error || 'Failed to fetch weather');
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast({
        title: t('weather_error'),
        description: t('weather_unavailable'),
        variant: "destructive",
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  const getCropRecommendations = (soilType: string, season: string) => {
    const recommendations: { [key: string]: string[] } = {
      'Laterite Soil': ['Coconut', 'Cashew', 'Pepper', 'Ginger'],
      'Alluvial Soil': ['Rice', 'Banana', 'Sugarcane', 'Vegetables'],
      'Red Soil': ['Cotton', 'Groundnut', 'Millets', 'Pulses'],
      'Black Soil': ['Cotton', 'Soybean', 'Wheat', 'Sugarcane'],
      'Coastal Sandy Soil': ['Coconut', 'Cashew', 'Vegetables', 'Flowers'],
      'Hill Soil': ['Tea', 'Coffee', 'Cardamom', 'Pepper'],
      'Marshy Soil': ['Rice', 'Fish farming', 'Duck farming', 'Lotus']
    };

    return recommendations[soilType] || ['Rice', 'Coconut', 'Vegetables'];
  };

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      '01d': <div className="w-8 h-8 bg-yellow-400 rounded-full" />,
      '01n': <div className="w-8 h-8 bg-gray-700 rounded-full" />,
      '02d': <Cloud className="w-8 h-8 text-gray-400" />,
      '02n': <Cloud className="w-8 h-8 text-gray-600" />,
      '03d': <Cloud className="w-8 h-8 text-gray-500" />,
      '03n': <Cloud className="w-8 h-8 text-gray-700" />,
      '04d': <Cloud className="w-8 h-8 text-gray-600" />,
      '04n': <Cloud className="w-8 h-8 text-gray-800" />,
      '09d': <Droplets className="w-8 h-8 text-blue-500" />,
      '09n': <Droplets className="w-8 h-8 text-blue-600" />,
      '10d': <Droplets className="w-8 h-8 text-blue-400" />,
      '10n': <Droplets className="w-8 h-8 text-blue-600" />,
      '11d': <Cloud className="w-8 h-8 text-gray-800" />,
      '11n': <Cloud className="w-8 h-8 text-gray-900" />,
    };

    return iconMap[iconCode] || <Cloud className="w-8 h-8 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center p-4">
        <Card className="text-center p-6">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Profile Setup Required</h2>
            <p className="text-muted-foreground mb-4">
              Please set up your farmer profile to view the dashboard.
            </p>
            <Button onClick={() => window.location.href = '/profile'}>
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSeason = new Date().getMonth() >= 5 && new Date().getMonth() <= 9 ? 'Monsoon' : 'Dry';
  const recommendedCrops = getCropRecommendations(profile.soil_type, currentSeason);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 pb-20">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">{t('farm_dashboard')}</h1>
          <p className="text-muted-foreground mt-2">{t('welcome_back')}, {profile.name}!</p>
        </div>

        {/* Profile Summary */}
        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {t('farm_overview')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('location')}</p>
                <p className="font-semibold">{profile.village && profile.district ? `${profile.village}, ${profile.district}` : profile.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('soil_type')}</p>
                <p className="font-semibold">{profile.soil_type}</p>
              </div>
              {profile.land_size && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('land_size')}</p>
                  <p className="font-semibold">{profile.land_size} acres</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Crops</p>
                <p className="font-semibold">{profile.crops.length} {t('varieties')}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {profile.crops.map((crop) => (
                <Badge key={crop} variant="secondary" className="bg-primary/10 text-primary">
                  {crop}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weather Section */}
        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              {t('weather_forecast')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weatherLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : weather ? (
              <div className="space-y-6">
                {/* Current Weather */}
                <div className="bg-primary/5 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{weather.location}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {weather.current.description}
                      </p>
                    </div>
                    <div className="text-right">
                      {getWeatherIcon(weather.current.icon)}
                      <p className="text-2xl font-bold">{weather.current.temperature}°C</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">
                        {t('humidity')}: {weather.current.humidity}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {t('wind')}: {weather.current.windSpeed} m/s
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5-Day Forecast */}
                <div className="space-y-3">
                  <h4 className="font-semibold">5-Day Forecast</h4>
                  <div className="space-y-2">
                    {weather.forecast.slice(0, 5).map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getWeatherIcon(day.icon)}
                          <div>
                            <p className="font-medium">
                              {new Date(day.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {day.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{day.temperature}°C</p>
                          <p className="text-xs text-muted-foreground">
                            {day.humidity}% humidity
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Cloud className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {t('weather_data_unavailable')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    const weatherLocation = profile.village || profile.location;
                    if (weatherLocation) fetchWeather(weatherLocation);
                  }}
                  className="mt-4"
                >
                  {t('retry')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crop Recommendations */}
        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('recommended_crops')} {profile.soil_type}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {recommendedCrops.map((crop) => (
                <div
                  key={crop}
                  className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <span className="font-medium">{crop}</span>
                  {profile.crops.includes(crop) && (
                    <Badge variant="secondary" className="text-xs">
                      {t('growing')}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-accent/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 inline mr-2" />
                {t('current_season')}: {t(currentSeason.toLowerCase())} • {t('best_planting_time')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
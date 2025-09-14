import React, { useState, useEffect } from 'react';
import { User, MapPin, Layers, Wheat, Ruler, LogOut, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';

interface FarmerProfile {
  name: string;
  location: string;
  soil_type: string;
  crops: string[];
  land_size: number | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<FarmerProfile>({
    name: '',
    location: '',
    soil_type: '',
    crops: [],
    land_size: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCrop, setNewCrop] = useState('');

  const soilTypes = [
    'Laterite Soil', 'Alluvial Soil', 'Red Soil', 'Black Soil', 
    'Coastal Sandy Soil', 'Hill Soil', 'Marshy Soil'
  ];

  const commonCrops = [
    'Rice', 'Coconut', 'Rubber', 'Pepper', 'Cardamom', 'Ginger', 
    'Turmeric', 'Banana', 'Jackfruit', 'Arecanut', 'Coffee', 'Tea'
  ];

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
          location: data.location,
          soil_type: data.soil_type,
          crops: data.crops || [],
          land_size: data.land_size,
        });
      } else {
        // No profile exists, enable editing mode for first-time setup
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    if (!profile.name || !profile.location || !profile.soil_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('farmers')
        .upsert({
          user_id: user.id,
          name: profile.name,
          location: profile.location,
          soil_type: profile.soil_type,
          crops: profile.crops,
          land_size: profile.land_size,
        });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile saved successfully!",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCrop = () => {
    if (newCrop && !profile.crops.includes(newCrop)) {
      setProfile(prev => ({
        ...prev,
        crops: [...prev.crops, newCrop]
      }));
      setNewCrop('');
    }
  };

  const removeCrop = (crop: string) => {
    setProfile(prev => ({
      ...prev,
      crops: prev.crops.filter(c => c !== crop)
    }));
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading && !profile.name) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 pb-20">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Farmer Profile</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-xl"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="rounded-xl text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                  className="pl-10 h-12 rounded-xl border-border/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="e.g., Kochi, Kerala"
                  className="pl-10 h-12 rounded-xl border-border/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="soil-type">Soil Type *</Label>
              <Select
                value={profile.soil_type}
                onValueChange={(value) => setProfile(prev => ({ ...prev, soil_type: value }))}
                disabled={!isEditing}
              >
                <SelectTrigger className="h-12 rounded-xl border-border/50">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Select soil type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {soilTypes.map((soil) => (
                    <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="land-size">Land Size (Acres)</Label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="land-size"
                  type="number"
                  step="0.01"
                  value={profile.land_size || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, land_size: e.target.value ? parseFloat(e.target.value) : null }))}
                  disabled={!isEditing}
                  placeholder="Enter land size in acres"
                  className="pl-10 h-12 rounded-xl border-border/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wheat className="w-5 h-5 text-primary" />
              Crops Grown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing && (
              <div className="flex gap-2">
                <Select value={newCrop} onValueChange={setNewCrop}>
                  <SelectTrigger className="flex-1 rounded-xl">
                    <SelectValue placeholder="Select crop to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonCrops
                      .filter(crop => !profile.crops.includes(crop))
                      .map((crop) => (
                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={addCrop} disabled={!newCrop} className="rounded-xl">
                  Add
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {profile.crops.map((crop) => (
                <div
                  key={crop}
                  className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                >
                  <span>{crop}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeCrop(crop)}
                      className="ml-1 text-xs hover:text-destructive"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {profile.crops.length === 0 && (
                <p className="text-muted-foreground text-sm">No crops added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <Button
            onClick={saveProfile}
            disabled={loading}
            className="w-full h-12 text-base font-semibold rounded-xl"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Saving Profile...
              </div>
            ) : (
              'Save Profile'
            )}
          </Button>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
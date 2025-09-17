import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: 'en' | 'ml';
  setLanguage: (lang: 'en' | 'ml') => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    home: 'Home',
    chat: 'Chat',
    profile: 'Profile',
    dashboard: 'Dashboard',
    
    // Profile
    farmer_profile: 'Farmer Profile',
    personal_information: 'Personal Information',
    full_name: 'Full Name',
    enter_full_name: 'Enter your full name',
    district: 'District',
    select_district: 'Select district',
    village_town: 'Village/Town',
    select_village: 'Select village or town',
    soil_type: 'Soil Type',
    select_soil_type: 'Select soil type',
    land_size: 'Land Size (Acres)',
    enter_land_size: 'Enter land size in acres',
    crops_grown: 'Crops Grown',
    select_crop_to_add: 'Select crop to add',
    add: 'Add',
    no_crops_added: 'No crops added yet',
    edit: 'Edit',
    cancel: 'Cancel',
    save_profile: 'Save Profile',
    saving_profile: 'Saving Profile...',
    
    // Dashboard
    farm_dashboard: 'Farm Dashboard',
    welcome_back: 'Welcome back',
    farm_overview: 'Farm Overview',
    location: 'Location',
    varieties: 'varieties',
    weather_forecast: 'Weather Forecast',
    current_season: 'Current Season',
    best_planting_time: 'Best planting time varies by crop',
    recommended_crops: 'Recommended Crops for',
    growing: 'Growing',
    
    // Messages
    error: 'Error',
    success: 'Success',
    profile_saved_success: 'Profile saved successfully!',
    failed_to_load_profile: 'Failed to load profile',
    failed_to_save_profile: 'Failed to save profile',
    fill_required_fields: 'Please fill in all required fields',
    weather_error: 'Weather Error',
    weather_unavailable: 'Could not fetch weather data for your location',
    weather_data_unavailable: 'Weather data unavailable for your location',
    retry: 'Retry',
    
    // Profile Setup
    profile_setup_required: 'Profile Setup Required',
    setup_profile_message: 'Please set up your farmer profile to view the dashboard.',
    go_to_profile: 'Go to Profile',
    
    // Weather
    humidity: 'Humidity',
    wind: 'Wind',
    monsoon: 'Monsoon',
    dry: 'Dry'
  },
  ml: {
    // Navigation
    home: 'വീട്',
    chat: 'ചാറ്റ്',
    profile: 'പ്രൊഫൈൽ',
    dashboard: 'ഡാഷ്ബോർഡ്',
    
    // Profile
    farmer_profile: 'കർഷക പ്രൊഫൈൽ',
    personal_information: 'വ്യക്തിഗത വിവരങ്ങൾ',
    full_name: 'മുഴുവൻ പേര്',
    enter_full_name: 'നിങ്ങളുടെ മുഴുവൻ പേര് നൽകുക',
    district: 'ജില്ല',
    select_district: 'ജില്ല തിരഞ്ഞെടുക്കുക',
    village_town: 'ഗ്രാമം/പട്ടണം',
    select_village: 'ഗ്രാമം അല്ലെങ്കിൽ പട്ടണം തിരഞ്ഞെടുക്കുക',
    soil_type: 'മണ്ണിന്റെ തരം',
    select_soil_type: 'മണ്ണിന്റെ തരം തിരഞ്ഞെടുക്കുക',
    land_size: 'ഭൂമിയുടെ വലിപ്പം (ഏക്കർ)',
    enter_land_size: 'ഏക്കറിൽ ഭൂമിയുടെ വലിപ്പം നൽകുക',
    crops_grown: 'കൃഷി ചെയ്യുന്ന വിളകൾ',
    select_crop_to_add: 'ചേർക്കാൻ വിള തിരഞ്ഞെടുക്കുക',
    add: 'ചേർക്കുക',
    no_crops_added: 'ഇതുവരെ വിളകൾ ചേർത്തിട്ടില്ല',
    edit: 'തിരുത്തുക',
    cancel: 'റദ്ദാക്കുക',
    save_profile: 'പ്രൊഫൈൽ സേവ് ചെയ്യുക',
    saving_profile: 'പ്രൊഫൈൽ സേവ് ചെയ്യുന്നു...',
    
    // Dashboard
    farm_dashboard: 'ഫാം ഡാഷ്ബോർഡ്',
    welcome_back: 'സ്വാഗതം',
    farm_overview: 'ഫാം അവലോകനം',
    location: 'സ്ഥലം',
    varieties: 'ഇനങ്ങൾ',
    weather_forecast: 'കാലാവസ്ഥാ പ്രവചനം',
    current_season: 'നിലവിലെ സീസൺ',
    best_planting_time: 'മികച്ച നടീൽ സമയം വിളയനുസരിച്ച് വ്യത്യാസപ്പെടുന്നു',
    recommended_crops: 'ശുപാർശ ചെയ്യപ്പെടുന്ന വിളകൾ',
    growing: 'കൃഷി ചെയ്യുന്നു',
    
    // Messages
    error: 'പിശക്',
    success: 'വിജയം',
    profile_saved_success: 'പ്രൊഫൈൽ വിജയകരമായി സേവ് ചെയ്തു!',
    failed_to_load_profile: 'പ്രൊഫൈൽ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല',
    failed_to_save_profile: 'പ്രൊഫൈൽ സേവ് ചെയ്യാൻ കഴിഞ്ഞില്ല',
    fill_required_fields: 'ദയവായി എല്ലാ ആവശ്യമായ ഫീൽഡുകളും പൂരിപ്പിക്കുക',
    weather_error: 'കാലാവസ്ഥാ പിശക്',
    weather_unavailable: 'നിങ്ങളുടെ സ്ഥലത്തിന്റെ കാലാവസ്ഥാ ഡാറ്റ ലഭിക്കാൻ കഴിഞ്ഞില്ല',
    weather_data_unavailable: 'നിങ്ങളുടെ സ്ഥലത്തിന് കാലാവസ്ഥാ ഡാറ്റ ലഭ്യമല്ല',
    retry: 'വീണ്ടും ശ്രമിക്കുക',
    
    // Profile Setup
    profile_setup_required: 'പ്രൊഫൈൽ സജ്ജീകരണം ആവശ്യം',
    setup_profile_message: 'ഡാഷ്ബോർഡ് കാണാൻ നിങ്ങളുടെ കർഷക പ്രൊഫൈൽ സജ്ജീകരിക്കുക.',
    go_to_profile: 'പ്രൊഫൈലിലേക്ക് പോകുക',
    
    // Weather
    humidity: 'ആർദ്രത',
    wind: 'കാറ്റ്',
    monsoon: 'മൺസൂൺ',
    dry: 'വരൾച്ച'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ml'>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Users, MessageCircle, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their profile
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Users,
      title: 'Farmer Profiles',
      description: 'Create and manage your farming profile with crop details, soil type, and land information.',
    },
    {
      icon: MessageCircle,
      title: 'AI Farm Assistant',
      description: 'Chat with our AI assistant in English or Malayalam for farming advice and guidance.',
    },
    {
      icon: BarChart3,
      title: 'Smart Dashboard',
      description: 'View weather forecasts, crop recommendations, and farming insights in one place.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary/10">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/20 p-4 rounded-full">
            <Sprout className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Kerala Farming Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Empowering Kerala farmers with AI-powered assistance, weather insights, 
          and personalized farming recommendations.
        </p>
        
        <Button 
          onClick={() => navigate('/auth')}
          className="h-14 px-8 text-lg font-semibold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg"
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </header>

      {/* Features Section */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything You Need for Smart Farming
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-xl border-0 bg-card/95 backdrop-blur hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-primary/10 p-4 rounded-full">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-12 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Why Choose Kerala Farming Assistant?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-card/80 p-6 rounded-2xl shadow-lg">
                <h3 className="font-semibold text-lg mb-2">Local Expertise</h3>
                <p className="text-muted-foreground">
                  Tailored advice for Kerala's unique climate, soil conditions, and traditional farming practices.
                </p>
              </div>
              
              <div className="bg-card/80 p-6 rounded-2xl shadow-lg">
                <h3 className="font-semibold text-lg mb-2">Multi-Language Support</h3>
                <p className="text-muted-foreground">
                  Get assistance in both English and Malayalam for better understanding and communication.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-card/80 p-6 rounded-2xl shadow-lg">
                <h3 className="font-semibold text-lg mb-2">Weather Integration</h3>
                <p className="text-muted-foreground">
                  Real-time weather forecasts and alerts to help you make informed farming decisions.
                </p>
              </div>
              
              <div className="bg-card/80 p-6 rounded-2xl shadow-lg">
                <h3 className="font-semibold text-lg mb-2">AI-Powered Insights</h3>
                <p className="text-muted-foreground">
                  Advanced AI technology provides personalized recommendations for your specific farming needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-6 py-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of Kerala farmers who are already using our AI assistant 
            to improve their farming practices and increase productivity.
          </p>
          
          <Button 
            onClick={() => navigate('/auth')}
            className="h-14 px-12 text-lg font-semibold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;

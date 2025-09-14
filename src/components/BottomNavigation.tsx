import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, MessageCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/chat', icon: MessageCircle, label: 'AI Chat' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 h-auto py-2 px-4 rounded-xl min-w-[80px]"
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
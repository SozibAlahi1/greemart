'use client';

import { useSettings } from '@/lib/useSettings';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function SettingsBanner() {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(true);

  if (!settings.bannerEnabled || !settings.bannerText || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-2 px-4">
      <div className="container mx-auto max-w-7xl flex items-center justify-between">
        <p className="text-sm font-medium text-center flex-1">{settings.bannerText}</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


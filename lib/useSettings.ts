'use client';

import { useState, useEffect } from 'react';

export interface Settings {
  _id?: string;
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  siteFavicon?: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  freeDeliveryThreshold: number;
  deliveryFee: number;
  deliveryTime: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  bannerText?: string;
  bannerEnabled: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
}

const defaultSettings: Settings = {
  siteName: 'Grocery Store',
  siteDescription: 'Your trusted online grocery store',
  contactEmail: 'contact@example.com',
  contactPhone: '+1234567890',
  contactAddress: '123 Main St, City, Country',
  freeDeliveryThreshold: 500,
  deliveryFee: 50,
  deliveryTime: '2-3 days',
  currency: 'BDT',
  currencySymbol: '৳',
  taxRate: 5,
  bannerEnabled: false,
  maintenanceMode: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    
    // Listen for settings updates (when admin saves)
    const handleSettingsUpdate = () => {
      fetchSettings();
    };
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
}


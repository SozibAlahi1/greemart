'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Upload, Globe, Mail, Phone, MapPin, Share2, Truck, CreditCard, Image as ImageIcon, Search, Wrench, Package, Shield, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/app/components/Toast';
import FormSkeleton from '@/components/skeletons/FormSkeleton';

interface SettingsData {
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
  steadfastApiKey?: string;
  steadfastSecretKey?: string;
  fraudCheckApiKey?: string;
  whatsappApiKey?: string;
  whatsappApiUrl?: string;
  whatsappPhoneNumberId?: string;
}

export default function SettingsPage() {
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    freeDeliveryThreshold: 500,
    deliveryFee: 50,
    deliveryTime: '2-3 days',
    currency: 'BDT',
    currencySymbol: '৳',
    taxRate: 5,
    bannerEnabled: false,
    maintenanceMode: false,
    steadfastApiKey: '',
    steadfastSecretKey: '',
    fraudCheckApiKey: '',
    whatsappApiKey: '',
    whatsappApiUrl: '',
    whatsappPhoneNumberId: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('Fetching settings...');
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        console.log('Settings loaded:', data);
        setSettings(data);
      } else {
        const error = await response.json();
        console.error('Failed to fetch settings:', error);
        showToast(error.message || 'Failed to load settings', 'error');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Saving settings:', settings);
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const updatedData = await response.json();
        console.log('Settings saved successfully:', updatedData);
        setSettings(updatedData); // Update with server response
        // Notify frontend components to refresh settings
        window.dispatchEvent(new CustomEvent('settingsUpdated'));
        showToast('Settings saved successfully!', 'success');
      } else {
        const error = await response.json();
        console.error('Failed to save settings:', error);
        showToast(error.message || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (field: 'siteLogo' | 'siteFavicon', file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, [field]: data.url });
        showToast('Image uploaded successfully!', 'success');
      } else {
        showToast('Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Failed to upload image', 'error');
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <>
      {ToastComponent}
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your store settings and configuration
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">
              <Globe className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="h-4 w-4 mr-2" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="delivery">
              <Truck className="h-4 w-4 mr-2" />
              Delivery
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Wrench className="h-4 w-4 mr-2" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="steadfast">
              <Package className="h-4 w-4 mr-2" />
              Steadfast Courier
            </TabsTrigger>
            <TabsTrigger value="whatsapp">
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp Marketing
            </TabsTrigger>
            <TabsTrigger value="fraud">
              <Shield className="h-4 w-4 mr-2" />
              Fraud Check
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure your site's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    placeholder="My Grocery Store"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    placeholder="A brief description of your store"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Site Logo</Label>
                  <div className="flex items-center gap-4">
                    {settings.siteLogo && (
                      <img
                        src={settings.siteLogo}
                        alt="Site Logo"
                        className="h-20 w-20 object-contain border rounded"
                      />
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('siteLogo', file);
                        }}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="flex items-center gap-4">
                    {settings.siteFavicon && (
                      <img
                        src={settings.siteFavicon}
                        alt="Favicon"
                        className="h-16 w-16 object-contain border rounded"
                      />
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('siteFavicon', file);
                        }}
                        className="hidden"
                        id="favicon-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('favicon-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Favicon
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Settings */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Update your store's contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    placeholder="contact@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Phone
                  </Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactAddress">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Address
                  </Label>
                  <Textarea
                    id="contactAddress"
                    value={settings.contactAddress}
                    onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                    placeholder="123 Main St, City, Country"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Add your social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook URL</Label>
                  <Input
                    id="facebookUrl"
                    type="url"
                    value={settings.facebookUrl || ''}
                    onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter URL</Label>
                  <Input
                    id="twitterUrl"
                    type="url"
                    value={settings.twitterUrl || ''}
                    onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    type="url"
                    value={settings.instagramUrl || ''}
                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube URL</Label>
                  <Input
                    id="youtubeUrl"
                    type="url"
                    value={settings.youtubeUrl || ''}
                    onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/yourchannel"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Settings */}
          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Settings</CardTitle>
                <CardDescription>
                  Configure delivery options and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="freeDeliveryThreshold">
                    Free Delivery Threshold ({settings.currencySymbol})
                  </Label>
                  <Input
                    id="freeDeliveryThreshold"
                    type="number"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum order amount for free delivery
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryFee">
                    Delivery Fee ({settings.currencySymbol})
                  </Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    value={settings.deliveryFee}
                    onChange={(e) => setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Delivery Time</Label>
                  <Input
                    id="deliveryTime"
                    value={settings.deliveryTime}
                    onChange={(e) => setSettings({ ...settings, deliveryTime: e.target.value })}
                    placeholder="2-3 days"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure currency and tax settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    placeholder="BDT"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    value={settings.currencySymbol}
                    onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                    placeholder="৳"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimize your site for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={settings.metaTitle || ''}
                    onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                    placeholder="Your Store - Best Groceries Online"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={settings.metaDescription || ''}
                    onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                    placeholder="A compelling description of your store"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    id="metaKeywords"
                    value={settings.metaKeywords || ''}
                    onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
                    placeholder="grocery, online shopping, fresh food"
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate keywords with commas
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="bannerEnabled">Enable Banner</Label>
                    <p className="text-sm text-muted-foreground">
                      Show promotional banner on homepage
                    </p>
                  </div>
                  <Switch
                    id="bannerEnabled"
                    checked={settings.bannerEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, bannerEnabled: checked })}
                  />
                </div>

                {settings.bannerEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="bannerText">Banner Text</Label>
                    <Input
                      id="bannerText"
                      value={settings.bannerText || ''}
                      onChange={(e) => setSettings({ ...settings, bannerText: e.target.value })}
                      placeholder="Special offer! Free delivery on orders over ৳500"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Mode */}
          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>
                  Put your store in maintenance mode
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Hide your store from visitors
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>

                {settings.maintenanceMode && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                    <Textarea
                      id="maintenanceMessage"
                      value={settings.maintenanceMessage || ''}
                      onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                      placeholder="We're currently performing maintenance. We'll be back soon!"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Steadfast Courier Settings */}
          <TabsContent value="steadfast">
            <Card>
              <CardHeader>
                <CardTitle>Steadfast Courier Integration</CardTitle>
                <CardDescription>
                  Configure your Steadfast Courier API credentials to enable order shipping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Contact Steadfast Courier Ltd. to obtain your API credentials. 
                    These credentials are required to send orders and track deliveries.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="steadfastApiKey">
                    <Package className="h-4 w-4 inline mr-2" />
                    API Key
                  </Label>
                  <Input
                    id="steadfastApiKey"
                    type="password"
                    value={settings.steadfastApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, steadfastApiKey: e.target.value })}
                    placeholder="Enter your Steadfast API Key"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your unique API key provided by Steadfast Courier
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="steadfastSecretKey">
                    <Package className="h-4 w-4 inline mr-2" />
                    Secret Key
                  </Label>
                  <Input
                    id="steadfastSecretKey"
                    type="password"
                    value={settings.steadfastSecretKey || ''}
                    onChange={(e) => setSettings({ ...settings, steadfastSecretKey: e.target.value })}
                    placeholder="Enter your Steadfast Secret Key"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your secret key for API authentication
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Security:</strong> Your API credentials are stored securely in the database. 
                    Make sure to keep them confidential and never share them publicly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Marketing Settings */}
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Marketing Integration</CardTitle>
                <CardDescription>
                  Configure your WhatsApp Business API credentials to enable marketing features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> WhatsApp Marketing allows you to send direct messages, cart recovery, 
                    order notifications, and broadcasts to increase sales and customer engagement.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappApiKey">
                    <MessageSquare className="h-4 w-4 inline mr-2" />
                    API Key / Access Token
                  </Label>
                  <Input
                    id="whatsappApiKey"
                    type="password"
                    value={settings.whatsappApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, whatsappApiKey: e.target.value })}
                    placeholder="Enter your WhatsApp API Access Token"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your WhatsApp Business API access token from Meta/Facebook
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappApiUrl">API URL (Optional)</Label>
                  <Input
                    id="whatsappApiUrl"
                    type="text"
                    value={settings.whatsappApiUrl || ''}
                    onChange={(e) => setSettings({ ...settings, whatsappApiUrl: e.target.value })}
                    placeholder="https://graph.facebook.com/v18.0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Default: https://graph.facebook.com/v18.0
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappPhoneNumberId">Phone Number ID (Optional)</Label>
                  <Input
                    id="whatsappPhoneNumberId"
                    type="text"
                    value={settings.whatsappPhoneNumberId || ''}
                    onChange={(e) => setSettings({ ...settings, whatsappPhoneNumberId: e.target.value })}
                    placeholder="Enter your WhatsApp Phone Number ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your WhatsApp Business Phone Number ID from Meta Business Manager
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Security:</strong> Your API credentials are stored securely in the database. 
                    Make sure to keep them confidential and never share them publicly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fraud Check Settings */}
          <TabsContent value="fraud">
            <Card>
              <CardHeader>
                <CardTitle>Fraud Check Integration</CardTitle>
                <CardDescription>
                  Configure your Fraud Check API credentials to enable order fraud detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> This service checks courier data via phone number to detect potential fraud. 
                    It provides success ratio, total orders, and risk level for each phone number.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fraudCheckApiKey">
                    <Shield className="h-4 w-4 inline mr-2" />
                    API Key
                  </Label>
                  <Input
                    id="fraudCheckApiKey"
                    type="password"
                    value={settings.fraudCheckApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, fraudCheckApiKey: e.target.value })}
                    placeholder="Enter your Fraud Check API Key"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Bearer token for API access (e.g., bdc_OxYzKFtO2YzaJx39AexxzipeHvHLedPeIbGeMbIlao0VPRaA8NUScPzzARaA)
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Security:</strong> Your API key is stored securely in the database. 
                    Make sure to keep it confidential and never share it publicly.
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>How it works:</strong> When you check an order for fraud, the system will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Query the fraud check API with the customer's phone number</li>
                      <li>Retrieve order history and success ratio</li>
                      <li>Calculate risk level (Low, Medium, High) based on success ratio</li>
                      <li>Display fraud score and order statistics</li>
                    </ul>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}


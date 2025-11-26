'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Upload, Globe, Mail, Phone, MapPin, Share2, Truck, CreditCard, Image as ImageIcon, Search, Wrench, Package, Shield, MessageSquare, Home, Plus, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/app/components/Toast';
import FormSkeleton from '@/components/skeletons/FormSkeleton';
import { DEFAULT_THEME_COLOR } from '@/lib/constants/theme';

interface SettingsData {
  _id?: string;
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  siteFavicon?: string;
  themeColor?: string;
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
  homepageSlider?: Array<{
    id: string;
    image: string;
    title?: string;
    subtitle?: string;
    link?: string;
    buttonText?: string;
  }>;
  footerCopyright?: string;
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
    homepageSlider: [],
    footerCopyright: '',
    themeColor: DEFAULT_THEME_COLOR,
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
        setSettings({
          ...data,
          themeColor: data.themeColor || DEFAULT_THEME_COLOR,
        });
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
      const payload = {
        ...settings,
        themeColor: settings.themeColor || DEFAULT_THEME_COLOR,
      };
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedData = await response.json();
        console.log('Settings saved successfully:', updatedData);
        setSettings({
          ...updatedData,
          themeColor: updatedData.themeColor || DEFAULT_THEME_COLOR,
        }); // Update with server response
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

  const themeColorValue = settings.themeColor || DEFAULT_THEME_COLOR;

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

        <Tabs defaultValue="general" className="flex gap-6">
          <TabsList className="flex flex-col h-auto w-64 bg-card border rounded-lg p-4 space-y-2">
            <TabsTrigger 
              value="general" 
              className="w-full justify-start px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Globe className="h-5 w-5 mr-3" />
              <span className="font-medium">General</span>
            </TabsTrigger>
            <TabsTrigger 
              value="homepage" 
              className="w-full justify-start px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Home className="h-5 w-5 mr-3" />
              <span className="font-medium">Homepage</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contact" 
              className="w-full justify-start px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Mail className="h-5 w-5 mr-3" />
              <span className="font-medium">Contact</span>
            </TabsTrigger>
            <TabsTrigger 
              value="social" 
              className="w-full justify-start px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Share2 className="h-5 w-5 mr-3" />
              <span className="font-medium">Social Media</span>
            </TabsTrigger>
            <TabsTrigger 
              value="delivery" 
              className="w-full justify-start px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Truck className="h-5 w-5 mr-3" />
              <span className="font-medium">Delivery</span>
            </TabsTrigger>
            <TabsTrigger 
              value="payment" 
              className="w-full justify-start px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CreditCard className="h-5 w-5 mr-3" />
              <span className="font-medium">Payment</span>
            </TabsTrigger>
            <TabsTrigger 
              value="seo" 
              className="w-full justify-start px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Search className="h-5 w-5 mr-3" />
              <span className="font-medium">SEO</span>
            </TabsTrigger>
            <TabsTrigger 
              value="maintenance" 
              className="w-full justify-start px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Wrench className="h-5 w-5 mr-3" />
              <span className="font-medium">Maintenance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="steadfast" 
              className="w-full justify-start px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Package className="h-5 w-5 mr-3" />
              <span className="font-medium">Steadfast Courier</span>
            </TabsTrigger>
            <TabsTrigger 
              value="whatsapp" 
              className="w-full justify-start px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MessageSquare className="h-5 w-5 mr-3" />
              <span className="font-medium">WhatsApp Marketing</span>
            </TabsTrigger>
            <TabsTrigger 
              value="fraud" 
              className="w-full justify-start px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="h-5 w-5 mr-3" />
              <span className="font-medium">Fraud Check</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1">

            {/* General Settings */}
            <TabsContent value="general" className="mt-0">
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

                <div className="space-y-2">
                  <Label htmlFor="themeColor">Theme Color</Label>
                  <div className="flex flex-wrap items-center gap-4">
                    <Input
                      id="themeColor"
                      type="color"
                      value={themeColorValue}
                      onChange={(e) =>
                        setSettings({ ...settings, themeColor: e.target.value })
                      }
                      className="h-12 w-24 cursor-pointer p-1"
                    />
                    <div>
                      <p className="text-sm font-mono">{themeColorValue.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        Controls primary buttons, highlights, and other accent elements across the site.
                      </p>
                    </div>
                    <div
                      className="h-10 w-10 rounded-full border shadow-sm"
                      style={{ backgroundColor: themeColorValue }}
                      aria-label="Theme color preview"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

            {/* Homepage Settings */}
            <TabsContent value="homepage" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Homepage Slider</CardTitle>
                  <CardDescription>
                    Manage your homepage slider images and links
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {(settings.homepageSlider || []).map((slide, index) => (
                      <div key={slide.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Slide {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updated = [...(settings.homepageSlider || [])];
                              updated.splice(index, 1);
                              setSettings({ ...settings, homepageSlider: updated });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input
                              value={slide.image}
                              onChange={(e) => {
                                const updated = [...(settings.homepageSlider || [])];
                                updated[index].image = e.target.value;
                                setSettings({ ...settings, homepageSlider: updated });
                              }}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Link (optional)</Label>
                            <Input
                              value={slide.link || ''}
                              onChange={(e) => {
                                const updated = [...(settings.homepageSlider || [])];
                                updated[index].link = e.target.value;
                                setSettings({ ...settings, homepageSlider: updated });
                              }}
                              placeholder="/?category=Fruits"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Title (optional)</Label>
                            <Input
                              value={slide.title || ''}
                              onChange={(e) => {
                                const updated = [...(settings.homepageSlider || [])];
                                updated[index].title = e.target.value;
                                setSettings({ ...settings, homepageSlider: updated });
                              }}
                              placeholder="Fresh Organic Produce"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Subtitle (optional)</Label>
                            <Input
                              value={slide.subtitle || ''}
                              onChange={(e) => {
                                const updated = [...(settings.homepageSlider || [])];
                                updated[index].subtitle = e.target.value;
                                setSettings({ ...settings, homepageSlider: updated });
                              }}
                              placeholder="Get 20% off on all organic fruits"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Button Text (optional)</Label>
                            <Input
                              value={slide.buttonText || ''}
                              onChange={(e) => {
                                const updated = [...(settings.homepageSlider || [])];
                                updated[index].buttonText = e.target.value;
                                setSettings({ ...settings, homepageSlider: updated });
                              }}
                              placeholder="Shop Now"
                            />
                          </div>
                        </div>
                        {slide.image && (
                          <div className="mt-4">
                            <img
                              src={slide.image}
                              alt={`Slide ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newSlide = {
                          id: Date.now().toString(),
                          image: '',
                          title: '',
                          subtitle: '',
                          link: '',
                          buttonText: '',
                        };
                        setSettings({
                          ...settings,
                          homepageSlider: [...(settings.homepageSlider || []), newSlide],
                        });
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Slide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Footer Copyright</CardTitle>
                  <CardDescription>
                    Customize the copyright text displayed in the footer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="footerCopyright">Copyright Text</Label>
                    <Textarea
                      id="footerCopyright"
                      value={settings.footerCopyright || ''}
                      onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })}
                      placeholder={`&copy; ${new Date().getFullYear()} ${settings.siteName || 'Your Store'}. All rights reserved.`}
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      Leave empty to use default copyright text. You can use HTML tags like &lt;strong&gt; for formatting.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Settings */}
            <TabsContent value="contact" className="mt-0">
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
            <TabsContent value="social" className="mt-0">
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
            <TabsContent value="delivery" className="mt-0">
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
            <TabsContent value="payment" className="mt-0">
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
            <TabsContent value="seo" className="mt-0">
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
            <TabsContent value="maintenance" className="mt-0">
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
            <TabsContent value="steadfast" className="mt-0">
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
            <TabsContent value="whatsapp" className="mt-0">
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
            <TabsContent value="fraud" className="mt-0">
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
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <p className="mb-2">
                      <strong>How it works:</strong> When you check an order for fraud, the system will:
                    </p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Query the fraud check API with the customer's phone number</li>
                      <li>Retrieve order history and success ratio</li>
                      <li>Calculate risk level (Low, Medium, High) based on success ratio</li>
                      <li>Display fraud score and order statistics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}


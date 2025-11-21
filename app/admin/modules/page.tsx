'use client';

import { useState, useEffect } from 'react';
import { Package, Check, X, ShoppingCart, Settings as SettingsIcon, Shield, Truck, BarChart3, Bell, Menu as MenuIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/app/components/Toast';
import PageSkeleton from '@/components/skeletons/PageSkeleton';

interface Module {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'core' | 'premium' | 'integration' | 'analytics';
  icon?: string;
  price: number;
  requiresPurchase: boolean;
  enabled: boolean;
  purchased: boolean;
  purchasedAt?: string;
  settings?: Record<string, any>;
  _id?: string;
}

const categoryIcons: Record<string, any> = {
  core: Package,
  premium: Shield,
  integration: Truck,
  analytics: BarChart3,
};

const categoryColors: Record<string, string> = {
  core: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  premium: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  integration: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  analytics: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export default function ModulesPage() {
  const { showToast, ToastComponent } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingModule, setPurchasingModule] = useState<string | null>(null);
  const [settingsDialog, setSettingsDialog] = useState<{ open: boolean; module: Module | null }>({
    open: false,
    module: null,
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/admin/modules');
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      showToast('Failed to load modules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (moduleId: string) => {
    setPurchasingModule(moduleId);
    try {
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, action: 'purchase' }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Module purchased successfully', 'success');
        fetchModules();
      } else {
        showToast(data.error || 'Failed to purchase module', 'error');
      }
    } catch (error) {
      showToast('Failed to purchase module', 'error');
    } finally {
      setPurchasingModule(null);
    }
  };

  const handleToggle = async (moduleId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, action: enabled ? 'enable' : 'disable' }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast(data.message || `Module ${enabled ? 'enabled' : 'disabled'} successfully`, 'success');
        fetchModules();
      } else {
        showToast(data.error || 'Failed to update module', 'error');
      }
    } catch (error) {
      showToast('Failed to update module', 'error');
    }
  };

  const handleOpenSettings = (module: Module) => {
    setSettingsDialog({ open: true, module });
  };

  const handleSaveSettings = async (settings: Record<string, any>) => {
    if (!settingsDialog.module) return;

    try {
      const response = await fetch('/api/admin/modules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: settingsDialog.module.id,
          settings,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast('Settings saved successfully', 'success');
        setSettingsDialog({ open: false, module: null });
        fetchModules();
      } else {
        showToast(data.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      showToast('Failed to save settings', 'error');
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
        <p className="text-muted-foreground">
          Manage and enable premium features for your store
        </p>
      </div>

      {Object.entries(groupedModules).map(([category, categoryModules]) => {
        const CategoryIcon = categoryIcons[category] || Package;
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CategoryIcon className="h-5 w-5" />
                {category.charAt(0).toUpperCase() + category.slice(1)} Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryModules.map((module) => {
                  const isCore = module.category === 'core';
                  return (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{module.name}</h3>
                          <Badge className={categoryColors[module.category]}>
                            {module.category}
                          </Badge>
                          {module.purchased && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              Purchased
                            </Badge>
                          )}
                          {module.enabled && (
                            <Badge variant="default" className="bg-green-600">
                              Enabled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Version: {module.version}</span>
                          {module.price === 0 ? (
                            <span className="text-green-600 font-semibold">Free</span>
                          ) : (
                            <span>Price: ${module.price}</span>
                          )}
                          {module.purchasedAt && (
                            <span>Purchased: {new Date(module.purchasedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {!module.purchased && module.requiresPurchase && (
                          <Button
                            onClick={() => handlePurchase(module.id)}
                            disabled={purchasingModule === module.id}
                            size="sm"
                          >
                            {purchasingModule === module.id ? (
                              <>Loading...</>
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Purchase
                              </>
                            )}
                          </Button>
                        )}
                        {module.purchased && (
                          <>
                            {!isCore && (
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`toggle-${module.id}`} className="text-sm">
                                  {module.enabled ? 'Enabled' : 'Disabled'}
                                </Label>
                                <Switch
                                  id={`toggle-${module.id}`}
                                  checked={module.enabled}
                                  onCheckedChange={(checked) => handleToggle(module.id, checked)}
                                  disabled={isCore}
                                />
                              </div>
                            )}
                            {module.settings && Object.keys(module.settings).length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenSettings(module)}
                              >
                                <SettingsIcon className="h-4 w-4 mr-2" />
                                Settings
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Settings Dialog */}
      <Dialog open={settingsDialog.open} onOpenChange={(open) => setSettingsDialog({ open, module: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{settingsDialog.module?.name} Settings</DialogTitle>
            <DialogDescription>
              Configure settings for this module
            </DialogDescription>
          </DialogHeader>
          {settingsDialog.module && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Module settings are managed in the main Settings page under the respective tabs.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialog({ open: false, module: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {ToastComponent}
    </div>
  );
}


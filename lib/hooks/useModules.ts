'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to check module status on the client side
 */
export function useModules() {
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModuleStatus();
  }, []);

  const fetchModuleStatus = async () => {
    try {
      const response = await fetch('/api/admin/modules/status');
      if (response.ok) {
        const data = await response.json();
        setEnabledModules(data.enabled || []);
      }
    } catch (error) {
      console.error('Error fetching module status:', error);
    } finally {
      setLoading(false);
    }
  };

  const isModuleEnabled = (moduleId: string): boolean => {
    // Core modules are always enabled
    const coreModules = ['dashboard', 'products', 'orders'];
    if (coreModules.includes(moduleId)) {
      return true;
    }
    return enabledModules.includes(moduleId);
  };

  return {
    enabledModules,
    isModuleEnabled,
    loading,
    refresh: fetchModuleStatus,
  };
}


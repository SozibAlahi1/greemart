/**
 * Module Registry
 * Defines all available modules in the system
 */

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'core' | 'premium' | 'integration' | 'analytics';
  icon?: string;
  price: number; // 0 for free modules
  requiresPurchase: boolean; // Whether user needs to "purchase" (even if free)
  dependencies?: string[]; // Other module IDs this module depends on
  settings?: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'number' | 'boolean';
    required?: boolean;
  }[];
}

export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
  // Core modules (always enabled, cannot be disabled)
  'dashboard': {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Main admin dashboard with statistics and analytics',
    version: '1.0.0',
    category: 'core',
    price: 0,
    requiresPurchase: false,
  },
  'products': {
    id: 'products',
    name: 'Product Management',
    description: 'Manage products, categories, and inventory',
    version: '1.0.0',
    category: 'core',
    price: 0,
    requiresPurchase: false,
  },
  'orders': {
    id: 'orders',
    name: 'Order Management',
    description: 'View and manage customer orders',
    version: '1.0.0',
    category: 'core',
    price: 0,
    requiresPurchase: false,
  },
  'menus': {
    id: 'menus',
    name: 'Menu Management',
    description: 'WordPress-like menu management system',
    version: '1.0.0',
    category: 'premium',
    price: 0, // Free but requires purchase
    requiresPurchase: true,
  },
  
  // Premium/Integration modules
  'fraud-check': {
    id: 'fraud-check',
    name: 'Fraud Check',
    description: 'Check courier order history and fraud risk by phone number',
    version: '1.0.0',
    category: 'premium',
    price: 0, // Free but requires purchase
    requiresPurchase: true,
    settings: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
      },
    ],
  },
  'steadfast-courier': {
    id: 'steadfast-courier',
    name: 'Steadfast Courier',
    description: 'Integration with Steadfast Courier for order shipping and tracking',
    version: '1.0.0',
    category: 'integration',
    price: 0, // Free but requires purchase
    requiresPurchase: true,
    settings: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'text',
        required: true,
      },
      {
        key: 'secretKey',
        label: 'Secret Key',
        type: 'password',
        required: true,
      },
    ],
  },
  'analytics': {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Advanced order analytics and reporting with charts and graphs',
    version: '1.0.0',
    category: 'analytics',
    price: 0, // Free but requires purchase
    requiresPurchase: true,
  },
  'notifications': {
    id: 'notifications',
    name: 'Real-time Notifications',
    description: 'Real-time order notifications and alerts',
    version: '1.0.0',
    category: 'premium',
    price: 0, // Free but requires purchase
    requiresPurchase: true,
  },
  'whatsapp-marketing': {
    id: 'whatsapp-marketing',
    name: 'WhatsApp Marketing',
    description: 'Send direct messages, cart recovery, notifications, and broadcasts to increase sales and engagement',
    version: '1.0.0',
    category: 'premium',
    price: 0, // Free but requires purchase
    requiresPurchase: true,
    settings: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
      },
      {
        key: 'apiUrl',
        label: 'API URL',
        type: 'text',
        required: false,
      },
      {
        key: 'phoneNumberId',
        label: 'Phone Number ID',
        type: 'text',
        required: false,
      },
    ],
  },
};

/**
 * Get all module definitions
 */
export function getAllModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY);
}

/**
 * Get module definition by ID
 */
export function getModuleDefinition(moduleId: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY[moduleId];
}

/**
 * Get modules by category
 */
export function getModulesByCategory(category: ModuleDefinition['category']): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY).filter(m => m.category === category);
}

/**
 * Check if a module is a core module (cannot be disabled)
 */
export function isCoreModule(moduleId: string): boolean {
  const module = MODULE_REGISTRY[moduleId];
  return module?.category === 'core';
}


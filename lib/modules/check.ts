/**
 * Module Check Utilities
 * Functions to check if modules are enabled
 */

import connectDB from '@/lib/mongodb';
import Module, { ModuleLean } from '@/models/Module';

/**
 * Check if a module is enabled
 */
export async function isModuleEnabled(moduleId: string): Promise<boolean> {
  try {
    await connectDB();
    const module = await Module.findOne({ moduleId, enabled: true }).lean() as ModuleLean | null;
    return !!module;
  } catch (error) {
    console.error(`Error checking module ${moduleId}:`, error);
    return false;
  }
}

/**
 * Check if multiple modules are enabled
 */
export async function areModulesEnabled(moduleIds: string[]): Promise<Record<string, boolean>> {
  try {
    await connectDB();
    const modules = await Module.find({ 
      moduleId: { $in: moduleIds }, 
      enabled: true 
    }).lean() as unknown as ModuleLean[];
    
    const enabledSet = new Set(modules.map(m => m.moduleId));
    const result: Record<string, boolean> = {};
    
    moduleIds.forEach(id => {
      result[id] = enabledSet.has(id);
    });
    
    return result;
  } catch (error) {
    console.error('Error checking modules:', error);
    return moduleIds.reduce((acc, id) => ({ ...acc, [id]: false }), {});
  }
}

/**
 * Get all enabled modules
 */
export async function getEnabledModules(): Promise<string[]> {
  try {
    await connectDB();
    const modules = await Module.find({ enabled: true }).lean() as unknown as ModuleLean[];
    return modules.map(m => m.moduleId);
  } catch (error) {
    console.error('Error getting enabled modules:', error);
    return [];
  }
}

/**
 * Get module status (enabled, purchased, etc.)
 */
export async function getModuleStatus(moduleId: string) {
  try {
    await connectDB();
    const module = await Module.findOne({ moduleId }).lean() as ModuleLean | null;
    return {
      enabled: module?.enabled || false,
      purchased: module?.purchased || false,
      module: module,
    };
  } catch (error) {
    console.error(`Error getting module status for ${moduleId}:`, error);
    return {
      enabled: false,
      purchased: false,
      module: null,
    };
  }
}


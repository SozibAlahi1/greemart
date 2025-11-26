import { DEFAULT_THEME_COLOR } from '@/lib/constants/theme';

export type HslColor = { h: number; s: number; l: number };

export interface ThemeCssVariables {
  primary: string;
  ring: string;
  accent: string;
  primaryForeground: string;
  accentForeground: string;
}

export function sanitizeThemeColor(color?: string): string {
  if (!color) {
    return DEFAULT_THEME_COLOR;
  }

  let normalized = color.trim();
  if (!normalized.startsWith('#')) {
    normalized = `#${normalized}`;
  }

  if (/^#([0-9a-fA-F]{3})$/.test(normalized)) {
    normalized = `#${normalized
      .slice(1)
      .split('')
      .map((char) => char + char)
      .join('')}`;
  }

  if (/^#([0-9a-fA-F]{6})$/.test(normalized)) {
    return normalized.toLowerCase();
  }

  return DEFAULT_THEME_COLOR;
}

export function hexToHsl(hex: string): HslColor | null {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) {
    return null;
  }

  const r = parseInt(sanitized.slice(0, 2), 16) / 255;
  const g = parseInt(sanitized.slice(2, 4), 16) / 255;
  const b = parseInt(sanitized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / delta + 2) * 60;
        break;
      case b:
        h = ((r - g) / delta + 4) * 60;
        break;
    }

    s = delta / (1 - Math.abs(2 * l - 1));
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function formatHsl(color: HslColor) {
  return `${color.h} ${color.s}% ${color.l}%`;
}

export function createThemeCssVariables(color?: string): ThemeCssVariables {
  const sanitized = sanitizeThemeColor(color);
  const hsl = hexToHsl(sanitized) ?? (hexToHsl(DEFAULT_THEME_COLOR) as HslColor);

  const primary = formatHsl(hsl);
  const accentHsl: HslColor = { ...hsl, l: clamp(hsl.l + 12, 5, 95) };
  const accent = formatHsl(accentHsl);
  const primaryForeground = hsl.l > 60 ? '222 47% 11.2%' : '0 0% 100%';

  return {
    primary,
    ring: primary,
    accent,
    primaryForeground,
    accentForeground: primaryForeground,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}





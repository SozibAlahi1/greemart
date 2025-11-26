import type { CSSProperties } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import ConditionalLayout from "./components/ConditionalLayout";
import { getThemeColorFromSettings } from "@/lib/server/settings";
import { createThemeCssVariables } from "@/lib/themeColor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Fresh Groceries - Online Grocery Store",
  description: "Shop fresh groceries online with fast delivery",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeColor = await getThemeColorFromSettings();
  const cssVars = createThemeCssVariables(themeColor);
  const bodyStyle: CSSProperties & Record<string, string> = {
    '--primary': cssVars.primary,
    '--ring': cssVars.ring,
    '--accent': cssVars.accent,
    '--primary-foreground': cssVars.primaryForeground,
    '--accent-foreground': cssVars.accentForeground,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" style={bodyStyle}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}


'use client';

import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import Header from './Header';
import { useSettings } from '@/lib/useSettings';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Don't show header and footer for admin routes
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Show header and footer for frontend routes
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-12">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{settings.siteLogo ? (
                <img src={settings.siteLogo} alt={settings.siteName} className="h-8 inline-block mr-2" />
              ) : '🛒'} {settings.siteName}</h3>
              <p className="text-gray-400 text-sm">
                {settings.siteDescription}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/" className="hover:text-white transition">Home</a></li>
                <li><a href="/about" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/?category=Fruits & Vegetables" className="hover:text-white transition">Fruits & Vegetables</a></li>
                <li><a href="/?category=Dairy & Eggs" className="hover:text-white transition">Dairy & Eggs</a></li>
                <li><a href="/?category=Meat & Seafood" className="hover:text-white transition">Meat & Seafood</a></li>
                <li><a href="/?category=Bakery" className="hover:text-white transition">Bakery</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{settings.contactPhone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{settings.contactEmail}</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{settings.contactAddress}</span>
                </li>
              </ul>
              {(settings.facebookUrl || settings.twitterUrl || settings.instagramUrl || settings.youtubeUrl) && (
                <div className="mt-4 flex items-center gap-3">
                  <h5 className="text-sm font-semibold text-white">Follow Us</h5>
                  <div className="flex gap-2">
                    {settings.facebookUrl && (
                      <a 
                        href={settings.facebookUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white transition-all duration-300"
                        aria-label="Facebook"
                      >
                        <Facebook className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {settings.twitterUrl && (
                      <a 
                        href={settings.twitterUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-800 hover:bg-blue-400 text-gray-400 hover:text-white transition-all duration-300"
                        aria-label="Twitter"
                      >
                        <Twitter className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {settings.instagramUrl && (
                      <a 
                        href={settings.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-800 hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 text-gray-400 hover:text-white transition-all duration-300"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {settings.youtubeUrl && (
                      <a 
                        href={settings.youtubeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white transition-all duration-300"
                        aria-label="YouTube"
                      >
                        <Youtube className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            {settings.footerCopyright ? (
              <p dangerouslySetInnerHTML={{ __html: settings.footerCopyright }} />
            ) : (
              <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved. Built with Next.js 16</p>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}




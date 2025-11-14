'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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
              <h3 className="text-xl font-bold mb-4">🛒 Fresh Groceries</h3>
              <p className="text-gray-400 text-sm">
                Your trusted online grocery store. Fresh products delivered to your door.
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
                <li>📞 1-800-FRESH</li>
                <li>✉️ support@freshgroceries.com</li>
                <li>📍 123 Fresh Street, City, State 12345</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Fresh Groceries. All rights reserved. Built with Next.js 16</p>
          </div>
        </div>
      </footer>
    </>
  );
}



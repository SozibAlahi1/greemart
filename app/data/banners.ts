// Banner configuration for the carousel
// You can easily add, remove, or modify banners here

export interface Banner {
  id: number;
  image: string; // URL or path to image
  title?: string;
  subtitle?: string;
  link?: string;
  buttonText?: string;
}

export const banners: Banner[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&h=600&fit=crop',
    title: 'Fresh Organic Produce',
    subtitle: 'Get 20% off on all organic fruits and vegetables',
    link: '/?category=Fruits & Vegetables',
    buttonText: 'Shop Now',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1920&h=600&fit=crop',
    title: 'Premium Dairy Products',
    subtitle: 'Fresh milk, cheese, and yogurt delivered to your door',
    link: '/?category=Dairy & Eggs',
    buttonText: 'Explore',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&h=600&fit=crop',
    title: 'Free Delivery',
    subtitle: 'On orders over ৳50. Shop now and save!',
    link: '/',
    buttonText: 'Learn More',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&h=600&fit=crop',
    title: 'Fresh Bakery Items',
    subtitle: 'Daily baked bread, pastries, and desserts',
    link: '/?category=Bakery',
    buttonText: 'View Bakery',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=600&fit=crop',
    title: 'Premium Meat & Seafood',
    subtitle: 'Quality cuts and fresh catch delivered fresh',
    link: '/?category=Meat & Seafood',
    buttonText: 'Shop Meat',
  },
];


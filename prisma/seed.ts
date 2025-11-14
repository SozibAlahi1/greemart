import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const categoryData = [
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Bakery',
    'Beverages',
    'Snacks',
    'Frozen Foods',
    'Pantry Staples'
  ];

  for (const name of categoryData) {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    await prisma.category.create({
      data: { name, slug }
    });
  }
  console.log(`✅ Created ${categoryData.length} categories`);

  // Create products
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'Fresh Organic Apples',
        description: 'Crisp and sweet organic red apples, perfect for snacking',
        fullDescription: 'Our premium organic apples are hand-picked from certified organic farms. These crisp, juicy red apples are naturally grown without pesticides or synthetic fertilizers. Rich in fiber, vitamin C, and antioxidants, they make a perfect healthy snack for the whole family. Each apple is carefully selected to ensure the highest quality and freshness. Store in a cool, dry place for optimal freshness.',
        price: 4.99,
        image: '🍎',
        category: 'Fruits & Vegetables',
        inStock: true,
        rating: 4.5
      },
      {
        name: 'Whole Milk',
        description: 'Fresh whole milk, 1 gallon',
        fullDescription: 'Premium whole milk sourced from local dairy farms. Rich, creamy, and full of essential nutrients including calcium, protein, and vitamin D. Perfect for drinking, cooking, and baking. Pasteurized for safety and freshness. Keep refrigerated at all times. Best consumed within 7 days of opening.',
        price: 3.49,
        image: '🥛',
        category: 'Dairy & Eggs',
        inStock: true,
        rating: 4.7
      },
      {
        name: 'Fresh Salmon Fillet',
        description: 'Premium Atlantic salmon, 1 lb',
        fullDescription: 'Premium Atlantic salmon fillet, sustainably sourced and flash-frozen at peak freshness. Rich in omega-3 fatty acids, protein, and essential vitamins. Perfect for grilling, baking, or pan-searing. Each fillet is individually wrapped and ready to cook. High-quality seafood that meets our strict standards for freshness and sustainability.',
        price: 12.99,
        image: '🐟',
        category: 'Meat & Seafood',
        inStock: true,
        rating: 4.8
      },
      {
        name: 'Artisan Bread',
        description: 'Fresh baked artisan bread, 1 loaf',
        price: 4.99,
        image: '🍞',
        category: 'Bakery',
        inStock: true,
        rating: 4.7
      },
      {
        name: 'Orange Juice',
        description: 'Fresh squeezed orange juice, 64 oz',
        price: 5.99,
        image: '🍊',
        category: 'Beverages',
        inStock: true,
        rating: 4.6
      },
      {
        name: 'Organic Eggs',
        description: 'Free-range organic eggs, 12 count',
        price: 6.99,
        image: '🥚',
        category: 'Dairy & Eggs',
        inStock: true,
        rating: 4.8
      },
      {
        name: 'Fresh Chicken Breast',
        description: 'Boneless skinless chicken breast, 1 lb',
        price: 8.99,
        image: '🍗',
        category: 'Meat & Seafood',
        inStock: true,
        rating: 4.5
      },
      {
        name: 'Fresh Strawberries',
        description: 'Sweet organic strawberries, 1 lb',
        price: 5.99,
        image: '🍓',
        category: 'Fruits & Vegetables',
        inStock: true,
        rating: 4.6
      },
      {
        name: 'Chocolate Chip Cookies',
        description: 'Homemade chocolate chip cookies, 12 pack',
        price: 4.99,
        image: '🍪',
        category: 'Bakery',
        inStock: true,
        rating: 4.7
      },
      {
        name: 'Sparkling Water',
        description: 'Natural sparkling water, 12 pack',
        price: 6.99,
        image: '💧',
        category: 'Beverages',
        inStock: true,
        rating: 4.3
      },
      {
        name: 'Potato Chips',
        description: 'Classic salted potato chips, family size',
        price: 3.99,
        image: '🥔',
        category: 'Snacks',
        inStock: true,
        rating: 4.2
      },
      {
        name: 'Frozen Pizza',
        description: 'Pepperoni pizza, 14 inch',
        price: 7.99,
        image: '🍕',
        category: 'Frozen Foods',
        inStock: true,
        rating: 4.4
      },
      {
        name: 'Organic Tomatoes',
        description: 'Fresh organic tomatoes, 1 lb',
        price: 3.99,
        image: '🍅',
        category: 'Fruits & Vegetables',
        inStock: true,
        rating: 4.6
      },
      {
        name: 'Greek Yogurt',
        description: 'Plain Greek yogurt, 32 oz',
        price: 4.99,
        image: '🥣',
        category: 'Dairy & Eggs',
        inStock: true,
        rating: 4.8
      },
      {
        name: 'Pasta',
        description: 'Italian pasta, 1 lb',
        price: 2.49,
        image: '🍝',
        category: 'Pantry Staples',
        inStock: true,
        rating: 4.5
      },
      {
        name: 'Olive Oil',
        description: 'Extra virgin olive oil, 500ml',
        price: 8.99,
        image: '🫒',
        category: 'Pantry Staples',
        inStock: true,
        rating: 4.7
      }
    ]
  });

  console.log(`✅ Created ${products.count} products`);

  // Get product IDs for reviews
  const allProducts = await prisma.product.findMany();
  type ProductType = typeof allProducts[0];
  const appleProduct = allProducts.find((p: ProductType) => p.name === 'Fresh Organic Apples');
  const milkProduct = allProducts.find((p: ProductType) => p.name === 'Whole Milk');
  const salmonProduct = allProducts.find((p: ProductType) => p.name === 'Fresh Salmon Fillet');
  const breadProduct = allProducts.find((p: ProductType) => p.name === 'Artisan Bread');
  const juiceProduct = allProducts.find((p: ProductType) => p.name === 'Orange Juice');

  // Create reviews
  if (appleProduct) {
    await prisma.review.createMany({
      data: [
        {
          productId: appleProduct.id,
          userName: 'Sarah Johnson',
          rating: 5,
          comment: 'These apples are absolutely delicious! Very fresh and crisp. Perfect for my morning snack.',
          date: '2024-01-15',
          verified: true
        },
        {
          productId: appleProduct.id,
          userName: 'Michael Chen',
          rating: 4,
          comment: 'Great quality organic apples. They arrived fresh and lasted well. Would buy again!',
          date: '2024-01-10',
          verified: true
        },
        {
          productId: appleProduct.id,
          userName: 'Emily Davis',
          rating: 5,
          comment: 'Best apples I\'ve had in a while! Sweet, juicy, and organic. Highly recommend!',
          date: '2024-01-08',
          verified: false
        }
      ]
    });
  }

  if (milkProduct) {
    await prisma.review.createMany({
      data: [
        {
          productId: milkProduct.id,
          userName: 'David Wilson',
          rating: 5,
          comment: 'Fresh milk delivered right to my door. Great taste and quality. Will order again!',
          date: '2024-01-12',
          verified: true
        },
        {
          productId: milkProduct.id,
          userName: 'Lisa Anderson',
          rating: 4,
          comment: 'Good quality milk, very fresh. Packaging was excellent. Satisfied with my purchase.',
          date: '2024-01-09',
          verified: true
        }
      ]
    });
  }

  if (salmonProduct) {
    await prisma.review.createMany({
      data: [
        {
          productId: salmonProduct.id,
          userName: 'James Brown',
          rating: 5,
          comment: 'Premium salmon! Very fresh and high quality. Cooked perfectly and tasted amazing.',
          date: '2024-01-14',
          verified: true
        },
        {
          productId: salmonProduct.id,
          userName: 'Maria Garcia',
          rating: 4,
          comment: 'Great salmon fillet, fresh and well-packaged. Good value for money.',
          date: '2024-01-11',
          verified: false
        }
      ]
    });
  }

  if (breadProduct) {
    await prisma.review.create({
      data: {
        productId: breadProduct.id,
        userName: 'Robert Taylor',
        rating: 5,
        comment: 'Artisan bread is fantastic! Fresh baked taste, perfect texture. My family loves it!',
        date: '2024-01-13',
        verified: true
      }
    });
  }

  if (juiceProduct) {
    await prisma.review.createMany({
      data: [
        {
          productId: juiceProduct.id,
          userName: 'Jennifer Lee',
          rating: 4,
          comment: 'Pure orange juice, no added sugar. Fresh and delicious. Great for breakfast!',
          date: '2024-01-07',
          verified: true
        },
        {
          productId: juiceProduct.id,
          userName: 'Thomas Moore',
          rating: 5,
          comment: 'Best orange juice I\'ve ever had! Fresh, natural, and full of flavor.',
          date: '2024-01-05',
          verified: false
        }
      ]
    });
  }

  console.log('✅ Created reviews');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



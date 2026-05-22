/**
 * Seed dataset — categories, brands, products, users.
 * Pure data only; no I/O. Imported by index.ts.
 */

export interface SeedCategory {
  key: string;
  name: string;
  slug: string;
  children?: { key: string; name: string; slug: string }[];
}

export interface SeedBrand {
  key: string;
  name: string;
  slug: string;
}

export interface SeedProduct {
  sku: string;
  slug: string;
  name: string;
  description: string;
  brandKey: string;
  categoryKey: string;
  basePrice: number; // paise
  attributes: Record<string, unknown>;
  variants?: { sku: string; name: string; price?: number; attributes?: Record<string, unknown> }[];
  stock: number;
}

export interface SeedUser {
  email: string;
  name: string;
  mobile?: string;
  password: string;
  addresses?: SeedAddress[];
}

export interface SeedAddress {
  label: string;
  fullName: string;
  mobile: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export const CATEGORIES: SeedCategory[] = [
  {
    key: "electronics",
    name: "Electronics",
    slug: "electronics",
    children: [
      { key: "smartphones", name: "Smartphones", slug: "smartphones" },
      { key: "laptops", name: "Laptops", slug: "laptops" },
      { key: "audio", name: "Audio & Headphones", slug: "audio-headphones" },
    ],
  },
  {
    key: "fashion",
    name: "Fashion",
    slug: "fashion",
    children: [
      { key: "mens-clothing", name: "Men's Clothing", slug: "mens-clothing" },
      { key: "womens-clothing", name: "Women's Clothing", slug: "womens-clothing" },
      { key: "footwear", name: "Footwear", slug: "footwear" },
    ],
  },
  {
    key: "home-kitchen",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    children: [
      { key: "kitchen-appliances", name: "Kitchen Appliances", slug: "kitchen-appliances" },
      { key: "cookware", name: "Cookware", slug: "cookware" },
    ],
  },
  {
    key: "beauty",
    name: "Beauty & Personal Care",
    slug: "beauty",
    children: [
      { key: "skincare", name: "Skincare", slug: "skincare" },
      { key: "fragrance", name: "Fragrance", slug: "fragrance" },
    ],
  },
  {
    key: "sports",
    name: "Sports & Fitness",
    slug: "sports-fitness",
  },
  {
    key: "books",
    name: "Books",
    slug: "books",
  },
  {
    key: "grocery",
    name: "Grocery",
    slug: "grocery",
  },
  {
    key: "toys",
    name: "Toys & Games",
    slug: "toys-games",
  },
];

export const BRANDS: SeedBrand[] = [
  { key: "apple", name: "Apple", slug: "apple" },
  { key: "samsung", name: "Samsung", slug: "samsung" },
  { key: "sony", name: "Sony", slug: "sony" },
  { key: "oneplus", name: "OnePlus", slug: "oneplus" },
  { key: "boat", name: "boAt", slug: "boat" },
  { key: "hp", name: "HP", slug: "hp" },
  { key: "dell", name: "Dell", slug: "dell" },
  { key: "nike", name: "Nike", slug: "nike" },
  { key: "adidas", name: "Adidas", slug: "adidas" },
  { key: "puma", name: "Puma", slug: "puma" },
  { key: "levis", name: "Levi's", slug: "levis" },
  { key: "hm", name: "H&M", slug: "hm" },
  { key: "philips", name: "Philips", slug: "philips" },
  { key: "prestige", name: "Prestige", slug: "prestige" },
  { key: "lakme", name: "Lakmé", slug: "lakme" },
  { key: "loreal", name: "L'Oréal", slug: "loreal" },
];

export const PRODUCTS: SeedProduct[] = [
  // Smartphones
  {
    sku: "APPLE-IP15-128",
    slug: "apple-iphone-15-128gb",
    name: "Apple iPhone 15 (128GB, Blue)",
    description:
      "The iPhone 15 features a new Dynamic Island, a 48 MP camera with 2x Telephoto, and the powerful A16 Bionic chip. **Free delivery** and easy returns.",
    brandKey: "apple",
    categoryKey: "smartphones",
    basePrice: 7990000,
    attributes: { color: "Blue", storage: "128GB", display: "6.1 inch OLED", chip: "A16 Bionic" },
    variants: [
      { sku: "APPLE-IP15-256", name: "256GB", price: 8990000 },
      { sku: "APPLE-IP15-512", name: "512GB", price: 10990000 },
    ],
    stock: 50,
  },
  {
    sku: "SAMSUNG-S24-256",
    slug: "samsung-galaxy-s24-256gb",
    name: "Samsung Galaxy S24 (256GB, Onyx Black)",
    description:
      "Galaxy AI is here. Snapdragon 8 Gen 3, 50MP triple camera, and a stunning Dynamic AMOLED display.",
    brandKey: "samsung",
    categoryKey: "smartphones",
    basePrice: 7499900,
    attributes: { color: "Onyx Black", storage: "256GB", display: "6.2 inch AMOLED" },
    stock: 40,
  },
  {
    sku: "ONEPLUS-12-256",
    slug: "oneplus-12-256gb",
    name: "OnePlus 12 (256GB, Silky Black)",
    description: "Snapdragon 8 Gen 3, 100W SUPERVOOC charging, Hasselblad cameras.",
    brandKey: "oneplus",
    categoryKey: "smartphones",
    basePrice: 6499900,
    attributes: { color: "Silky Black", storage: "256GB", ram: "12GB" },
    stock: 35,
  },
  {
    sku: "SAMSUNG-A55-128",
    slug: "samsung-galaxy-a55-128gb",
    name: "Samsung Galaxy A55 5G (128GB, Awesome Iceblue)",
    description: "5G ready, 50MP camera, Super AMOLED display, IP67 rated.",
    brandKey: "samsung",
    categoryKey: "smartphones",
    basePrice: 3999900,
    attributes: { color: "Awesome Iceblue", storage: "128GB", display: "6.6 inch" },
    stock: 60,
  },
  // Laptops
  {
    sku: "APPLE-MBA-M3-13",
    slug: "apple-macbook-air-m3-13",
    name: "Apple MacBook Air 13\" (M3, 8GB, 256GB)",
    description:
      "M3 chip with up to 18 hours battery. 13.6-inch Liquid Retina display. Whisper-quiet fanless design.",
    brandKey: "apple",
    categoryKey: "laptops",
    basePrice: 11490000,
    attributes: { chip: "Apple M3", ram: "8GB", storage: "256GB SSD", display: "13.6 inch" },
    variants: [
      { sku: "APPLE-MBA-M3-512", name: "M3 / 8GB / 512GB", price: 13490000 },
      { sku: "APPLE-MBA-M3-16-512", name: "M3 / 16GB / 512GB", price: 14990000 },
    ],
    stock: 25,
  },
  {
    sku: "HP-PAV-14-I5",
    slug: "hp-pavilion-14-i5",
    name: "HP Pavilion 14 (Intel i5, 16GB, 512GB SSD)",
    description: "Sleek 14-inch ultrabook with backlit keyboard and fingerprint reader.",
    brandKey: "hp",
    categoryKey: "laptops",
    basePrice: 5999900,
    attributes: { chip: "Intel Core i5", ram: "16GB", storage: "512GB SSD" },
    stock: 30,
  },
  {
    sku: "DELL-XPS-13-I7",
    slug: "dell-xps-13-i7",
    name: "Dell XPS 13 (Intel i7, 16GB, 1TB SSD)",
    description: "Premium 13.4-inch ultrabook with InfinityEdge display.",
    brandKey: "dell",
    categoryKey: "laptops",
    basePrice: 13499900,
    attributes: { chip: "Intel Core i7", ram: "16GB", storage: "1TB SSD" },
    stock: 15,
  },
  // Audio
  {
    sku: "SONY-WH1000XM5-BLK",
    slug: "sony-wh-1000xm5-black",
    name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones (Black)",
    description: "Industry-leading noise cancellation, 30-hour battery, crystal clear hands-free calling.",
    brandKey: "sony",
    categoryKey: "audio",
    basePrice: 2999000,
    attributes: { color: "Black", type: "Over-ear", battery: "30 hours", noise_cancellation: true },
    variants: [{ sku: "SONY-WH1000XM5-SLV", name: "Silver", price: 2999000 }],
    stock: 45,
  },
  {
    sku: "BOAT-AIRDOPES-141",
    slug: "boat-airdopes-141",
    name: "boAt Airdopes 141 Bluetooth Truly Wireless Earbuds",
    description: "42H playback, ENx Technology for clear calls, IPX4 water resistance.",
    brandKey: "boat",
    categoryKey: "audio",
    basePrice: 99900,
    attributes: { color: "Bold Black", battery: "42 hours total", waterproof: "IPX4" },
    stock: 200,
  },
  {
    sku: "APPLE-AIRPODS-PRO2",
    slug: "apple-airpods-pro-2",
    name: "Apple AirPods Pro (2nd generation)",
    description: "Adaptive Audio. Personalized Spatial Audio. Up to 2x more Active Noise Cancellation.",
    brandKey: "apple",
    categoryKey: "audio",
    basePrice: 2499900,
    attributes: { type: "In-ear", noise_cancellation: true, case: "MagSafe Charging" },
    stock: 80,
  },
  // Men's Clothing
  {
    sku: "LEVIS-511-32-IND",
    slug: "levis-511-slim-fit-jeans",
    name: "Levi's 511 Slim Fit Jeans (Indigo, 32W)",
    description: "Classic 511 slim fit. Stretchy denim that moves with you.",
    brandKey: "levis",
    categoryKey: "mens-clothing",
    basePrice: 349900,
    attributes: { color: "Indigo", fit: "Slim", material: "98% Cotton, 2% Elastane" },
    variants: [
      { sku: "LEVIS-511-30-IND", name: "30W", attributes: { waist: 30 } },
      { sku: "LEVIS-511-34-IND", name: "34W", attributes: { waist: 34 } },
      { sku: "LEVIS-511-36-IND", name: "36W", attributes: { waist: 36 } },
    ],
    stock: 120,
  },
  {
    sku: "HM-TEE-WHITE-M",
    slug: "hm-cotton-tee-white",
    name: "H&M Regular Fit Cotton T-Shirt (White)",
    description: "Soft jersey crew-neck tee in pure cotton. Perfect everyday essential.",
    brandKey: "hm",
    categoryKey: "mens-clothing",
    basePrice: 79900,
    attributes: { color: "White", fit: "Regular", material: "100% Cotton" },
    variants: [
      { sku: "HM-TEE-WHITE-S", name: "Small" },
      { sku: "HM-TEE-WHITE-L", name: "Large" },
      { sku: "HM-TEE-BLACK-M", name: "Black / M", attributes: { color: "Black" } },
    ],
    stock: 250,
  },
  // Footwear
  {
    sku: "NIKE-PEGASUS-40-9",
    slug: "nike-pegasus-40-running-shoes",
    name: "Nike Pegasus 40 Running Shoes (UK 9)",
    description: "Responsive Air Zoom cushioning. Built to take your training to the next level.",
    brandKey: "nike",
    categoryKey: "footwear",
    basePrice: 1099500,
    attributes: { type: "Running", size: "UK 9", cushioning: "Air Zoom" },
    variants: [
      { sku: "NIKE-PEGASUS-40-8", name: "UK 8" },
      { sku: "NIKE-PEGASUS-40-10", name: "UK 10" },
      { sku: "NIKE-PEGASUS-40-11", name: "UK 11" },
    ],
    stock: 90,
  },
  {
    sku: "ADIDAS-ULTRABOOST-9",
    slug: "adidas-ultraboost-22-mens",
    name: "Adidas Ultraboost 22 Running Shoes (Men's, UK 9)",
    description: "BOOST midsole returns energy with every stride. Primeknit upper hugs your foot.",
    brandKey: "adidas",
    categoryKey: "footwear",
    basePrice: 1799900,
    attributes: { type: "Running", size: "UK 9" },
    stock: 60,
  },
  {
    sku: "PUMA-SUEDE-CLASSIC",
    slug: "puma-suede-classic-xxi",
    name: "Puma Suede Classic XXI Sneakers",
    description: "The iconic Suede. A street style legend since 1968.",
    brandKey: "puma",
    categoryKey: "footwear",
    basePrice: 599900,
    attributes: { type: "Sneakers", material: "Suede leather" },
    stock: 100,
  },
  // Women's Clothing
  {
    sku: "HM-DRESS-FLR-M",
    slug: "hm-floral-summer-dress",
    name: "H&M Floral Summer Dress",
    description: "Lightweight viscose dress with elasticated waist and ruffled hem.",
    brandKey: "hm",
    categoryKey: "womens-clothing",
    basePrice: 199900,
    attributes: { color: "Floral Print", fit: "Regular" },
    stock: 80,
  },
  {
    sku: "LEVIS-WD-MOM-28",
    slug: "levis-mom-jeans-light-wash",
    name: "Levi's Mom Jeans (Light Wash, 28W)",
    description: "High-rise mom jean with a tapered leg. Vintage-inspired silhouette.",
    brandKey: "levis",
    categoryKey: "womens-clothing",
    basePrice: 459900,
    attributes: { color: "Light Wash", fit: "Mom", waist: 28 },
    stock: 70,
  },
  // Kitchen Appliances
  {
    sku: "PHILIPS-AIR-FRY-XL",
    slug: "philips-airfryer-xl",
    name: "Philips Airfryer XL",
    description: "Fry, bake, roast, and grill with little to no oil. 1.4kg capacity.",
    brandKey: "philips",
    categoryKey: "kitchen-appliances",
    basePrice: 1499900,
    attributes: { capacity: "1.4kg", power: "2100W" },
    stock: 25,
  },
  {
    sku: "PRESTIGE-MIXER-750",
    slug: "prestige-mixer-grinder-750w",
    name: "Prestige Iris 750W Mixer Grinder (3 jars)",
    description: "Three stainless steel jars. Powerful 750W motor with 3 speed control.",
    brandKey: "prestige",
    categoryKey: "kitchen-appliances",
    basePrice: 399900,
    attributes: { power: "750W", jars: 3 },
    stock: 50,
  },
  // Cookware
  {
    sku: "PRESTIGE-PAN-26",
    slug: "prestige-omega-deluxe-pan",
    name: "Prestige Omega Deluxe Granite Frying Pan (26cm)",
    description: "Non-stick granite coating. Induction friendly.",
    brandKey: "prestige",
    categoryKey: "cookware",
    basePrice: 124900,
    attributes: { size: "26cm", coating: "Granite", induction: true },
    stock: 80,
  },
  // Skincare
  {
    sku: "LOREAL-REVITALIFT-50",
    slug: "loreal-revitalift-day-cream",
    name: "L'Oréal Paris Revitalift Anti-Wrinkle Day Cream (50ml)",
    description: "Pro-Retinol formula. Visibly reduces wrinkles and firms skin.",
    brandKey: "loreal",
    categoryKey: "skincare",
    basePrice: 99900,
    attributes: { volume: "50ml", spf: "SPF 23" },
    stock: 150,
  },
  {
    sku: "LAKME-9TO5-PRIMER",
    slug: "lakme-9to5-primer",
    name: "Lakmé 9 to 5 Primer + Matte Powder Foundation Compact",
    description: "Primer + matte powder + foundation in one. 12-hour stay.",
    brandKey: "lakme",
    categoryKey: "skincare",
    basePrice: 67500,
    attributes: { shade: "Ivory Cream" },
    stock: 200,
  },
  // Fragrance
  {
    sku: "LOREAL-EDP-MIDNIGHT",
    slug: "loreal-midnight-edp",
    name: "L'Oréal Midnight Eau de Parfum (50ml)",
    description: "Warm, floral notes with a hint of vanilla. Long-lasting.",
    brandKey: "loreal",
    categoryKey: "fragrance",
    basePrice: 249900,
    attributes: { volume: "50ml", notes: "Floral, Vanilla" },
    stock: 60,
  },
  // Sports
  {
    sku: "NIKE-DUMBBELL-5KG",
    slug: "nike-rubber-dumbbell-5kg",
    name: "Nike Rubber Hex Dumbbell 5kg (pair)",
    description: "Rubber-coated hexagonal head. Knurled chrome handle.",
    brandKey: "nike",
    categoryKey: "sports",
    basePrice: 349900,
    attributes: { weight: "5kg", quantity: "Pair" },
    stock: 40,
  },
  {
    sku: "ADIDAS-YOGA-MAT-6",
    slug: "adidas-yoga-mat-6mm",
    name: "Adidas Yoga Mat 6mm (Black)",
    description: "Lightweight non-slip yoga mat with carry strap. 6mm cushioning.",
    brandKey: "adidas",
    categoryKey: "sports",
    basePrice: 199900,
    attributes: { thickness: "6mm", color: "Black" },
    stock: 100,
  },
  // Books
  {
    sku: "BOOK-IKIGAI",
    slug: "book-ikigai",
    name: "Ikigai: The Japanese Secret to a Long and Happy Life",
    description:
      "A small Japanese town's centenarians share their secrets. By Héctor García & Francesc Miralles.",
    brandKey: "hm",
    categoryKey: "books",
    basePrice: 39900,
    attributes: { format: "Hardcover", pages: 208 },
    stock: 300,
  },
  {
    sku: "BOOK-ATOMIC-HABITS",
    slug: "book-atomic-habits",
    name: "Atomic Habits by James Clear",
    description: "An easy & proven way to build good habits & break bad ones.",
    brandKey: "hm",
    categoryKey: "books",
    basePrice: 49900,
    attributes: { format: "Paperback", pages: 320 },
    stock: 400,
  },
  // Grocery
  {
    sku: "TATA-TEA-GOLD-1KG",
    slug: "tata-tea-gold-1kg",
    name: "Tata Tea Gold (1kg)",
    description: "Premium blend with long leaves for a rich taste and aroma.",
    brandKey: "philips",
    categoryKey: "grocery",
    basePrice: 67000,
    attributes: { weight: "1kg" },
    stock: 500,
  },
  {
    sku: "FORTUNE-OIL-5L",
    slug: "fortune-sunflower-oil-5l",
    name: "Fortune Sun Lite Refined Sunflower Oil (5L)",
    description: "Light and healthy refined sunflower oil. Rich in Vitamin A & D.",
    brandKey: "philips",
    categoryKey: "grocery",
    basePrice: 87500,
    attributes: { volume: "5L" },
    stock: 250,
  },
  // Toys
  {
    sku: "TOY-LEGO-CLASSIC-90",
    slug: "lego-classic-creative-bricks",
    name: "LEGO Classic Creative Bricks (484 pieces)",
    description: "Endless building possibilities. 484 colorful LEGO bricks in 35 colors.",
    brandKey: "hm",
    categoryKey: "toys",
    basePrice: 299900,
    attributes: { pieces: 484, age: "4+" },
    stock: 70,
  },
  {
    sku: "TOY-FUNSKOOL-MONOPOLY",
    slug: "funskool-monopoly-board",
    name: "Funskool Monopoly Board Game",
    description: "The classic property-trading game. 2 to 8 players.",
    brandKey: "hm",
    categoryKey: "toys",
    basePrice: 79900,
    attributes: { players: "2-8", age: "8+" },
    stock: 100,
  },
];

export const ABHI_PASSWORD = "1234";
export const ABHI_EMAIL = "abhi@gmail.com";

export const USERS: SeedUser[] = [
  {
    email: ABHI_EMAIL,
    name: "Abhi Patel",
    mobile: "9876543210",
    password: ABHI_PASSWORD,
    addresses: [
      {
        label: "Home",
        fullName: "Abhi Patel",
        mobile: "9876543210",
        line1: "Flat 304, Sky Heights",
        line2: "Sector 22, Kharghar",
        landmark: "Near Glomax Mall",
        city: "Navi Mumbai",
        state: "Maharashtra",
        pincode: "410210",
        isDefault: true,
      },
      {
        label: "Office",
        fullName: "Abhi Patel",
        mobile: "9876543210",
        line1: "Tech Park One, 5th Floor",
        line2: "Yerwada",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411006",
      },
      {
        label: "Parents",
        fullName: "Sunil Patel",
        mobile: "9876543299",
        line1: "12, Shanti Niwas",
        line2: "Navrangpura",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "380009",
      },
    ],
  },
  {
    email: "priya.sharma@example.com",
    name: "Priya Sharma",
    mobile: "9988776655",
    password: "PriyaPass1!Demo",
    addresses: [
      {
        label: "Home",
        fullName: "Priya Sharma",
        mobile: "9988776655",
        line1: "B-201, Rose Apartments",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        isDefault: true,
      },
    ],
  },
  {
    email: "ravi.kumar@example.com",
    name: "Ravi Kumar",
    mobile: "9123456789",
    password: "RaviPass1!Demo",
    addresses: [
      {
        label: "Home",
        fullName: "Ravi Kumar",
        mobile: "9123456789",
        line1: "47, MG Road",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
        isDefault: true,
      },
    ],
  },
  {
    email: "sneha.iyer@example.com",
    name: "Sneha Iyer",
    mobile: "9012345678",
    password: "SnehaPass1!Demo",
    addresses: [
      {
        label: "Home",
        fullName: "Sneha Iyer",
        mobile: "9012345678",
        line1: "12 Anna Salai",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600002",
        isDefault: true,
      },
    ],
  },
  {
    email: "kabir.singh@example.com",
    name: "Kabir Singh",
    mobile: "9876123450",
    password: "KabirPass1!Demo",
  },
];

// SKUs that go into abhi's cart, wishlist, and past orders.
export const ABHI_CART_SKUS = ["APPLE-AIRPODS-PRO2", "LEVIS-511-32-IND"];
export const ABHI_WISHLIST_SKUS = [
  "APPLE-IP15-128",
  "SONY-WH1000XM5-BLK",
  "APPLE-MBA-M3-13",
  "NIKE-PEGASUS-40-9",
  "PHILIPS-AIR-FRY-XL",
  "BOOK-ATOMIC-HABITS",
];
export const ABHI_PAST_ORDERS: {
  status: "delivered" | "shipped" | "confirmed";
  skus: { sku: string; qty: number }[];
  daysAgo: number;
}[] = [
  {
    status: "delivered",
    daysAgo: 24,
    skus: [
      { sku: "BOOK-IKIGAI", qty: 1 },
      { sku: "BOOK-ATOMIC-HABITS", qty: 1 },
    ],
  },
  {
    status: "delivered",
    daysAgo: 12,
    skus: [{ sku: "BOAT-AIRDOPES-141", qty: 1 }],
  },
  {
    status: "shipped",
    daysAgo: 3,
    skus: [
      { sku: "HM-TEE-WHITE-M", qty: 2 },
      { sku: "PUMA-SUEDE-CLASSIC", qty: 1 },
    ],
  },
];

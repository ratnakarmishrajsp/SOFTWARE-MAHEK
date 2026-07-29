import type {
  PLEntry,
  ExpenseEntry,
  RawMaterialPurchase,
  Product,
  InventoryItem,
  OrderItem,
  SystemSettings
} from '../types';

export const INITIAL_ATTAR_LIST: string[] = [
  'Kasturi',
  'Kesar Chandan',
  'Mogra',
  'Rose',
  'Katcha Bela',
  'Sandalwood',
  'Jannat-E-Firdous',
  'White Oud',
  'Black Oud',
  'Black Musk',
  'Ruh Khus',
  'Zaffran Musk',
  'Musk Tahara',
  'Gucci Flora',
  'Golden Pineapple',
  'First Rain (Mitti)',
  'Imperial White Oud',
  'Obsidian Black Oud'
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Imperial White Oud Pure Attar',
    bottleSize: '6ml',
    category: 'Pure Attar',
    costPrice: 180,
    sellingPrice: 899,
    weight: '45g',
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Active',
    barcode: 'MKH-WO-06',
    stock: 240
  },
  {
    id: 'prod-2',
    name: 'First Rain (Mitti Attar) Concentrate',
    bottleSize: '12ml',
    category: 'Pure Attar',
    costPrice: 240,
    sellingPrice: 1299,
    weight: '60g',
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Active',
    barcode: 'MKH-MT-12',
    stock: 185
  },
  {
    id: 'prod-3',
    name: 'Royal Rose & Katcha Bela Roll-On',
    bottleSize: '6ml',
    category: 'Pure Attar',
    costPrice: 120,
    sellingPrice: 699,
    weight: '40g',
    images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Active',
    barcode: 'MKH-RB-06',
    stock: 420
  },
  {
    id: 'prod-4',
    name: 'Obsidian Black Oud EDP Spray',
    bottleSize: '50ml',
    category: 'Luxury Perfume',
    costPrice: 450,
    sellingPrice: 2499,
    weight: '210g',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Active',
    barcode: 'MKH-BO-50',
    stock: 95
  },
  {
    id: 'prod-5',
    name: 'Grand Royal Attar Discovery Box (4x6ml)',
    bottleSize: 'Combo Set',
    category: 'Gift Box',
    costPrice: 520,
    sellingPrice: 2999,
    weight: '350g',
    images: [
      'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'Active',
    barcode: 'MKH-BOX-04',
    stock: 65
  }
];

export const INITIAL_PL_ENTRIES: PLEntry[] = [
  {
    id: 'pl-101',
    date: '2026-07-27',
    productId: 'prod-1',
    productName: 'Imperial White Oud Pure Attar',
    orders: 45,
    sellingPrice: 899,
    productCost: 180,
    packagingCost: 35,
    shippingCost: 75,
    codCharge: 40,
    paymentGatewayCharge: 18,
    expectedRtoPercent: 18,
    otherCharges: 10,
    revenue: 40455,
    expectedDeliveredOrders: 36.9,
    expectedRtoOrders: 8.1,
    totalOrderCost: 358,
    expectedProfit: 27244.8,
    expectedMargin: 67.35,
    aov: 899,
    expectedRoas: 3.8,
    isReconciled: true,
    actualDeliveredOrders: 38,
    actualRtoOrders: 6,
    cancelledOrders: 1,
    returnedOrders: 0,
    exchangeOrders: 0,
    refundOrders: 0,
    actualProfit: 28411,
    notes: 'High conversion day from Instagram Meta Campaign'
  },
  {
    id: 'pl-102',
    date: '2026-07-26',
    productId: 'prod-2',
    productName: 'First Rain (Mitti Attar) Concentrate',
    orders: 32,
    sellingPrice: 1299,
    productCost: 240,
    packagingCost: 40,
    shippingCost: 80,
    codCharge: 45,
    paymentGatewayCharge: 25,
    expectedRtoPercent: 20,
    otherCharges: 15,
    revenue: 41568,
    expectedDeliveredOrders: 25.6,
    expectedRtoOrders: 6.4,
    totalOrderCost: 445,
    expectedProfit: 30176,
    expectedMargin: 72.59,
    aov: 1299,
    expectedRoas: 4.1,
    isReconciled: true,
    actualDeliveredOrders: 26,
    actualRtoOrders: 5,
    cancelledOrders: 1,
    returnedOrders: 0,
    exchangeOrders: 0,
    refundOrders: 0,
    actualProfit: 30588,
    notes: 'Monsoon Mitti Attar Special Promotion'
  },
  {
    id: 'pl-103',
    date: '2026-07-25',
    productId: 'prod-4',
    productName: 'Obsidian Black Oud EDP Spray',
    orders: 28,
    sellingPrice: 2499,
    productCost: 450,
    packagingCost: 60,
    shippingCost: 110,
    codCharge: 50,
    paymentGatewayCharge: 50,
    expectedRtoPercent: 15,
    otherCharges: 20,
    revenue: 69972,
    expectedDeliveredOrders: 23.8,
    expectedRtoOrders: 4.2,
    totalOrderCost: 740,
    expectedProfit: 52360,
    expectedMargin: 74.83,
    aov: 2499,
    expectedRoas: 5.2,
    isReconciled: false,
    notes: 'Luxury EDP launched - strong AOV surge'
  },
  {
    id: 'pl-104',
    date: '2026-07-24',
    productId: 'prod-3',
    productName: 'Royal Rose & Katcha Bela Roll-On',
    orders: 60,
    sellingPrice: 699,
    productCost: 120,
    packagingCost: 25,
    shippingCost: 65,
    codCharge: 35,
    paymentGatewayCharge: 14,
    expectedRtoPercent: 22,
    otherCharges: 8,
    revenue: 41940,
    expectedDeliveredOrders: 46.8,
    expectedRtoOrders: 13.2,
    totalOrderCost: 267,
    expectedProfit: 29444.4,
    expectedMargin: 70.21,
    aov: 699,
    expectedRoas: 3.5,
    isReconciled: true,
    actualDeliveredOrders: 47,
    actualRtoOrders: 11,
    cancelledOrders: 2,
    returnedOrders: 0,
    exchangeOrders: 1,
    refundOrders: 0,
    actualProfit: 29981,
    notes: 'Volume order scale up'
  },
  {
    id: 'pl-105',
    date: '2026-07-23',
    productId: 'prod-5',
    productName: 'Grand Royal Attar Discovery Box (4x6ml)',
    orders: 18,
    sellingPrice: 2999,
    productCost: 520,
    packagingCost: 80,
    shippingCost: 120,
    codCharge: 60,
    paymentGatewayCharge: 60,
    expectedRtoPercent: 12,
    otherCharges: 25,
    revenue: 53982,
    expectedDeliveredOrders: 15.84,
    expectedRtoOrders: 2.16,
    totalOrderCost: 865,
    expectedProfit: 40280.4,
    expectedMargin: 74.62,
    aov: 2999,
    expectedRoas: 4.8,
    isReconciled: true,
    actualDeliveredOrders: 16,
    actualRtoOrders: 2,
    cancelledOrders: 0,
    returnedOrders: 0,
    exchangeOrders: 0,
    refundOrders: 0,
    actualProfit: 40700,
    notes: 'Gift box campaign for festive orders'
  }
];

export const INITIAL_EXPENSES: ExpenseEntry[] = [
  {
    id: 'exp-1',
    date: '2026-07-27',
    category: 'Meta Ads',
    subCategory: 'Instagram Perfume Retargeting',
    amount: 10500,
    paymentMethod: 'Credit Card',
    description: 'Meta Ads Manager daily budget allocation',
    paidBy: 'Mahekh Business HDFC CC',
    notes: 'ROAS 3.8 today'
  },
  {
    id: 'exp-2',
    date: '2026-07-27',
    category: 'Google Ads',
    subCategory: 'Search Ads - Best Attar Brand',
    amount: 3200,
    paymentMethod: 'Credit Card',
    description: 'Google Ads brand intent search campaign',
    paidBy: 'Mahekh Business CC',
    notes: 'High intent keywords'
  },
  {
    id: 'exp-3',
    date: '2026-07-26',
    category: 'Meta Ads',
    subCategory: 'Facebook Broad Prospecting',
    amount: 9800,
    paymentMethod: 'Credit Card',
    description: 'Mitti Attar rainy season campaign',
    paidBy: 'Mahekh Business CC'
  },
  {
    id: 'exp-4',
    date: '2026-07-25',
    category: 'Office Rent',
    subCategory: 'Monthly Studio & Dispatch Facility',
    amount: 35000,
    paymentMethod: 'Bank Transfer',
    description: 'Perfume Blending Studio & Packaging Office Rent for July',
    paidBy: 'Current Account'
  },
  {
    id: 'exp-5',
    date: '2026-07-24',
    category: 'Salary',
    subCategory: 'Packaging & Dispatch Staff',
    amount: 24000,
    paymentMethod: 'UPI',
    description: 'Mid-month staff advance payouts for 3 team members',
    paidBy: 'Ratnakar (Owner)'
  },
  {
    id: 'exp-6',
    date: '2026-07-23',
    category: 'Courier Extra',
    subCategory: 'Bluedart Priority Express',
    amount: 4500,
    paymentMethod: 'UPI',
    description: 'Urgent express shipments for corporate gift boxes',
    paidBy: 'GPay Business'
  },
  {
    id: 'exp-7',
    date: '2026-07-22',
    category: 'Software Subscription',
    subCategory: 'Shopify & WhatsApp Automation',
    amount: 6200,
    paymentMethod: 'Credit Card',
    description: 'Shopify Plus & Interakt WhatsApp RTO recovery tool',
    paidBy: 'Mahekh Business CC'
  }
];

export const INITIAL_RAW_PURCHASES: RawMaterialPurchase[] = [
  {
    id: 'rm-1',
    purchaseDate: '2026-07-25',
    supplierName: 'Kannauj Essential Distillates',
    purchasedBy: 'Ratnakar',
    invoiceNumber: 'KED-2026-981',
    attarName: 'Imperial White Oud',
    quantity: 1000,
    unit: 'ML',
    rate: 140,
    totalAmount: 140000,
    paymentMethod: 'Bank Transfer',
    notes: 'Grade-A pure organic white oud concentrate'
  },
  {
    id: 'rm-2',
    purchaseDate: '2026-07-20',
    supplierName: 'Mysore Sandalwood & Fragrances',
    purchasedBy: 'Ratnakar',
    invoiceNumber: 'MSF-4412',
    attarName: 'First Rain (Mitti)',
    quantity: 500,
    unit: 'ML',
    rate: 180,
    totalAmount: 90000,
    paymentMethod: 'Bank Transfer',
    notes: 'Clay & Petrichor natural hydro-distillate'
  },
  {
    id: 'rm-3',
    purchaseDate: '2026-07-18',
    supplierName: 'Al-Madina Oud Traders',
    purchasedBy: 'Ratnakar',
    invoiceNumber: 'AMO-0092',
    attarName: 'Obsidian Black Oud',
    quantity: 300,
    unit: 'ML',
    rate: 420,
    totalAmount: 126000,
    paymentMethod: 'Bank Transfer',
    notes: 'Aged Cambodian Oud Resin Concentrate'
  },
  {
    id: 'rm-4',
    purchaseDate: '2026-07-15',
    supplierName: 'Rose Valley Kannauj',
    purchasedBy: 'Mahek',
    invoiceNumber: 'RVK-884',
    attarName: 'Rose',
    quantity: 2000,
    unit: 'ML',
    rate: 45,
    totalAmount: 90000,
    paymentMethod: 'UPI',
    notes: 'Pure Ruh Gulab distillate'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Imperial White Oud Oil Concentrate',
    type: 'Raw Attar',
    currentStock: 850,
    unit: 'ML',
    minStockAlert: 200,
    averageCost: 140,
    totalStockValue: 119000,
    lastUpdated: '2026-07-25'
  },
  {
    id: 'inv-2',
    name: 'First Rain (Mitti) Concentrate',
    type: 'Raw Attar',
    currentStock: 420,
    unit: 'ML',
    minStockAlert: 150,
    averageCost: 180,
    totalStockValue: 75600,
    lastUpdated: '2026-07-20'
  },
  {
    id: 'inv-3',
    name: 'Obsidian Black Oud Resin Extract',
    type: 'Raw Attar',
    currentStock: 140,
    unit: 'ML',
    minStockAlert: 100,
    averageCost: 420,
    totalStockValue: 58800,
    lastUpdated: '2026-07-18'
  },
  {
    id: 'inv-4',
    name: '6ml Octagonal Gold Cap Glass Bottles',
    type: 'Bottles & Packaging',
    currentStock: 1450,
    unit: 'Units',
    minStockAlert: 500,
    averageCost: 18,
    totalStockValue: 26100,
    lastUpdated: '2026-07-22'
  },
  {
    id: 'inv-5',
    name: 'Custom Velvet Luxury Gift Boxes',
    type: 'Bottles & Packaging',
    currentStock: 180,
    unit: 'Units',
    minStockAlert: 100,
    averageCost: 65,
    totalStockValue: 11700,
    lastUpdated: '2026-07-21'
  }
];

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord-1001',
    orderNumber: '#MKH-8941',
    date: '2026-07-27',
    customerName: 'Aamir Siddiqui',
    phone: '+91 98201 44512',
    city: 'Mumbai',
    state: 'Maharashtra',
    items: [
      { productName: 'Imperial White Oud Pure Attar', quantity: 2, price: 899 }
    ],
    totalAmount: 1798,
    paymentType: 'Prepaid',
    status: 'Shipped',
    trackingNumber: 'BLUEDART-882194',
    expectedDeliveryDate: '2026-07-29'
  },
  {
    id: 'ord-1002',
    orderNumber: '#MKH-8942',
    date: '2026-07-27',
    customerName: 'Vikram Singh',
    phone: '+91 99104 22187',
    city: 'New Delhi',
    state: 'Delhi',
    items: [
      { productName: 'Obsidian Black Oud EDP Spray', quantity: 1, price: 2499 }
    ],
    totalAmount: 2499,
    paymentType: 'COD',
    status: 'Pending',
    trackingNumber: 'DELHIVERY-44912',
    expectedDeliveryDate: '2026-07-30'
  },
  {
    id: 'ord-1003',
    orderNumber: '#MKH-8939',
    date: '2026-07-26',
    customerName: 'Zubair Khan',
    phone: '+91 97410 88219',
    city: 'Hyderabad',
    state: 'Telangana',
    items: [
      { productName: 'First Rain (Mitti Attar)', quantity: 1, price: 1299 }
    ],
    totalAmount: 1299,
    paymentType: 'Prepaid',
    status: 'Delivered',
    trackingNumber: 'XPRESSBEES-11029',
    expectedDeliveryDate: '2026-07-28'
  },
  {
    id: 'ord-1004',
    orderNumber: '#MKH-8935',
    date: '2026-07-25',
    customerName: 'Rahul Verma',
    phone: '+91 98112 00192',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    items: [
      { productName: 'Grand Royal Attar Box', quantity: 1, price: 2999 }
    ],
    totalAmount: 2999,
    paymentType: 'COD',
    status: 'RTO',
    trackingNumber: 'ECOM-77812',
    expectedDeliveryDate: '2026-07-27'
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  businessName: 'Mahekh ERP',
  tagline: 'D2C Luxury Perfume & Attar Business Suite',
  gstNumber: '09AAACM9812K1Z5',
  defaultShippingCost: 75,
  defaultProductCost: 180,
  defaultRtoPercent: 18,
  defaultRtoShippingCharge: 120,
  currencySymbol: '₹',
  attarList: INITIAL_ATTAR_LIST,
  expenseCategories: [
    'Meta Ads',
    'Google Ads',
    'Salary',
    'Office Rent',
    'Petrol',
    'Recharge',
    'Internet',
    'Electricity',
    'Courier Extra',
    'Office Expense',
    'Food',
    'Travel',
    'Refund',
    'Bank Charges',
    'Software Subscription',
    'Miscellaneous'
  ],
  suppliers: [
    'Kannauj Essential Distillates',
    'Mysore Sandalwood & Fragrances',
    'Al-Madina Oud Traders',
    'Rose Valley Kannauj',
    'Luxury Packaging Pvt Ltd'
  ]
};

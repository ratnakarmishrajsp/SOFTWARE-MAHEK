export interface PLEntry {
  id: string;
  date: string; // YYYY-MM-DD
  productId: string;
  productName: string;
  orders: number;
  sellingPrice: number;

  // Sales Input Mode ('perUnit' or 'totalSales')
  salesMode?: 'perUnit' | 'totalSales';
  totalSalesAmount?: number; // Total Shopify Revenue (e.g. ₹10,000)

  // Cost Input Mode
  costMode?: 'combined' | 'detailed';
  combinedCost?: number; // Total Product + Shipping + Charges per order

  // Ad Spend & CPP Input Mode
  adSpendMode?: 'totalSpend' | 'cpp';
  totalAdSpend?: number; // Total Meta/Google ad spend today (e.g. ₹2,500)
  cpp?: number; // Cost Per Purchase / CPA (e.g. ₹250)

  // Detailed Cost Breakdown (Optional if costMode === 'combined')
  productCost: number;
  packagingCost: number;
  shippingCost: number;
  codCharge: number;
  paymentGatewayCharge: number;
  expectedRtoPercent: number;
  otherCharges: number;
  notes?: string;

  // Calculated fields (Computed or explicitly saved)
  revenue: number;
  expectedDeliveredOrders: number;
  expectedRtoOrders: number;
  totalOrderCost: number;
  expectedProfit: number;
  netProfitAfterAds?: number;
  expectedMargin: number; // percentage
  aov: number; // average order value
  expectedRoas: number;

  // Actual RTO & Delivery updates
  isReconciled?: boolean;
  actualDeliveredOrders?: number;
  actualRtoOrders?: number;
  cancelledOrders?: number;
  returnedOrders?: number;
  exchangeOrders?: number;
  refundOrders?: number;
  actualProfit?: number;
  reconciliationNotes?: string;
}

export type ExpenseCategory =
  | 'Meta Ads'
  | 'Google Ads'
  | 'Salary'
  | 'Staff Salary'
  | 'Packaging Supplies'
  | 'Warehouse Rent'
  | 'Office Rent'
  | 'Office & Utilities'
  | 'Software & Subscriptions'
  | 'Software Subscription'
  | 'Miscellaneous'
  | 'Petrol'
  | 'Recharge'
  | 'Internet'
  | 'Electricity'
  | 'Courier Extra'
  | 'Office Expense'
  | 'Food'
  | 'Travel'
  | 'Refund'
  | 'Bank Charges'
  | 'Other';

export interface ExpenseEntry {
  id: string;
  date: string;
  category: ExpenseCategory;
  subCategory: string;
  amount: number;
  paymentMethod: 'UPI' | 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Net Banking';
  description: string;
  billUrl?: string;
  paidBy: string;
  notes?: string;
}

export interface RawMaterialPurchase {
  id: string;
  purchaseDate: string;
  supplierName: string;
  purchasedBy: string;
  invoiceNumber: string;
  attarName: string;
  quantity: number; // in ML or KG or units
  unit: 'ML' | 'Liters' | 'Grams' | 'KG' | 'Units';
  rate: number;
  totalAmount: number;
  paymentMethod: string;
  billUrl?: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  bottleSize: '3ml' | '6ml' | '12ml' | '50ml' | '100ml' | 'Combo Set';
  category: 'Pure Attar' | 'Luxury Perfume' | 'Attar Concentrates' | 'Gift Box';
  costPrice: number;
  sellingPrice: number;
  weight: string; // e.g. "50g"
  images: string[];
  status: 'Active' | 'Draft' | 'Out of Stock';
  barcode: string;
  stock: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'Raw Attar' | 'Bottles & Packaging' | 'Finished Product';
  currentStock: number;
  unit: string;
  minStockAlert: number;
  averageCost: number;
  totalStockValue: number;
  lastUpdated: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  phone: string;
  city: string;
  state: string;
  items: { productName: string; quantity: number; price: number }[];
  totalAmount: number;
  paymentType: 'COD' | 'Prepaid';
  status: 'Delivered' | 'Pending' | 'Cancelled' | 'RTO' | 'Shipped';
  trackingNumber: string;
  expectedDeliveryDate: string;
}

export interface SystemSettings {
  businessName: string;
  tagline: string;
  gstNumber: string;
  defaultShippingCost: number;
  defaultProductCost: number;
  defaultRtoPercent: number;
  currencySymbol: string;
  attarList: string[];
  expenseCategories: string[];
  suppliers: string[];
}

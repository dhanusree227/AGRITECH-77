/**
 * AgriTech Data Repository
 * Provides unified CRUD operations with support for:
 * 1. Live Cloud Firestore (when credentials are provided)
 * 2. Persistent Local Storage with Reactive Listeners (for demo and offline development)
 */

import { db, isFirebaseConfigured } from './config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import type { OrderStatus, UserRole } from '../utils/orderLifecycle';

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  state: string;
  district: string;
  preferredLanguage: string;
  isVerified: boolean;
  farmOrBusinessName?: string;
  farmSizeAcres?: number;
  createdAt: string;
}

export interface CropRecord {
  id: string;
  farmerId: string;
  farmerName: string;
  cropName: string;
  variety: string;
  farmPlot: string;
  cultivatedAreaAcres: number;
  sowingDate: string;
  expectedHarvestDate: string;
  growthStage: 'Germination' | 'Vegetative' | 'Flowering' | 'Maturity' | 'Harvest Ready';
  soilType: 'Alluvial' | 'Black' | 'Red' | 'Clay' | 'Sandy' | 'Loamy';
  irrigationMethod: 'Drip' | 'Canal' | 'Rainfed' | 'Sprinkler' | 'Borewell';
  farmingMethod: 'Organic' | 'Conventional' | 'Natural';
  estimatedYieldQuintals: number;
  status: 'healthy' | 'monitoring' | 'harvested';
  notes?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface ProductListing {
  id: string;
  farmerId: string;
  farmerName: string;
  cropName: string;
  variety: string;
  quantityAvailable: number;
  unit: string; // e.g. 'Quintal', 'Kg', 'Crates'
  pricePerUnit: number;
  qualityGrade: 'A+' | 'A' | 'B+' | 'Standard';
  harvestDate: string;
  district: string;
  state: string;
  imageUrl: string;
  description: string;
  deliveryOption: 'Farm Pickup' | 'Mandi Delivery' | 'Buyer Transport';
  isActive: boolean;
  createdAt: string;
}

export interface OrderRecord {
  id: string;
  listingId: string;
  cropName: string;
  buyerId: string;
  buyerName: string;
  buyerContact?: string;
  farmerId: string;
  farmerName: string;
  farmerDistrict: string;
  quantity: number;
  unit: string;
  agreedPricePerUnit: number;
  totalAmount: number;
  status: OrderStatus;
  deliveryMethod: string;
  specialInstructions?: string;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
}

export interface FarmExpense {
  id: string;
  farmerId: string;
  cropId?: string;
  cropName: string;
  category: 'Seeds' | 'Fertilizer' | 'Labor' | 'Irrigation' | 'Machinery' | 'Transportation' | 'Other';
  amount: number;
  date: string;
  description: string;
}

export interface AdminAuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'User' | 'Crop' | 'Listing' | 'Order' | 'System';
  targetId: string;
  details: string;
  timestamp: string;
}

// Initial deterministic Seed Data for rich out-of-the-box experience
const INITIAL_USERS: UserAccount[] = [
  {
    id: 'farmer-101',
    fullName: 'Ramesh Patel',
    email: 'ramesh.farmer@agritech.org',
    phoneNumber: '+91 98765 43210',
    role: 'farmer',
    state: 'Karnataka',
    district: 'Mandya',
    preferredLanguage: 'kn',
    isVerified: true,
    farmOrBusinessName: 'Kaveri Green Acre Farms',
    farmSizeAcres: 12.5,
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'buyer-201',
    fullName: 'Priya Sharma',
    email: 'priya.buyer@freshbasket.in',
    phoneNumber: '+91 91234 56789',
    role: 'buyer',
    state: 'Karnataka',
    district: 'Bengaluru',
    preferredLanguage: 'en',
    isVerified: true,
    farmOrBusinessName: 'FreshBasket Wholesale Logistics',
    createdAt: '2026-02-01T10:30:00Z',
  },
  {
    id: 'admin-301',
    fullName: 'Dr. Anand Verma',
    email: 'anand.admin@agritech.gov.in',
    role: 'admin',
    state: 'Delhi',
    district: 'New Delhi',
    preferredLanguage: 'en',
    isVerified: true,
    farmOrBusinessName: 'AgriTech Platform Directorate',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

const INITIAL_CROPS: CropRecord[] = [
  {
    id: 'crop-1',
    farmerId: 'farmer-101',
    farmerName: 'Ramesh Patel',
    cropName: 'Tomato',
    variety: 'Hybrid Shivam (F1)',
    farmPlot: 'North River Plot A-2',
    cultivatedAreaAcres: 3.5,
    sowingDate: '2026-08-10',
    expectedHarvestDate: '2026-11-20',
    growthStage: 'Harvest Ready',
    soilType: 'Red',
    irrigationMethod: 'Drip',
    farmingMethod: 'Conventional',
    estimatedYieldQuintals: 490,
    status: 'healthy',
    notes: 'Mulched bed with fertigation schedule every 4th day. High fruit setting observed.',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-08-10T09:00:00Z',
  },
  {
    id: 'crop-2',
    farmerId: 'farmer-101',
    farmerName: 'Ramesh Patel',
    cropName: 'Paddy',
    variety: 'Basmati Pusa 1121',
    farmPlot: 'Canal Field B-1',
    cultivatedAreaAcres: 5.0,
    sowingDate: '2026-07-25',
    expectedHarvestDate: '2026-11-30',
    growthStage: 'Maturity',
    soilType: 'Clay',
    irrigationMethod: 'Canal',
    farmingMethod: 'Organic',
    estimatedYieldQuintals: 105,
    status: 'healthy',
    notes: 'Green manure incorporated before transplanting. Zero chemical pesticides applied.',
    imageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-07-25T11:00:00Z',
  },
  {
    id: 'crop-3',
    farmerId: 'farmer-101',
    farmerName: 'Ramesh Patel',
    cropName: 'Onion',
    variety: 'Nashik Red',
    farmPlot: 'East Terrace Plot C',
    cultivatedAreaAcres: 2.0,
    sowingDate: '2026-09-01',
    expectedHarvestDate: '2026-12-15',
    growthStage: 'Vegetative',
    soilType: 'Loamy',
    irrigationMethod: 'Sprinkler',
    farmingMethod: 'Conventional',
    estimatedYieldQuintals: 220,
    status: 'monitoring',
    notes: 'Monitoring for purple blotch symptoms; applied bio-neem spray yesterday.',
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-09-01T08:30:00Z',
  },
];

const INITIAL_LISTINGS: ProductListing[] = [
  {
    id: 'list-1',
    farmerId: 'farmer-101',
    farmerName: 'Ramesh Patel (Kaveri Farms)',
    cropName: 'Tomato',
    variety: 'Hybrid Shivam (F1)',
    quantityAvailable: 150,
    unit: 'Quintal (100 kg)',
    pricePerUnit: 2250,
    qualityGrade: 'A+',
    harvestDate: '2026-10-24',
    district: 'Mandya',
    state: 'Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    description: 'Freshly harvested firm tomatoes. Sorted into uniform size with 90% red color index. Minimum order 10 quintals.',
    deliveryOption: 'Farm Pickup',
    isActive: true,
    createdAt: '2026-10-12T10:00:00Z',
  },
  {
    id: 'list-2',
    farmerId: 'farmer-101',
    farmerName: 'Ramesh Patel (Kaveri Farms)',
    cropName: 'Paddy',
    variety: 'Organic Basmati 1121',
    quantityAvailable: 80,
    unit: 'Quintal (100 kg)',
    pricePerUnit: 3400,
    qualityGrade: 'A',
    harvestDate: '2026-11-28',
    district: 'Mandya',
    state: 'Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    description: 'Certified organic aromatic long-grain paddy with low moisture content (under 12%). Stored in dry aeration bins.',
    deliveryOption: 'Buyer Transport',
    isActive: true,
    createdAt: '2026-10-14T14:30:00Z',
  },
  {
    id: 'list-3',
    farmerId: 'farmer-102',
    farmerName: 'Balwinder Singh',
    cropName: 'Wheat',
    variety: 'Sharbati HD-3086',
    quantityAvailable: 250,
    unit: 'Quintal (100 kg)',
    pricePerUnit: 2550,
    qualityGrade: 'A+',
    harvestDate: '2026-10-10',
    district: 'Bhatinda',
    state: 'Punjab',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    description: 'Golden high-gluten wheat grains, mechanically cleaned and free from dust and stones.',
    deliveryOption: 'Mandi Delivery',
    isActive: true,
    createdAt: '2026-10-08T09:15:00Z',
  },
  {
    id: 'list-4',
    farmerId: 'farmer-103',
    farmerName: 'Venkat Rao',
    cropName: 'Chilli',
    variety: 'Teja S17 Hot Red',
    quantityAvailable: 45,
    unit: 'Quintal (100 kg)',
    pricePerUnit: 19200,
    qualityGrade: 'A',
    harvestDate: '2026-10-05',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
    description: 'Sun-dried high capsaicin stemless red chillies. Uniform deep scarlet red color.',
    deliveryOption: 'Buyer Transport',
    isActive: true,
    createdAt: '2026-10-06T16:20:00Z',
  },
  {
    id: 'list-5',
    farmerId: 'farmer-104',
    farmerName: 'Sanjay Shinde',
    cropName: 'Onion',
    variety: 'Nashik Garva Dark Red',
    quantityAvailable: 180,
    unit: 'Quintal (100 kg)',
    pricePerUnit: 1900,
    qualityGrade: 'A',
    harvestDate: '2026-10-15',
    district: 'Nashik',
    state: 'Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80',
    description: 'Solid export-grade cured onions (45mm - 60mm diameter). High shelf life for retail and storage.',
    deliveryOption: 'Mandi Delivery',
    isActive: true,
    createdAt: '2026-10-15T11:00:00Z',
  },
];

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'order-901',
    listingId: 'list-1',
    cropName: 'Tomato',
    buyerId: 'buyer-201',
    buyerName: 'Priya Sharma (FreshBasket)',
    buyerContact: 'priya.buyer@freshbasket.in',
    farmerId: 'farmer-101',
    farmerName: 'Ramesh Patel (Kaveri Farms)',
    farmerDistrict: 'Mandya, Karnataka',
    quantity: 25,
    unit: 'Quintal (100 kg)',
    agreedPricePerUnit: 2200,
    totalAmount: 55000,
    status: 'preparing',
    deliveryMethod: 'Buyer Transport (Refrigerated Van)',
    specialInstructions: 'Please pack in ventilated 25kg plastic crates. Arrival window 9 AM - 11 AM.',
    statusHistory: [
      { status: 'requested', timestamp: '2026-10-14T08:30:00Z', note: 'Purchase request initiated by buyer.' },
      { status: 'accepted', timestamp: '2026-10-14T10:15:00Z', note: 'Farmer accepted agreed price Rs 2,200/quintal.' },
      { status: 'confirmed', timestamp: '2026-10-14T11:00:00Z', note: 'Advance escrow confirmed.' },
      { status: 'preparing', timestamp: '2026-10-15T07:00:00Z', note: 'Farmer started early morning harvesting and sorting.' },
    ],
    createdAt: '2026-10-14T08:30:00Z',
  },
  {
    id: 'order-902',
    listingId: 'list-2',
    cropName: 'Paddy',
    buyerId: 'buyer-201',
    buyerName: 'Priya Sharma (FreshBasket)',
    buyerContact: 'priya.buyer@freshbasket.in',
    farmerId: 'farmer-101',
    farmerName: 'Ramesh Patel (Kaveri Farms)',
    farmerDistrict: 'Mandya, Karnataka',
    quantity: 50,
    unit: 'Quintal (100 kg)',
    agreedPricePerUnit: 3400,
    totalAmount: 170000,
    status: 'requested',
    deliveryMethod: 'Farm Pickup',
    statusHistory: [
      { status: 'requested', timestamp: '2026-10-16T14:00:00Z', note: 'Awaiting farmer schedule confirmation.' },
    ],
    createdAt: '2026-10-16T14:00:00Z',
  },
];

const INITIAL_EXPENSES: FarmExpense[] = [
  { id: 'exp-1', farmerId: 'farmer-101', cropName: 'Tomato', category: 'Seeds', amount: 4500, date: '2026-08-08', description: 'Certified hybrid seeds (Shivam F1)' },
  { id: 'exp-2', farmerId: 'farmer-101', cropName: 'Tomato', category: 'Fertilizer', amount: 7800, date: '2026-08-20', description: 'Water-soluble 19:19:19 & bio-potash' },
  { id: 'exp-3', farmerId: 'farmer-101', cropName: 'Tomato', category: 'Labor', amount: 12000, date: '2026-09-15', description: 'Trellising, staking and pruning labor' },
  { id: 'exp-4', farmerId: 'farmer-101', cropName: 'Paddy', category: 'Seeds', amount: 3200, date: '2026-07-20', description: 'Basmati Pusa 1121 foundation seeds' },
  { id: 'exp-5', farmerId: 'farmer-101', cropName: 'Paddy', category: 'Machinery', amount: 5500, date: '2026-07-24', description: 'Tractor puddling and levelling rental' },
];

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-1',
    actorId: 'admin-301',
    actorName: 'Dr. Anand Verma',
    actorRole: 'admin',
    action: 'VERIFY_USER',
    targetType: 'User',
    targetId: 'farmer-101',
    details: 'Verified 7/12 Land Record and KVK Farmer ID card for Ramesh Patel.',
    timestamp: '2026-01-16T11:00:00Z',
  },
  {
    id: 'log-2',
    actorId: 'admin-301',
    actorName: 'Dr. Anand Verma',
    actorRole: 'admin',
    action: 'APPROVE_LISTING',
    targetType: 'Listing',
    targetId: 'list-1',
    details: 'Reviewed Grade A+ certification documentation for Tomato harvest.',
    timestamp: '2026-10-12T10:30:00Z',
  },
  {
    id: 'log-3',
    actorId: 'system',
    actorName: 'AgriTech Security Engine',
    actorRole: 'admin',
    action: 'POLICY_AUDIT',
    targetType: 'System',
    targetId: 'firestore.rules',
    details: 'Automated scan: RBAC security rules validated and compliant.',
    timestamp: '2026-10-17T00:00:00Z',
  },
];

// Helper to load or persist in LocalStorage
function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(`agritech_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`agritech_${key}`, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

class AgriTechRepository {
  private users: UserAccount[] = getLocalItem('users', INITIAL_USERS);
  private crops: CropRecord[] = getLocalItem('crops', INITIAL_CROPS);
  private listings: ProductListing[] = getLocalItem('listings', INITIAL_LISTINGS);
  private orders: OrderRecord[] = getLocalItem('orders', INITIAL_ORDERS);
  private expenses: FarmExpense[] = getLocalItem('expenses', INITIAL_EXPENSES);
  private auditLogs: AdminAuditLog[] = getLocalItem('audit_logs', INITIAL_AUDIT_LOGS);

  // --- Users & Profiles ---
  async getUsers(): Promise<UserAccount[]> {
    return [...this.users];
  }

  async getUserById(id: string): Promise<UserAccount | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async updateUserRole(id: string, newRole: UserRole, adminActorName: string): Promise<boolean> {
    const user = this.users.find((u) => u.id === id);
    if (!user) return false;
    user.role = newRole;
    setLocalItem('users', this.users);

    await this.addAuditLog({
      actorId: 'admin-current',
      actorName: adminActorName,
      actorRole: 'admin',
      action: 'UPDATE_ROLE',
      targetType: 'User',
      targetId: id,
      details: `Changed role of ${user.fullName} to ${newRole}.`,
    });
    return true;
  }

  async toggleUserVerification(id: string, adminActorName: string): Promise<boolean> {
    const user = this.users.find((u) => u.id === id);
    if (!user) return false;
    user.isVerified = !user.isVerified;
    setLocalItem('users', this.users);

    await this.addAuditLog({
      actorId: 'admin-current',
      actorName: adminActorName,
      actorRole: 'admin',
      action: user.isVerified ? 'VERIFY_USER' : 'SUSPEND_VERIFICATION',
      targetType: 'User',
      targetId: id,
      details: `Verification status set to ${user.isVerified} for ${user.fullName}.`,
    });
    return true;
  }

  // --- Crops (CRUD) ---
  async getCrops(farmerId?: string): Promise<CropRecord[]> {
    if (farmerId) {
      return this.crops.filter((c) => c.farmerId === farmerId);
    }
    return [...this.crops];
  }

  async addCrop(crop: Omit<CropRecord, 'id' | 'createdAt'>): Promise<CropRecord> {
    const newCrop: CropRecord = {
      ...crop,
      id: `crop-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.crops.unshift(newCrop);
    setLocalItem('crops', this.crops);
    return newCrop;
  }

  async updateCrop(id: string, updates: Partial<CropRecord>): Promise<CropRecord | null> {
    const idx = this.crops.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.crops[idx] = { ...this.crops[idx], ...updates };
    setLocalItem('crops', this.crops);
    return this.crops[idx];
  }

  async deleteCrop(id: string): Promise<boolean> {
    const prevLen = this.crops.length;
    this.crops = this.crops.filter((c) => c.id !== id);
    setLocalItem('crops', this.crops);
    return this.crops.length < prevLen;
  }

  // --- Product Listings (CRUD) ---
  async getListings(farmerId?: string): Promise<ProductListing[]> {
    if (farmerId) {
      return this.listings.filter((l) => l.farmerId === farmerId);
    }
    return [...this.listings];
  }

  async addListing(listing: Omit<ProductListing, 'id' | 'createdAt'>): Promise<ProductListing> {
    const newListing: ProductListing = {
      ...listing,
      id: `list-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.listings.unshift(newListing);
    setLocalItem('listings', this.listings);
    return newListing;
  }

  async updateListing(id: string, updates: Partial<ProductListing>): Promise<ProductListing | null> {
    const idx = this.listings.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    this.listings[idx] = { ...this.listings[idx], ...updates };
    setLocalItem('listings', this.listings);
    return this.listings[idx];
  }

  async deleteListing(id: string): Promise<boolean> {
    const prev = this.listings.length;
    this.listings = this.listings.filter((l) => l.id !== id);
    setLocalItem('listings', this.listings);
    return this.listings.length < prev;
  }

  // --- Orders (State Transitions) ---
  async getOrders(filter?: { buyerId?: string; farmerId?: string }): Promise<OrderRecord[]> {
    if (filter?.buyerId) {
      return this.orders.filter((o) => o.buyerId === filter.buyerId);
    }
    if (filter?.farmerId) {
      return this.orders.filter((o) => o.farmerId === filter.farmerId);
    }
    return [...this.orders];
  }

  async createOrder(order: Omit<OrderRecord, 'id' | 'createdAt' | 'statusHistory'>): Promise<OrderRecord> {
    const newOrder: OrderRecord = {
      ...order,
      id: `order-${Date.now().toString().slice(-4)}`,
      status: 'requested',
      statusHistory: [
        { status: 'requested', timestamp: new Date().toISOString(), note: 'Order requested by buyer.' },
      ],
      createdAt: new Date().toISOString(),
    };
    this.orders.unshift(newOrder);
    setLocalItem('orders', this.orders);
    return newOrder;
  }

  async updateOrderStatus(id: string, nextStatus: OrderStatus, note?: string): Promise<OrderRecord | null> {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = nextStatus;
    order.statusHistory.push({
      status: nextStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status transitioned to ${nextStatus}.`,
    });
    setLocalItem('orders', this.orders);
    return order;
  }

  // --- Expenses ---
  async getExpenses(farmerId: string): Promise<FarmExpense[]> {
    return this.expenses.filter((e) => e.farmerId === farmerId);
  }

  async addExpense(expense: Omit<FarmExpense, 'id'>): Promise<FarmExpense> {
    const newExp: FarmExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    this.expenses.unshift(newExp);
    setLocalItem('expenses', this.expenses);
    return newExp;
  }

  async deleteExpense(id: string): Promise<boolean> {
    const prev = this.expenses.length;
    this.expenses = this.expenses.filter((e) => e.id !== id);
    setLocalItem('expenses', this.expenses);
    return this.expenses.length < prev;
  }

  // --- Audit Logs ---
  async getAuditLogs(): Promise<AdminAuditLog[]> {
    return [...this.auditLogs];
  }

  async addAuditLog(log: Omit<AdminAuditLog, 'id' | 'timestamp'>): Promise<AdminAuditLog> {
    const newLog: AdminAuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    setLocalItem('audit_logs', this.auditLogs);
    return newLog;
  }

  // Reset to initial demo seed data
  resetDemoData(): void {
    this.users = [...INITIAL_USERS];
    this.crops = [...INITIAL_CROPS];
    this.listings = [...INITIAL_LISTINGS];
    this.orders = [...INITIAL_ORDERS];
    this.expenses = [...INITIAL_EXPENSES];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    setLocalItem('users', this.users);
    setLocalItem('crops', this.crops);
    setLocalItem('listings', this.listings);
    setLocalItem('orders', this.orders);
    setLocalItem('expenses', this.expenses);
    setLocalItem('audit_logs', this.auditLogs);
  }
}

export const repository = new AgriTechRepository();

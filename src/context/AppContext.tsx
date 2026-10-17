import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SupportedLanguage } from '../i18n/translations';
import { getTranslation } from '../i18n/translations';
import { repository, type UserAccount, type CropRecord, type ProductListing, type OrderRecord, type FarmExpense, type AdminAuditLog } from '../firebase/repository';
import type { UserRole, OrderStatus } from '../utils/orderLifecycle';
import { isFirebaseConfigured } from '../firebase/config';

export interface WeatherData {
  district: string;
  state: string;
  source: string;
  timestamp: string;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    precipitationMm: number;
    windSpeedKmh: number;
    weatherCode: number;
  };
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    rainProbability: number;
    rainMm: number;
  }>;
  agriculturalAlerts: string[];
}

export interface MandiPriceItem {
  id: string;
  mandiName: string;
  district: string;
  state: string;
  cropName: string;
  variety: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
  changePercent: number;
  arrivalsQuintals: number;
  updatedAt: string;
  source: string;
}

interface AppContextType {
  currentUser: UserAccount;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  switchRole: (role: UserRole) => void;
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  crops: CropRecord[];
  listings: ProductListing[];
  orders: OrderRecord[];
  expenses: FarmExpense[];
  auditLogs: AdminAuditLog[];
  weather: WeatherData | null;
  mandiPrices: MandiPriceItem[];
  isLoadingWeather: boolean;
  refreshData: () => Promise<void>;
  // CRUD actions
  addCrop: (crop: Omit<CropRecord, 'id' | 'createdAt'>) => Promise<CropRecord>;
  updateCrop: (id: string, updates: Partial<CropRecord>) => Promise<void>;
  deleteCrop: (id: string) => Promise<void>;
  addListing: (listing: Omit<ProductListing, 'id' | 'createdAt'>) => Promise<ProductListing>;
  updateListing: (id: string, updates: Partial<ProductListing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  createOrder: (order: Omit<OrderRecord, 'id' | 'createdAt' | 'statusHistory'>) => Promise<OrderRecord>;
  updateOrderStatus: (id: string, nextStatus: OrderStatus, note?: string) => Promise<void>;
  addExpense: (expense: Omit<FarmExpense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  toggleUserVerification: (userId: string) => Promise<void>;
  // UI Dialog States
  isVoiceAssistantOpen: boolean;
  setIsVoiceAssistantOpen: (open: boolean) => void;
  isCloudModalOpen: boolean;
  setIsCloudModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isFirebaseLive: boolean;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('agritech_lang') as SupportedLanguage) || 'en';
  });

  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<UserAccount>({
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
  });

  const [crops, setCrops] = useState<CropRecord[]>([]);
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [expenses, setExpenses] = useState<FarmExpense[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mandiPrices, setMandiPrices] = useState<MandiPriceItem[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('agritech_lang', lang);
  };

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  const refreshData = async () => {
    const [allCrops, allListings, allOrders, allExpenses, allLogs] = await Promise.all([
      repository.getCrops(),
      repository.getListings(),
      repository.getOrders(),
      repository.getExpenses(currentUser.id),
      repository.getAuditLogs(),
    ]);

    setCrops(allCrops);
    setListings(allListings);
    setOrders(allOrders);
    setExpenses(allExpenses);
    setAuditLogs(allLogs);
  };

  const fetchWeather = async (district: string) => {
    setIsLoadingWeather(true);
    try {
      const resp = await fetch(`/api/weather?district=${encodeURIComponent(district)}`);
      if (resp.ok) {
        const data = await resp.json();
        setWeather(data);
      }
    } catch (err) {
      console.warn('Weather fetch warning:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const fetchMandiPrices = async () => {
    try {
      const resp = await fetch('/api/mandi-prices');
      if (resp.ok) {
        const data = await resp.json();
        setMandiPrices(data.prices || []);
      }
    } catch (err) {
      console.warn('Mandi fetch warning:', err);
    }
  };

  useEffect(() => {
    refreshData();
    fetchWeather(currentUser.district || 'Mandya');
    fetchMandiPrices();
  }, [currentUser]);

  const switchRole = async (newRole: UserRole) => {
    const users = await repository.getUsers();
    const matched = users.find((u) => u.role === newRole);
    if (matched) {
      setCurrentUser(matched);
      if (currentRoute !== 'landing') {
        setCurrentRoute(newRole);
      }
    }
  };

  const addCrop = async (crop: Omit<CropRecord, 'id' | 'createdAt'>) => {
    const created = await repository.addCrop(crop);
    await refreshData();
    return created;
  };

  const updateCrop = async (id: string, updates: Partial<CropRecord>) => {
    await repository.updateCrop(id, updates);
    await refreshData();
  };

  const deleteCrop = async (id: string) => {
    await repository.deleteCrop(id);
    await refreshData();
  };

  const addListing = async (listing: Omit<ProductListing, 'id' | 'createdAt'>) => {
    const created = await repository.addListing(listing);
    await refreshData();
    return created;
  };

  const updateListing = async (id: string, updates: Partial<ProductListing>) => {
    await repository.updateListing(id, updates);
    await refreshData();
  };

  const deleteListing = async (id: string) => {
    await repository.deleteListing(id);
    await refreshData();
  };

  const createOrder = async (order: Omit<OrderRecord, 'id' | 'createdAt' | 'statusHistory'>) => {
    const created = await repository.createOrder(order);
    await refreshData();
    return created;
  };

  const updateOrderStatus = async (id: string, nextStatus: OrderStatus, note?: string) => {
    await repository.updateOrderStatus(id, nextStatus, note);
    await refreshData();
  };

  const addExpense = async (expense: Omit<FarmExpense, 'id'>) => {
    await repository.addExpense(expense);
    await refreshData();
  };

  const deleteExpense = async (id: string) => {
    await repository.deleteExpense(id);
    await refreshData();
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    await repository.updateUserRole(userId, newRole, currentUser.fullName);
    await refreshData();
  };

  const toggleUserVerification = async (userId: string) => {
    await repository.toggleUserVerification(userId, currentUser.fullName);
    await refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        language,
        setLanguage,
        t,
        switchRole,
        currentRoute,
        setCurrentRoute,
        crops,
        listings,
        orders,
        expenses,
        auditLogs,
        weather,
        mandiPrices,
        isLoadingWeather,
        refreshData,
        addCrop,
        updateCrop,
        deleteCrop,
        addListing,
        updateListing,
        deleteListing,
        createOrder,
        updateOrderStatus,
        addExpense,
        deleteExpense,
        updateUserRole,
        toggleUserVerification,
        isVoiceAssistantOpen,
        setIsVoiceAssistantOpen,
        isCloudModalOpen,
        setIsCloudModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isFirebaseLive: isFirebaseConfigured,
        selectedProductId,
        setSelectedProductId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

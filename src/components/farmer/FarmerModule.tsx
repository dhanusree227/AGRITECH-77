import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sprout,
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  CloudSun,
  Calendar,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  Check,
  X,
  Calculator,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import type { CropRecord, ProductListing, FarmExpense } from '../../firebase/repository';
import type { OrderStatus } from '../../utils/orderLifecycle';

export const FarmerModule: React.FC = () => {
  const {
    currentUser,
    crops,
    addCrop,
    updateCrop,
    deleteCrop,
    listings,
    addListing,
    updateListing,
    deleteListing,
    orders,
    updateOrderStatus,
    expenses,
    addExpense,
    deleteExpense,
    weather,
    mandiPrices,
    setIsVoiceAssistantOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'crops' | 'predictions' | 'listings' | 'orders' | 'finance' | 'calendar'
  >('dashboard');

  // Modal states for CRUD
  const [isAddCropOpen, setIsAddCropOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropRecord | null>(null);

  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<ProductListing | null>(null);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Crop Form State
  const [cropForm, setCropForm] = useState<{
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
    notes: string;
  }>({
    cropName: 'Tomato',
    variety: 'Hybrid Shivam F1',
    farmPlot: 'East Plot 1',
    cultivatedAreaAcres: 3,
    sowingDate: '2026-08-15',
    expectedHarvestDate: '2026-11-25',
    growthStage: 'Vegetative',
    soilType: 'Loamy',
    irrigationMethod: 'Drip',
    farmingMethod: 'Conventional',
    notes: '',
  });

  // Listing Form State
  const [listingForm, setListingForm] = useState<{
    cropName: string;
    variety: string;
    quantityAvailable: number;
    unit: string;
    pricePerUnit: number;
    qualityGrade: 'A+' | 'A' | 'B+' | 'Standard';
    harvestDate: string;
    deliveryOption: 'Farm Pickup' | 'Mandi Delivery' | 'Buyer Transport';
    description: string;
    imageUrl: string;
  }>({
    cropName: 'Tomato',
    variety: 'Hybrid Shivam F1',
    quantityAvailable: 100,
    unit: 'Quintal (100 kg)',
    pricePerUnit: 2200,
    qualityGrade: 'A+',
    harvestDate: '2026-11-20',
    deliveryOption: 'Farm Pickup',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
  });

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    cropName: 'Tomato',
    category: 'Fertilizer' as const,
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    description: 'Drip soluble micronutrients',
  });

  // Prediction Workspace State
  const [predCrop, setPredCrop] = useState('Wheat');
  const [predArea, setPredArea] = useState(5);
  const [predSeason, setPredSeason] = useState<'Kharif' | 'Rabi' | 'Zaid'>('Rabi');
  const [predSoil, setPredSoil] = useState<'Alluvial' | 'Loamy' | 'Black' | 'Red' | 'Clay' | 'Sandy'>('Alluvial');
  const [predIrr, setPredIrr] = useState<'Drip' | 'Canal' | 'Rainfed' | 'Sprinkler' | 'Borewell'>('Drip');
  const [predMethod, setPredMethod] = useState<'Conventional' | 'Organic' | 'Natural'>('Conventional');
  const [predResult, setPredResult] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Search & Filter
  const [cropSearch, setCropSearch] = useState('');
  const [growthFilter, setGrowthFilter] = useState('All');

  // Filter crops for current farmer
  const farmerCrops = crops.filter((c) => c.farmerId === currentUser.id);
  const farmerListings = listings.filter((l) => l.farmerId === currentUser.id);
  const farmerOrders = orders.filter((o) => o.farmerId === currentUser.id);
  const farmerExpenses = expenses.filter((e) => e.farmerId === currentUser.id);

  // Calculated Metrics
  const totalArea = farmerCrops.reduce((acc, c) => acc + (Number(c.cultivatedAreaAcres) || 0), 0);
  const totalEstimatedYield = farmerCrops.reduce((acc, c) => acc + (Number(c.estimatedYieldQuintals) || 0), 0);
  const totalExpenses = farmerExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const pendingOrdersCount = farmerOrders.filter((o) => ['requested', 'accepted', 'preparing'].includes(o.status)).length;
  const totalOrderRevenue = farmerOrders
    .filter((o) => ['confirmed', 'preparing', 'ready_for_dispatch', 'in_transit', 'delivered', 'completed'].includes(o.status))
    .reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

  // Chart data
  const cropYieldChartData = farmerCrops.map((c) => ({
    name: c.cropName,
    yield: c.estimatedYieldQuintals,
    area: c.cultivatedAreaAcres,
  }));

  const expenseCategoryData = [
    { name: 'Seeds', value: farmerExpenses.filter((e) => e.category === 'Seeds').reduce((s, e) => s + e.amount, 0) },
    { name: 'Fertilizer', value: farmerExpenses.filter((e) => e.category === 'Fertilizer').reduce((s, e) => s + e.amount, 0) },
    { name: 'Labor', value: farmerExpenses.filter((e) => e.category === 'Labor').reduce((s, e) => s + e.amount, 0) },
    { name: 'Machinery', value: farmerExpenses.filter((e) => e.category === 'Machinery').reduce((s, e) => s + e.amount, 0) },
    { name: 'Other', value: farmerExpenses.filter((e) => !['Seeds', 'Fertilizer', 'Labor', 'Machinery'].includes(e.category)).reduce((s, e) => s + e.amount, 0) },
  ].filter((d) => d.value > 0);

  const PIE_COLORS = ['#10B981', '#00B8F0', '#F5A623', '#8B5CF6', '#EC4899'];

  // Handle Predict Call
  const handleRunPrediction = async () => {
    setIsPredicting(true);
    try {
      const resp = await fetch('/api/predictions/yield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: predCrop,
          cultivatedAreaAcres: predArea,
          season: predSeason,
          soilType: predSoil,
          irrigationType: predIrr,
          farmingMethod: predMethod,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        setPredResult(data);
      }
    } catch (err) {
      console.error('Yield prediction error:', err);
    } finally {
      setIsPredicting(false);
    }
  };

  // Crop Handlers
  const handleSaveCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCrop) {
      await updateCrop(editingCrop.id, {
        ...cropForm,
        cultivatedAreaAcres: Number(cropForm.cultivatedAreaAcres),
      });
      setEditingCrop(null);
    } else {
      await addCrop({
        farmerId: currentUser.id,
        farmerName: currentUser.fullName,
        ...cropForm,
        cultivatedAreaAcres: Number(cropForm.cultivatedAreaAcres),
        estimatedYieldQuintals: Math.round(Number(cropForm.cultivatedAreaAcres) * 35),
        status: 'healthy',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      });
    }
    setIsAddCropOpen(false);
  };

  const handleEditCrop = (crop: CropRecord) => {
    setEditingCrop(crop);
    setCropForm({
      cropName: crop.cropName,
      variety: crop.variety,
      farmPlot: crop.farmPlot,
      cultivatedAreaAcres: crop.cultivatedAreaAcres,
      sowingDate: crop.sowingDate,
      expectedHarvestDate: crop.expectedHarvestDate,
      growthStage: crop.growthStage,
      soilType: crop.soilType,
      irrigationMethod: crop.irrigationMethod,
      farmingMethod: crop.farmingMethod,
      notes: crop.notes || '',
    });
    setIsAddCropOpen(true);
  };

  // Listing Handlers
  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingListing) {
      await updateListing(editingListing.id, {
        ...listingForm,
        quantityAvailable: Number(listingForm.quantityAvailable),
        pricePerUnit: Number(listingForm.pricePerUnit),
      });
      setEditingListing(null);
    } else {
      await addListing({
        farmerId: currentUser.id,
        farmerName: `${currentUser.fullName} (${currentUser.farmOrBusinessName || 'Farm'})`,
        ...listingForm,
        quantityAvailable: Number(listingForm.quantityAvailable),
        pricePerUnit: Number(listingForm.pricePerUnit),
        district: currentUser.district,
        state: currentUser.state,
        isActive: true,
      });
    }
    setIsAddListingOpen(false);
  };

  // Expense Handlers
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await addExpense({
      farmerId: currentUser.id,
      ...expenseForm,
      amount: Number(expenseForm.amount),
    });
    setIsAddExpenseOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Farmer Identity */}
      <div className="bg-gradient-to-r from-[#123D2A] to-[#1a553b] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#C6FF4A] flex items-center justify-center text-[#123D2A] shadow-lg shrink-0">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{currentUser.fullName}</h1>
              <span className="text-xs bg-[#10B981] text-[#123D2A] font-bold px-2 py-0.5 rounded-full">
                Verified Farmer
              </span>
            </div>
            <div className="text-xs text-emerald-200 mt-1 flex flex-wrap items-center gap-2">
              <span>{currentUser.farmOrBusinessName || 'Green Acre Farm'}</span>
              <span aria-hidden="true">·</span>
              <span>{currentUser.district}, {currentUser.state}</span>
              <span aria-hidden="true">·</span>
              <span>{totalArea} Total Acres Cultivated</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="px-4 py-2 bg-[#10B981] hover:bg-[#C6FF4A] text-[#123D2A] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> AI Crop Advisor
          </button>
          <button
            onClick={() => {
              setEditingCrop(null);
              setIsAddCropOpen(true);
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Crop
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Sub-routes) */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-white px-4 py-2 rounded-xl shadow-2xs">
        {[
          { id: 'dashboard', label: 'Dashboard Overview', icon: Layers },
          { id: 'crops', label: `My Crops (${farmerCrops.length})`, icon: Sprout },
          { id: 'predictions', label: 'Yield & Profit Predictor', icon: TrendingUp },
          { id: 'listings', label: `Marketplace Listings (${farmerListings.length})`, icon: Package },
          { id: 'orders', label: `Purchase Orders (${farmerOrders.length})`, icon: CheckCircle2 },
          { id: 'finance', label: 'Expenses & Break-even', icon: DollarSign },
          { id: 'calendar', label: 'Agri Calendar & Weather', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#123D2A] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Weather Alert Banner */}
          {weather?.agriculturalAlerts && weather.agriculturalAlerts.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Agro-Meteorological Advisory ({weather.district})
                </div>
                <div className="text-sm font-medium mt-0.5">
                  {weather.agriculturalAlerts[0]}
                </div>
                <div className="text-xs text-amber-700/80 mt-1">
                  Temperature: {weather.current.temperature}°C · Precipitation: {weather.current.precipitationMm} mm · Humidity: {weather.current.humidity}%
                </div>
              </div>
            </div>
          )}

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Cultivated Area</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalArea} Acres</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">
                {farmerCrops.length} Active Crop Plots
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Estimated Total Yield</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {totalEstimatedYield.toLocaleString()} <span className="text-xs font-semibold text-slate-500">Quintals</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Calculated via ICAR model</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Recorded Expenses</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                ₹{totalExpenses.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{farmerExpenses.length} Expense entries</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">Confirmed Order Revenue</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                ₹{totalOrderRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">
                {pendingOrdersCount} pending requests
              </div>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Yield by Crop Bar Chart */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Crop Yield Projection (Quintals)</h3>
                  <p className="text-xs text-slate-500">Multi-factor yield estimation across active farm plots</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cropYieldChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#123D2A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="yield" fill="#10B981" radius={[6, 6, 0, 0]} name="Yield (Quintals)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Breakdown Pie Chart */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="font-bold text-sm text-slate-900 mb-1">Expense Breakdown</h3>
              <p className="text-xs text-slate-500 mb-3">Input costs distribution for current season</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label={({ name, percent }) => `${name} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`}
                    >
                      {expenseCategoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Mandi Intelligence Snapshot */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Regional APMC Mandi Spot Prices</h3>
                <p className="text-xs text-slate-500">Live prices from verified Agmarknet and State Mandis</p>
              </div>
              <button
                onClick={() => setActiveTab('predictions')}
                className="text-xs font-semibold text-[#10B981] hover:underline"
              >
                Run Yield & Price Predictor →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {mandiPrices.slice(0, 4).map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{m.cropName}</span>
                    <span className={`text-[10px] font-bold ${m.changePercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {m.changePercent >= 0 ? `+${m.changePercent}%` : `${m.changePercent}%`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{m.mandiName}</div>
                  <div className="text-base font-extrabold text-emerald-800 mt-1">
                    ₹{m.modalPrice.toLocaleString()}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">/ quintal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY CROPS (FULL CRUD) */}
      {activeTab === 'crops' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={cropSearch}
                  onChange={(e) => setCropSearch(e.target.value)}
                  placeholder="Search crop or variety..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-hidden"
                />
              </div>
              <select
                value={growthFilter}
                onChange={(e) => setGrowthFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-hidden"
              >
                <option value="All">All Stages</option>
                <option value="Germination">Germination</option>
                <option value="Vegetative">Vegetative</option>
                <option value="Flowering">Flowering</option>
                <option value="Maturity">Maturity</option>
                <option value="Harvest Ready">Harvest Ready</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingCrop(null);
                setIsAddCropOpen(true);
              }}
              className="px-3.5 py-2 bg-[#123D2A] text-white rounded-lg text-xs font-bold hover:bg-[#1a553b] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Crop Record
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmerCrops
              .filter(
                (c) =>
                  c.cropName.toLowerCase().includes(cropSearch.toLowerCase()) ||
                  c.variety.toLowerCase().includes(cropSearch.toLowerCase())
              )
              .filter((c) => growthFilter === 'All' || c.growthStage === growthFilter)
              .map((crop) => (
                <div
                  key={crop.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                >
                  {crop.imageUrl && (
                    <img
                      src={crop.imageUrl}
                      alt={crop.cropName}
                      className="w-full h-36 object-cover"
                    />
                  )}
                  <div className="p-4 flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-base text-slate-900">{crop.cropName}</h4>
                        <p className="text-xs text-slate-500">{crop.variety} · {crop.farmPlot}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {crop.growthStage}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Area</span>
                        <span className="font-semibold">{crop.cultivatedAreaAcres} Acres</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Est. Yield</span>
                        <span className="font-semibold text-emerald-700">{crop.estimatedYieldQuintals} q</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Irrigation</span>
                        <span className="font-semibold">{crop.irrigationMethod}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Harvest Due</span>
                        <span className="font-semibold">{crop.expectedHarvestDate}</span>
                      </div>
                    </div>

                    {crop.notes && (
                      <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                        "{crop.notes}"
                      </p>
                    )}
                  </div>

                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleEditCrop(crop)}
                      className="text-xs text-slate-700 hover:text-[#123D2A] font-semibold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete crop record for ${crop.cropName}?`)) {
                          await deleteCrop(crop.id);
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: YIELD & PROFIT PREDICTOR */}
      {activeTab === 'predictions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#10B981]" /> Empirical Yield Calculator
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Multi-parameter regression model incorporating soil type, irrigation efficiency, and Kharif/Rabi/Zaid seasonality.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Type</label>
                <select
                  value={predCrop}
                  onChange={(e) => setPredCrop(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value="Wheat">Wheat (Rabi Benchmark)</option>
                  <option value="Paddy">Paddy / Rice (Kharif Benchmark)</option>
                  <option value="Tomato">Tomato (High-Yield Vegetable)</option>
                  <option value="Onion">Onion (Cured Storage)</option>
                  <option value="Cotton">Cotton (Medium Staple)</option>
                  <option value="Soybean">Soybean (Oilseed)</option>
                  <option value="Potato">Potato (Tuber)</option>
                  <option value="Chilli">Chilli (Spices)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cultivated Area (Acres)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={predArea}
                  onChange={(e) => setPredArea(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Season</label>
                  <select
                    value={predSeason}
                    onChange={(e) => setPredSeason(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                  >
                    <option value="Kharif">Kharif (Monsoon)</option>
                    <option value="Rabi">Rabi (Winter)</option>
                    <option value="Zaid">Zaid (Summer)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
                  <select
                    value={predSoil}
                    onChange={(e) => setPredSoil(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                  >
                    <option value="Alluvial">Alluvial (High Fertility)</option>
                    <option value="Loamy">Loamy (Balanced)</option>
                    <option value="Black">Black Cotton</option>
                    <option value="Red">Red Soil</option>
                    <option value="Clay">Clay Heavy</option>
                    <option value="Sandy">Sandy Loam</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Irrigation System</label>
                  <select
                    value={predIrr}
                    onChange={(e) => setPredIrr(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                  >
                    <option value="Drip">Drip Irrigation (+25%)</option>
                    <option value="Sprinkler">Micro Sprinkler (+15%)</option>
                    <option value="Canal">Canal Irrigation</option>
                    <option value="Borewell">Borewell</option>
                    <option value="Rainfed">Rainfed (Dryland -28%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Farming Method</label>
                  <select
                    value={predMethod}
                    onChange={(e) => setPredMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                  >
                    <option value="Conventional">Conventional High-Yield</option>
                    <option value="Organic">Certified Organic</option>
                    <option value="Natural">ZBNF / Natural Farming</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunPrediction}
                disabled={isPredicting}
                className="w-full py-2.5 bg-[#123D2A] text-white rounded-xl text-xs font-bold hover:bg-[#1a553b] transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {isPredicting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                Calculate Yield & Uncertainty Range
              </button>
            </div>
          </div>

          {/* Prediction Results Display */}
          <div className="lg:col-span-7 space-y-4">
            {predResult ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Forecast Model Output</span>
                    <h4 className="text-xl font-extrabold text-[#123D2A] mt-0.5">
                      {predCrop} — {predArea} Acres ({predSeason} Season)
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md">
                      {predResult.confidenceScorePercent}% Confidence
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <div className="text-xs text-slate-500 font-medium">Estimated Yield / Acre</div>
                    <div className="text-2xl font-black text-emerald-800 mt-1">
                      {predResult.estimatedYieldQuintalsPerAcre} <span className="text-xs font-semibold">q/acre</span>
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <div className="text-xs text-slate-500 font-medium">Total Production</div>
                    <div className="text-2xl font-black text-emerald-800 mt-1">
                      {predResult.totalEstimatedYieldQuintals} <span className="text-xs font-semibold">Quintals</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">
                    Calibrated Uncertainty Range (P10 - P90)
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                    <span>Lower Estimate: <b>{predResult.uncertaintyRangeQuintals[0]} q</b></span>
                    <span className="text-slate-300">|</span>
                    <span>Expected: <b>{predResult.totalEstimatedYieldQuintals} q</b></span>
                    <span className="text-slate-300">|</span>
                    <span>Upper Estimate: <b>{predResult.uncertaintyRangeQuintals[1]} q</b></span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">Primary Agronomic Drivers</div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {predResult.primaryFactors?.map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs">
                <Calculator className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No Calculation Run Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select your crop, plot area, soil characteristics, and irrigation method on the left to generate calibrated yield and revenue forecasts.
                </p>
                <button
                  onClick={handleRunPrediction}
                  className="px-4 py-2 bg-[#123D2A] text-white rounded-xl text-xs font-bold hover:bg-[#1a553b] transition-colors"
                >
                  Run Baseline Prediction
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MARKETPLACE LISTINGS (CRUD) */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Direct Marketplace Listings</h3>
              <p className="text-xs text-slate-500">Sell your harvested produce directly to buyers without middleman cut</p>
            </div>
            <button
              onClick={() => {
                setEditingListing(null);
                setIsAddListingOpen(true);
              }}
              className="px-3.5 py-2 bg-[#123D2A] text-white rounded-lg text-xs font-bold hover:bg-[#1a553b] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Produce Listing
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmerListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <img
                  src={listing.imageUrl}
                  alt={listing.cropName}
                  className="w-full h-36 object-cover"
                />
                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base text-slate-900">{listing.cropName}</h4>
                      <p className="text-xs text-slate-500">{listing.variety} · Grade {listing.qualityGrade}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      listing.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {listing.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-slate-500">Asking Price</span>
                    <span className="text-lg font-black text-emerald-800">
                      ₹{listing.pricePerUnit.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-slate-500">/ {listing.unit}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex justify-between bg-slate-50 p-2 rounded-lg">
                    <span>Stock: <b>{listing.quantityAvailable} {listing.unit}</b></span>
                    <span>Option: <b>{listing.deliveryOption}</b></span>
                  </div>

                  {listing.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{listing.description}</p>
                  )}
                </div>

                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => updateListing(listing.id, { isActive: !listing.isActive })}
                    className="font-semibold text-slate-600 hover:text-slate-900"
                  >
                    {listing.isActive ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingListing(listing);
                      setListingForm({
                        cropName: listing.cropName,
                        variety: listing.variety,
                        quantityAvailable: listing.quantityAvailable,
                        unit: listing.unit,
                        pricePerUnit: listing.pricePerUnit,
                        qualityGrade: listing.qualityGrade,
                        harvestDate: listing.harvestDate,
                        deliveryOption: listing.deliveryOption as any,
                        description: listing.description,
                        imageUrl: listing.imageUrl,
                      });
                      setIsAddListingOpen(true);
                    }}
                    className="font-semibold text-[#123D2A] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Delete this product listing?')) {
                        await deleteListing(listing.id);
                      }
                    }}
                    className="font-semibold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Purchase Requests & Fulfillment</h3>
              <p className="text-xs text-slate-500">Review buyer purchase offers and update shipping stages</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total Orders: {farmerOrders.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Crop & Quantity</th>
                  <th className="px-4 py-3">Agreed Amount</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farmerOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{order.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{order.buyerName}</div>
                      <div className="text-[11px] text-slate-400">{order.deliveryMethod}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{order.cropName}</div>
                      <div className="text-[11px] text-slate-500">{order.quantity} {order.unit}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-800">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'requested'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-1">
                      {order.status === 'requested' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'accepted', 'Farmer accepted terms')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'rejected', 'Farmer unavailable')}
                            className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-[11px] font-semibold"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing', 'Harvesting started')}
                          className="px-2 py-1 bg-[#123D2A] text-white rounded text-[11px] font-semibold"
                        >
                          Start Harvesting
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready_for_dispatch', 'Produce crated')}
                          className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-[11px] font-semibold"
                        >
                          Ready to Dispatch
                        </button>
                      )}
                      {order.status === 'ready_for_dispatch' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'in_transit', 'Dispatched on truck')}
                          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold"
                        >
                          Mark In-Transit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: FINANCE & EXPENSES */}
      {activeTab === 'finance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Farm Cultivation Expenses & ROI</h3>
              <p className="text-xs text-slate-500">Track seed, fertilizer, and labor costs to compute true break-even prices</p>
            </div>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="px-3.5 py-2 bg-[#123D2A] text-white rounded-lg text-xs font-bold hover:bg-[#1a553b] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Record New Expense
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Total Cultivation Cost</span>
              <div className="text-2xl font-black text-slate-900 mt-1">₹{totalExpenses.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Fulfillment Revenue</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalOrderRevenue.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Estimated Net Surplus</span>
              <div className={`text-2xl font-black mt-1 ${totalOrderRevenue >= totalExpenses ? 'text-emerald-700' : 'text-amber-600'}`}>
                ₹{(totalOrderRevenue - totalExpenses).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Crop</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farmerExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-500">{exp.date}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{exp.cropName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{exp.description}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">₹{exp.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          if (window.confirm('Delete this expense?')) {
                            await deleteExpense(exp.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: CALENDAR & AGRO-METEOROLOGY */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Crop Stage & Seasonal Farming Milestones</h3>
            <p className="text-xs text-slate-500 mb-4">Recommended field activities for {weather?.district || 'Mandya'}, Karnataka</p>

            <div className="space-y-3">
              {[
                { time: 'Next 3 Days', task: 'Fertigation & Drip Schedule', desc: 'Apply water soluble 19:19:19 in morning hours before ambient temp exceeds 32°C.', tag: 'Nutrition' },
                { time: 'In 7 Days', task: 'Bio-Fungicide Spraying', desc: 'Spray Trichoderma viride or Neem formulation 10,000 ppm on Tomato foliar beds.', tag: 'Protection' },
                { time: 'Nov 20 - Nov 25', task: 'First Wave Tomato Harvest', desc: 'Prepare harvesting crates; coordinate with buyer for morning truck dispatch.', tag: 'Harvest' },
                { time: 'Nov 30', task: 'Paddy Harvesting & Moisture Check', desc: 'Check paddy grain moisture; target 12% moisture index before bagging.', tag: 'Post-Harvest' },
              ].map((item, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {item.tag}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 mt-1">{item.task}</h4>
                    <p className="text-xs text-slate-600">{item.desc}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap ml-4">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT CROP */}
      {isAddCropOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-[#123D2A] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">{editingCrop ? 'Edit Crop Record' : 'Add New Cultivated Crop'}</h3>
              <button onClick={() => setIsAddCropOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCrop} className="p-6 overflow-y-auto space-y-3.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={cropForm.cropName}
                    onChange={(e) => setCropForm({ ...cropForm, cropName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Variety</label>
                  <input
                    type="text"
                    required
                    value={cropForm.variety}
                    onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Plot ID / Name</label>
                  <input
                    type="text"
                    value={cropForm.farmPlot}
                    onChange={(e) => setCropForm({ ...cropForm, farmPlot: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={cropForm.cultivatedAreaAcres}
                    onChange={(e) => setCropForm({ ...cropForm, cultivatedAreaAcres: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Sowing Date</label>
                  <input
                    type="date"
                    value={cropForm.sowingDate}
                    onChange={(e) => setCropForm({ ...cropForm, sowingDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Expected Harvest</label>
                  <input
                    type="date"
                    value={cropForm.expectedHarvestDate}
                    onChange={(e) => setCropForm({ ...cropForm, expectedHarvestDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Stage</label>
                  <select
                    value={cropForm.growthStage}
                    onChange={(e) => setCropForm({ ...cropForm, growthStage: e.target.value as any })}
                    className="w-full px-2 py-2 border rounded-lg"
                  >
                    <option value="Germination">Germination</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Maturity">Maturity</option>
                    <option value="Harvest Ready">Harvest Ready</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Soil</label>
                  <select
                    value={cropForm.soilType}
                    onChange={(e) => setCropForm({ ...cropForm, soilType: e.target.value as any })}
                    className="w-full px-2 py-2 border rounded-lg"
                  >
                    <option value="Alluvial">Alluvial</option>
                    <option value="Loamy">Loamy</option>
                    <option value="Black">Black</option>
                    <option value="Red">Red</option>
                    <option value="Clay">Clay</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Irrigation</label>
                  <select
                    value={cropForm.irrigationMethod}
                    onChange={(e) => setCropForm({ ...cropForm, irrigationMethod: e.target.value as any })}
                    className="w-full px-2 py-2 border rounded-lg"
                  >
                    <option value="Drip">Drip</option>
                    <option value="Sprinkler">Sprinkler</option>
                    <option value="Canal">Canal</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Agronomic Notes</label>
                <textarea
                  value={cropForm.notes}
                  onChange={(e) => setCropForm({ ...cropForm, notes: e.target.value })}
                  placeholder="Fertilizer schedule, pest notes, seed source..."
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCropOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123D2A] text-white rounded-lg font-bold"
                >
                  Save Crop Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT LISTING */}
      {isAddListingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-[#123D2A] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">{editingListing ? 'Edit Produce Listing' : 'Publish Produce Listing'}</h3>
              <button onClick={() => setIsAddListingOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveListing} className="p-6 overflow-y-auto space-y-3.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Crop</label>
                  <input
                    type="text"
                    required
                    value={listingForm.cropName}
                    onChange={(e) => setListingForm({ ...listingForm, cropName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Variety</label>
                  <input
                    type="text"
                    required
                    value={listingForm.variety}
                    onChange={(e) => setListingForm({ ...listingForm, variety: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={listingForm.quantityAvailable}
                    onChange={(e) => setListingForm({ ...listingForm, quantityAvailable: Number(e.target.value) })}
                    className="w-full px-2 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit</label>
                  <select
                    value={listingForm.unit}
                    onChange={(e) => setListingForm({ ...listingForm, unit: e.target.value })}
                    className="w-full px-2 py-2 border rounded-lg"
                  >
                    <option value="Quintal (100 kg)">Quintal (100 kg)</option>
                    <option value="Kg">Kilogram (Kg)</option>
                    <option value="Crates (25 kg)">Crates (25 kg)</option>
                    <option value="Tonnes">Tonnes</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Price (₹/unit)</label>
                  <input
                    type="number"
                    required
                    value={listingForm.pricePerUnit}
                    onChange={(e) => setListingForm({ ...listingForm, pricePerUnit: Number(e.target.value) })}
                    className="w-full px-2 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Quality Grade</label>
                  <select
                    value={listingForm.qualityGrade}
                    onChange={(e) => setListingForm({ ...listingForm, qualityGrade: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="A+">A+ Premium (Export Grade)</option>
                    <option value="A">Grade A (Uniform Size)</option>
                    <option value="B+">Grade B+ (Standard Market)</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Fulfillment Option</label>
                  <select
                    value={listingForm.deliveryOption}
                    onChange={(e) => setListingForm({ ...listingForm, deliveryOption: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Farm Pickup">Farm Pickup</option>
                    <option value="Mandi Delivery">Mandi Delivery</option>
                    <option value="Buyer Transport">Buyer Transport</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description & Specs</label>
                <textarea
                  value={listingForm.description}
                  onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
                  placeholder="Packaging details, minimum order size, moisture index..."
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddListingOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123D2A] text-white rounded-lg font-bold"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EXPENSE */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-[#123D2A] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Record Cultivation Expense</h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveExpense} className="p-6 space-y-3.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Crop</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.cropName}
                    onChange={(e) => setExpenseForm({ ...expenseForm, cropName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Labor">Labor</option>
                    <option value="Irrigation">Irrigation</option>
                    <option value="Machinery">Machinery Rental</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="e.g. 5 bags of potash, tractor fuel..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#123D2A] text-white rounded-lg font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

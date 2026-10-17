import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  MapPin,
  TrendingDown,
  TrendingUp,
  X,
  Send,
  AlertCircle
} from 'lucide-react';
import type { ProductListing, OrderRecord } from '../../firebase/repository';
import type { OrderStatus } from '../../utils/orderLifecycle';

export const BuyerModule: React.FC = () => {
  const {
    currentUser,
    listings,
    orders,
    createOrder,
    updateOrderStatus,
    mandiPrices,
    setIsVoiceAssistantOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'marketplace' | 'orders' | 'intelligence'>('marketplace');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');

  // Purchase Request Modal
  const [selectedProduct, setSelectedProduct] = useState<ProductListing | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(25);
  const [deliveryMethod, setDeliveryMethod] = useState('Buyer Transport (Refrigerated Van)');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);

  // Buyer specific orders
  const buyerOrders = orders.filter((o) => o.buyerId === currentUser.id);

  // Filter listings
  const filteredListings = listings.filter((l) => {
    if (!l.isActive) return false;
    const matchesSearch =
      l.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.farmerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = cropFilter === 'All' || l.cropName === cropFilter;
    const matchesGrade = gradeFilter === 'All' || l.qualityGrade === gradeFilter;
    const matchesState = stateFilter === 'All' || l.state === stateFilter;
    return matchesSearch && matchesCrop && matchesGrade && matchesState;
  });

  const handleOpenOrderModal = (product: ProductListing) => {
    setSelectedProduct(product);
    setPurchaseQuantity(Math.min(25, product.quantityAvailable));
    setSpecialInstructions('');
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsOrdering(true);
    try {
      const totalAmount = purchaseQuantity * selectedProduct.pricePerUnit;
      await createOrder({
        listingId: selectedProduct.id,
        cropName: selectedProduct.cropName,
        buyerId: currentUser.id,
        buyerName: `${currentUser.fullName} (${currentUser.farmOrBusinessName || 'Wholesale Buyer'})`,
        buyerContact: currentUser.email,
        farmerId: selectedProduct.farmerId,
        farmerName: selectedProduct.farmerName,
        farmerDistrict: `${selectedProduct.district}, ${selectedProduct.state}`,
        quantity: purchaseQuantity,
        unit: selectedProduct.unit,
        agreedPricePerUnit: selectedProduct.pricePerUnit,
        totalAmount,
        status: 'requested',
        deliveryMethod,
        specialInstructions,
      });

      alert(`Purchase request sent to ${selectedProduct.farmerName} for ${purchaseQuantity} ${selectedProduct.unit}.`);
      setSelectedProduct(null);
      setActiveTab('orders');
    } catch (err) {
      console.error('Order request error:', err);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003B46] to-[#07575B] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#00B8F0] flex items-center justify-center text-[#123D2A] shadow-lg shrink-0">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{currentUser.fullName}</h1>
              <span className="text-xs bg-[#00B8F0] text-white font-bold px-2 py-0.5 rounded-full">
                Wholesale Buyer
              </span>
            </div>
            <div className="text-xs text-sky-200 mt-1 flex flex-wrap items-center gap-2">
              <span>{currentUser.farmOrBusinessName || 'FreshBasket Wholesale'}</span>
              <span aria-hidden="true">·</span>
              <span>{currentUser.district}, {currentUser.state}</span>
              <span aria-hidden="true">·</span>
              <span>{filteredListings.length} Verified Produce Batches Available</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsVoiceAssistantOpen(true)}
            className="px-4 py-2 bg-[#00B8F0] hover:bg-sky-400 text-[#123D2A] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#123D2A]" /> AI Sourcing Engine
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-white px-4 py-2 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'marketplace'
              ? 'bg-[#123D2A] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Agricultural Marketplace ({filteredListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'orders'
              ? 'bg-[#123D2A] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>My Purchase Orders ({buyerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('intelligence')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'intelligence'
              ? 'bg-[#123D2A] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Mandi vs Direct Price Intelligence</span>
        </button>
      </div>

      {/* TAB 1: MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tomato, basmati, wheat, onion..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
              >
                <option value="All">All Crops</option>
                <option value="Tomato">Tomato</option>
                <option value="Paddy">Paddy / Rice</option>
                <option value="Wheat">Wheat</option>
                <option value="Onion">Onion</option>
                <option value="Chilli">Chilli</option>
              </select>

              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
              >
                <option value="All">All Quality Grades</option>
                <option value="A+">A+ Premium</option>
                <option value="A">Grade A</option>
                <option value="B+">Grade B+</option>
              </select>

              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
              >
                <option value="All">All States</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Punjab">Punjab</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div className="relative">
                  <img
                    src={listing.imageUrl}
                    alt={listing.cropName}
                    className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#123D2A]/90 text-white backdrop-blur-xs">
                    Grade {listing.qualityGrade}
                  </span>
                </div>

                <div className="p-4 flex-1 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{listing.cropName}</h3>
                      <p className="text-xs text-slate-500">{listing.variety}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-800">
                      ₹{listing.pricePerUnit.toLocaleString()}
                      <span className="text-[10px] text-slate-500 font-normal"> / {listing.unit}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Available:</span>
                      <span className="font-semibold text-slate-800">{listing.quantityAvailable} {listing.unit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Farmer:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[170px]">{listing.farmerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-semibold text-slate-800">{listing.district}, {listing.state}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Fulfillment:</span>
                      <span className="font-semibold text-emerald-700">{listing.deliveryOption}</span>
                    </div>
                  </div>

                  {listing.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>
                  )}
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleOpenOrderModal(listing)}
                    className="w-full py-2.5 bg-[#123D2A] hover:bg-[#1a553b] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    Request Direct Purchase <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BUYER PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Your Agricultural Procurement Orders</h3>
              <p className="text-xs text-slate-500">Track shipments, confirm deliveries, or initiate dispute arbitration</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total Active: {buyerOrders.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Farmer & Plot</th>
                  <th className="px-4 py-3">Crop Batch</th>
                  <th className="px-4 py-3">Total Cost</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buyerOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{order.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{order.farmerName}</div>
                      <div className="text-[11px] text-slate-400">{order.farmerDistrict}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{order.cropName}</div>
                      <div className="text-[11px] text-slate-500">{order.quantity} {order.unit} @ ₹{order.agreedPricePerUnit}</div>
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
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed', 'Buyer confirmed and escrow initiated')}
                          className="px-2.5 py-1 bg-[#123D2A] text-white rounded text-[11px] font-semibold"
                        >
                          Confirm & Escrow
                        </button>
                      )}
                      {order.status === 'in_transit' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered', 'Shipment arrived at buyer facility')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold"
                        >
                          Acknowledge Delivery
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed', 'Quality verified; payment released to farmer')}
                            className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[11px] font-semibold"
                          >
                            Accept & Complete
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'disputed', 'Quality issue raised to admin arbitration')}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-[11px] font-semibold"
                          >
                            Dispute
                          </button>
                        </>
                      )}
                      {order.status === 'requested' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled', 'Buyer cancelled pending request')}
                          className="px-2 py-1 bg-slate-100 text-slate-600 hover:text-red-600 rounded text-[11px] font-semibold"
                        >
                          Cancel
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

      {/* TAB 3: PRICE INTELLIGENCE */}
      {activeTab === 'intelligence' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">APMC Mandi vs Direct Farmer Prices</h3>
            <p className="text-xs text-slate-500">Benchmark wholesale listings against real-time Agmarknet modal quotes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mandiPrices.map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{m.cropName}</span>
                  <span className="text-[10px] text-slate-400">{m.district}, {m.state}</span>
                </div>
                <div className="text-base font-extrabold text-slate-800">
                  ₹{m.modalPrice.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-500">/ quintal (APMC)</span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200/60">
                  <span>Min: ₹{m.minPrice}</span>
                  <span>Max: ₹{m.maxPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: PURCHASE REQUEST */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-[#123D2A] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Request Produce Purchase</h3>
                <p className="text-xs text-emerald-200">{selectedProduct.cropName} ({selectedProduct.variety})</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOrder} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Unit Asking Price</span>
                  <span className="font-bold text-emerald-900 text-sm">
                    ₹{selectedProduct.pricePerUnit.toLocaleString()} / {selectedProduct.unit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Available In Stock</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedProduct.quantityAvailable} {selectedProduct.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Required Purchase Quantity ({selectedProduct.unit})</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.quantityAvailable}
                  required
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Fulfillment / Logistics Method</label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value="Buyer Transport (Refrigerated Van)">Buyer Transport (Refrigerated Van)</option>
                  <option value="Farm Gate Direct Pickup">Farm Gate Direct Pickup</option>
                  <option value="Mandi Delivery by Farmer">Mandi Delivery by Farmer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Special Packaging or Delivery Instructions</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. 25kg crates with vent holes, morning arrival window..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
                  rows={2}
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-600">Total Purchase Commitment:</span>
                <span className="text-base font-extrabold text-[#123D2A]">
                  ₹{(purchaseQuantity * selectedProduct.pricePerUnit).toLocaleString()}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOrdering}
                  className="px-4 py-2 bg-[#123D2A] text-white rounded-lg font-bold hover:bg-[#1a553b] transition-colors"
                >
                  {isOrdering ? 'Submitting...' : 'Send Purchase Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

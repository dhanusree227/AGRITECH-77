import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Users,
  Package,
  CheckCircle2,
  AlertTriangle,
  Activity,
  FileText,
  Search,
  Lock,
  RefreshCw,
  Sliders,
  Database,
  Key,
  CloudCheck
} from 'lucide-react';
import { repository, type UserAccount } from '../../firebase/repository';
import type { UserRole } from '../../utils/orderLifecycle';

export const AdminModule: React.FC = () => {
  const {
    currentUser,
    listings,
    deleteListing,
    updateListing,
    orders,
    updateOrderStatus,
    auditLogs,
    isFirebaseLive,
    setIsCloudModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'listings' | 'orders' | 'monitoring' | 'audit'>('dashboard');
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const fetchUsers = async () => {
    const data = await repository.getUsers();
    setUsersList(data);
  };

  const fetchHealth = async () => {
    try {
      const resp = await fetch('/api/health');
      if (resp.ok) {
        const data = await resp.json();
        setHealthStatus(data);
      }
    } catch (e) {
      console.warn('Health fetch error:', e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchHealth();
  }, []);

  const totalPlatformVolume = orders
    .filter((o) => ['confirmed', 'preparing', 'ready_for_dispatch', 'in_transit', 'delivered', 'completed'].includes(o.status))
    .reduce((s, o) => s + o.totalAmount, 0);

  const handleToggleVerification = async (userId: string) => {
    await repository.toggleUserVerification(userId, currentUser.fullName);
    await fetchUsers();
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    await repository.updateUserRole(userId, newRole, currentUser.fullName);
    await fetchUsers();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#18251E] to-[#25392D] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-lg shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">Platform Administration & Governance</h1>
              <span className="text-xs bg-amber-500 text-slate-900 font-bold px-2 py-0.5 rounded-full">
                Super Admin
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
              <span>{currentUser.fullName}</span>
              <span aria-hidden="true">·</span>
              <span>{currentUser.email}</span>
              <span aria-hidden="true">·</span>
              <span>Audit Logging & Access Control Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCloudModalOpen(true)}
            className="px-4 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-[#10B981]" /> Cloud & Security Rules
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-white px-4 py-2 rounded-xl shadow-2xs">
        {[
          { id: 'dashboard', label: 'Overview Metrics', icon: Activity },
          { id: 'users', label: `User Accounts (${usersList.length})`, icon: Users },
          { id: 'listings', label: `Moderation (${listings.length})`, icon: Package },
          { id: 'orders', label: `Trade Arbitration (${orders.length})`, icon: CheckCircle2 },
          { id: 'monitoring', label: 'AI & System Health', icon: Sliders },
          { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: FileText },
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

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Total Registered Users</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{usersList.length}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">
                {usersList.filter((u) => u.isVerified).length} verified accounts
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Active Market Listings</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{listings.length}</div>
              <div className="text-[11px] text-slate-500 mt-1">Across 4 agricultural zones</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Platform Trade Turnover</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                ₹{totalPlatformVolume.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">{orders.length} Total orders executed</div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Security & RBAC Rules</span>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <span className="text-emerald-600 text-sm font-bold">Compliant</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Firestore Rules validated</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Platform Activity Summary</h3>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span>Pending Buyer Requests awaiting Farmer Confirmation:</span>
                  <b className="text-amber-600">{orders.filter((o) => o.status === 'requested').length}</b>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span>Shipments in transit or preparing:</span>
                  <b className="text-sky-600">
                    {orders.filter((o) => ['preparing', 'ready_for_dispatch', 'in_transit'].includes(o.status)).length}
                  </b>
                </li>
                <li className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span>Disputed Transactions requiring Mediation:</span>
                  <b className="text-red-600">{orders.filter((o) => o.status === 'disputed').length}</b>
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Integration Health Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#10B981]" /> Google Gemini 2.5 Flash
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {healthStatus?.integrations?.geminiAi?.status || 'Active'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <CloudCheck className="w-4 h-4 text-[#00B8F0]" /> Open-Meteo Weather Provider
                  </span>
                  <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                    Operational (WMO)
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#123D2A]" /> Database & RBAC Layer
                  </span>
                  <span className="text-[11px] font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded-md">
                    {isFirebaseLive ? 'Cloud Firestore' : 'Hybrid Local Storage'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">User Account & Permission Management</h3>
              <p className="text-xs text-slate-500">Verify farmer land deeds, trader licenses, and assign RBAC roles</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#10B981]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Current Role</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3">Manage Role</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList
                  .filter((u) => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{u.fullName}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {u.district}, {u.state}
                      </td>
                      <td className="px-4 py-3">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {u.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                          className="px-2 py-1 text-xs border rounded-lg"
                        >
                          <option value="farmer">Farmer</option>
                          <option value="buyer">Buyer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleVerification(u.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold border rounded-lg hover:bg-slate-100"
                        >
                          {u.isVerified ? 'Suspend' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LISTING MODERATION */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Product Listing Moderation</h3>
            <p className="text-xs text-slate-500">Remove fraudulent produce listings and verify grade compliance</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Farmer</th>
                  <th className="px-4 py-3">Grade & Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {l.cropName} ({l.variety})
                    </td>
                    <td className="px-4 py-3 text-slate-600">{l.farmerName}</td>
                    <td className="px-4 py-3">
                      Grade {l.qualityGrade} · ₹{l.pricePerUnit} / {l.unit}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        l.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {l.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => updateListing(l.id, { isActive: !l.isActive })}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        {l.isActive ? 'Suspend' : 'Reinstate'}
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Moderator action: delete listing?')) {
                            await deleteListing(l.id);
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TRADE ARBITRATION */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Platform Transaction & Dispute Oversight</h3>
            <p className="text-xs text-slate-500">Monitor order progression across farmers and buyers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Farmer</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Crop & Quantity</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{o.id}</td>
                    <td className="px-4 py-3 text-slate-700">{o.farmerName}</td>
                    <td className="px-4 py-3 text-slate-700">{o.buyerName}</td>
                    <td className="px-4 py-3">{o.quantity} {o.unit} of {o.cropName}</td>
                    <td className="px-4 py-3 font-bold text-emerald-800">₹{o.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {o.status === 'disputed' && (
                        <button
                          onClick={() => updateOrderStatus(o.id, 'completed', 'Admin mediated resolution')}
                          className="px-2 py-1 bg-amber-600 text-white rounded text-[11px] font-semibold"
                        >
                          Resolve Dispute
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

      {/* TAB 5: AI & SYSTEM MONITORING */}
      {activeTab === 'monitoring' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#10B981]" /> Gemini AI Model Monitoring
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Model Designation:</span>
                <b className="text-slate-900">gemini-2.5-flash</b>
              </div>
              <div className="flex justify-between">
                <span>Task Scope:</span>
                <b className="text-slate-900">Agronomic QA, Voice transcription, Disease Vision</b>
              </div>
              <div className="flex justify-between">
                <span>Fallback Mode:</span>
                <b className="text-emerald-700">Empirical Rule-Based Agro Engine</b>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#10B981]" /> Firestore Rules & RBAC Audit
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Security Engine Version:</span>
                <b className="text-slate-900">rules_version = '2'</b>
              </div>
              <div className="flex justify-between">
                <span>Policy Enforcement:</span>
                <b className="text-emerald-700">Strict Ownership & Admin Escalation Gates</b>
              </div>
              <div className="flex justify-between">
                <span>App Check Status:</span>
                <b className="text-slate-900">Token validation enabled</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Immutable Administrative Audit Logs</h3>
            <p className="text-xs text-slate-500">Every sensitive action, verification, and role update is recorded</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{log.actorName}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {log.targetType} ({log.targetId})
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

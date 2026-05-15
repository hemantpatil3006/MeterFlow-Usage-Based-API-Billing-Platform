import { useState, useEffect } from 'react';
import { Plus, Key, RefreshCw, Copy, Check, BarChart3, DollarSign, Activity } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { io } from 'socket.io-client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [apis, setApis] = useState([]);
  const [metrics, setMetrics] = useState({ totalCalls: 0, currentCost: 0, usageTrend: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newApiData, setNewApiData] = useState({ name: '', description: '' });
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [apisRes, metricsRes] = await Promise.all([
          api.get('/apis'),
          api.get('/analytics/dashboard')
        ]);
        setApis(apisRes.data);
        setMetrics(metricsRes.data);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Setup Socket.io
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    socket.on('connect', () => {
      if (user && user._id) {
        socket.emit('join_user_room', user._id);
      }
    });

    socket.on('usage_updated', () => {
      // Real-time counter updates
      setMetrics((prev) => ({
        ...prev,
        totalCalls: prev.totalCalls + 1,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  const fetchApisAndMetrics = async () => {
    try {
      const [apisRes, metricsRes] = await Promise.all([
        api.get('/apis'),
        api.get('/analytics/dashboard')
      ]);
      setApis(apisRes.data);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const handleCreateApi = async (e) => {
    e.preventDefault();
    try {
      await api.post('/apis', newApiData);
      setNewApiData({ name: '', description: '' });
      setShowModal(false);
      fetchApisAndMetrics();
    } catch (error) {
      console.error('Error creating API', error);
    }
  };

  const handleRegenerateKey = async (apiId) => {
    if (!window.confirm('Are you sure you want to regenerate this key? Any applications using the old key will break immediately.')) return;
    try {
      await api.post(`/apis/${apiId}/regenerate`);
      fetchApisAndMetrics();
    } catch (error) {
      console.error('Error regenerating key', error);
    }
  };

  const copyToClipboard = (text, apiId) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(apiId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back, <span className="font-medium text-gray-900">{user?.name}</span>
              </span>
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 mr-4">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total API Calls</p>
                <h3 className="text-2xl font-bold text-gray-900">{metrics.totalCalls.toLocaleString()}</h3>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
              <div className="p-3 rounded-lg bg-green-50 text-green-600 mr-4">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Current Cost</p>
                <h3 className="text-2xl font-bold text-gray-900">₹{metrics.currentCost.toFixed(2)}</h3>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600 mr-4">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active APIs</p>
                <h3 className="text-2xl font-bold text-gray-900">{apis.length}</h3>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Usage Trend (Last 30 Days)</h3>
            <div className="h-72 w-full">
              {metrics.usageTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.usageTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="calls" stroke="#4F46E5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">No data available for the selected period.</div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your APIs</h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
            >
              <Plus size={16} className="mr-2" />
              Create API
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : apis.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-sm">
              <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No APIs configured</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Get started by creating your first API configuration to generate API keys for your applications.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus size={16} className="mr-2" />
                Create your first API
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {apis.map((apiItem) => (
                <div key={apiItem._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{apiItem.name}</h3>
                      {apiItem.description && (
                        <p className="text-sm text-gray-500 mt-1">{apiItem.description}</p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">API Key</label>
                    <div className="flex items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <code className="text-sm text-gray-800 flex-1 truncate font-mono">
                        {apiItem.apiKey || 'No key generated'}
                      </code>
                      <button
                         onClick={() => copyToClipboard(apiItem.apiKey, apiItem._id)}
                        className="ml-2 p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedKey === apiItem._id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleRegenerateKey(apiItem._id)}
                        className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
                      >
                        <RefreshCw size={14} className="mr-1.5" />
                        Regenerate Key
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create API Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500/75" onClick={() => setShowModal(false)}>
          <div 
            className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleCreateApi}>
              <div className="px-6 py-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Create New API</h3>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">API Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      value={newApiData.name}
                      onChange={(e) => setNewApiData({...newApiData, name: e.target.value})}
                      placeholder="e.g. Production Mobile App"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                    <textarea
                      name="description"
                      id="description"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      value={newApiData.description}
                      onChange={(e) => setNewApiData({...newApiData, description: e.target.value})}
                      placeholder="Usage notes for this API key..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Create API
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

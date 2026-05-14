import { useState, useEffect } from 'react';
import { Plus, Key, RefreshCw, Copy, Check } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [apis, setApis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newApiData, setNewApiData] = useState({ name: '', description: '' });
  const [copiedKey, setCopiedKey] = useState(null);

  // Fetch APIs on load
  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    try {
      const response = await api.get('/apis');
      setApis(response.data);
    } catch (error) {
      console.error('Error fetching APIs', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApi = async (e) => {
    e.preventDefault();
    try {
      await api.post('/apis', newApiData);
      setNewApiData({ name: '', description: '' });
      setShowModal(false);
      fetchApis();
    } catch (error) {
      console.error('Error creating API', error);
    }
  };

  const handleRegenerateKey = async (apiId) => {
    if (!window.confirm('Are you sure you want to regenerate this key? Any applications using the old key will break immediately.')) {
      return;
    }

    try {
      await api.post(`/apis/${apiId}/regenerate`);
      fetchApis();
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
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

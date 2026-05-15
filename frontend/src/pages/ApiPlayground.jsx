import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Play, Terminal, Clock, Activity, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ApiPlayground = () => {
  const [apis, setApis] = useState([]);
  const [selectedApi, setSelectedApi] = useState(null);
  const [endpoint, setEndpoint] = useState('/v1/test');
  const [method, setMethod] = useState('GET');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [latency, setLatency] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    try {
      const res = await api.get('/apis');
      setApis(res.data);
      if (res.data.length > 0) {
        setSelectedApi(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching APIs', err);
    }
  };

  const handleExecute = async (e) => {
    e.preventDefault();
    if (!selectedApi) return;

    setIsLoading(true);
    setResponse(null);
    setError(null);
    setLatency(null);

    const startTime = performance.now();
    try {
      let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      // Strip /api from baseURL to correctly hit the /v1 gateway
      if (baseURL.endsWith('/api')) {
        baseURL = baseURL.slice(0, -4);
      }
      
      const url = `${baseURL}${endpoint}`;

      const res = await axios({
        method,
        url,
        headers: {
          'x-api-key': selectedApi.apiKey,
        },
      });

      const endTime = performance.now();
      setLatency((endTime - startTime).toFixed(2));
      setResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
      });
    } catch (err) {
      const endTime = performance.now();
      setLatency((endTime - startTime).toFixed(2));
      
      if (err.response) {
        setResponse({
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
        });
      } else {
        setError(err.message || 'Network Error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">API Playground</h1>
            <p className="mt-2 text-sm text-gray-600">
              Test your configured API keys and endpoints directly from the dashboard. Live usage will be tracked.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Request Builder */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Terminal size={18} className="mr-2 text-indigo-600" />
                  Request Builder
                </h3>
                
                <form onSubmit={handleExecute} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select API Key</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      value={selectedApi?._id || ''}
                      onChange={(e) => setSelectedApi(apis.find(a => a._id === e.target.value))}
                      required
                    >
                      {apis.map(api => (
                        <option key={api._id} value={api._id}>{api.name} ({api.apiKey.substring(0, 8)}...)</option>
                      ))}
                      {apis.length === 0 && <option value="">No APIs found</option>}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                      >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        required
                        placeholder="/v1/test"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={isLoading || !selectedApi}
                      className="w-full flex justify-center items-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors shadow-sm font-medium"
                    >
                      {isLoading ? (
                        <Activity size={18} className="animate-spin mr-2" />
                      ) : (
                        <Play size={18} className="mr-2" fill="currentColor" />
                      )}
                      {isLoading ? 'Sending Request...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Response Viewer */}
            <div className="lg:col-span-7">
              <div className="bg-[#1E1E1E] rounded-xl shadow-lg border border-gray-800 overflow-hidden h-full min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 bg-[#2D2D2D] border-b border-gray-700 text-sm">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex space-x-4 text-gray-400">
                    {response && (
                      <span className={`font-medium ${response.status >= 200 && response.status < 300 ? 'text-green-400' : 'text-red-400'}`}>
                        {response.status} {response.statusText}
                      </span>
                    )}
                    {latency && (
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {latency} ms
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto text-gray-300 font-mono text-sm">
                  {error && (
                    <div className="flex items-center text-red-400 mb-4 bg-red-900/20 p-3 rounded">
                      <AlertCircle size={16} className="mr-2 shrink-0" />
                      {error}
                    </div>
                  )}
                  
                  {!response && !error && !isLoading && (
                    <div className="h-full flex items-center justify-center text-gray-600 italic">
                      Awaiting request...
                    </div>
                  )}

                  {response && (
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ApiPlayground;

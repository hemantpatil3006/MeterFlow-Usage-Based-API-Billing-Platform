import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { RefreshCw, Activity, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState({ latencyStats: [], errorStats: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/analytics/detailed');
      
      // Parse error stats
      const rawErrorStats = res.data.errorStats || [];
      const errorData = [
        { name: 'Success (2xx/3xx)', value: 0 },
        { name: 'Errors (4xx/5xx)', value: 0 }
      ];

      rawErrorStats.forEach(stat => {
        if (stat._id.isError) {
          errorData[1].value += stat.count;
        } else {
          errorData[0].value += stat.count;
        }
      });

      setStats({
        latencyStats: res.data.latencyStats,
        errorStats: errorData
      });
    } catch (error) {
      console.error('Error fetching analytics', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#10B981', '#EF4444']; // Green for success, Red for errors

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">API Analytics</h1>
            <p className="mt-2 text-sm text-gray-600">
              Deep dive into your API performance, latency, and error rates.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Latency Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3">
                    <Activity size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Average Latency (ms)</h3>
                </div>
                
                <div className="h-80">
                  {stats.latencyStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.latencyStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="apiName" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} />
                        <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="avgLatency" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">No latency data available.</div>
                  )}
                </div>
              </div>

              {/* Error Rate Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg mr-3">
                    <AlertTriangle size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Success vs Error Rate</h3>
                </div>

                <div className="h-80">
                  {stats.errorStats[0].value > 0 || stats.errorStats[1].value > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.errorStats}
                          cx="50%"
                          cy="45%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.errorStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">No request data available.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;

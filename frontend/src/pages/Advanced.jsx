import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Shield, Bell, Trash2, Plus, Clock, Terminal } from 'lucide-react';

const Advanced = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newWebhook, setNewWebhook] = useState({ endpointUrl: '', events: ['quota_exceeded'] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [hooksRes, logsRes] = await Promise.all([
        api.get('/advanced/webhooks'),
        api.get('/advanced/audit-logs')
      ]);
      setWebhooks(hooksRes.data);
      setAuditLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching advanced data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWebhook = async (e) => {
    e.preventDefault();
    if (!newWebhook.endpointUrl) return;
    
    try {
      setIsSubmitting(true);
      await api.post('/advanced/webhooks', newWebhook);
      setNewWebhook({ endpointUrl: '', events: ['quota_exceeded'] });
      fetchData();
    } catch (error) {
      console.error('Error creating webhook', error);
      alert('Failed to create webhook');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWebhook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await api.delete(`/advanced/webhooks/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting webhook', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Advanced Settings</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage webhooks, view audit logs, and configure advanced security features.
            </p>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-gray-500">Loading settings...</div>
          ) : (
            <div className="space-y-8">
              
              {/* Webhooks Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="text-indigo-600 mr-3" size={20} />
                    <h3 className="text-lg font-medium text-gray-900">Webhooks & Alerts</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <form onSubmit={handleAddWebhook} className="flex gap-4 mb-6 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                      <input
                        type="url"
                        placeholder="https://your-domain.com/webhook"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        value={newWebhook.endpointUrl}
                        onChange={(e) => setNewWebhook({...newWebhook, endpointUrl: e.target.value})}
                      />
                    </div>
                    <div>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Webhook
                      </button>
                    </div>
                  </form>

                  {webhooks.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint URL</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {webhooks.map((hook) => (
                            <tr key={hook._id}>
                              <td className="px-6 py-4 text-sm font-mono text-gray-800">{hook.endpointUrl}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {hook.events.map(e => (
                                  <span key={e} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                                    {e}
                                  </span>
                                ))}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-medium">
                                <button onClick={() => handleDeleteWebhook(hook._id)} className="text-red-600 hover:text-red-900">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No webhooks configured.</p>
                  )}
                </div>
              </div>

              {/* Audit Logs Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="text-indigo-600 mr-3" size={20} />
                    <h3 className="text-lg font-medium text-gray-900">
                      Audit Logs {isAdmin && <span className="ml-2 text-xs font-bold px-2 py-1 bg-red-100 text-red-800 rounded">ADMIN VIEW</span>}
                    </h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><Clock size={14} className="inline mr-1"/> Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><Terminal size={14} className="inline mr-1"/> IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {auditLogs.length > 0 ? (
                        auditLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {log.action}
                              </span>
                            </td>
                            {isAdmin && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {log.userId?.email || 'Unknown'}
                              </td>
                            )}
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {log.details || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                              {log.ipAddress || '127.0.0.1'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-sm text-gray-500">
                            No audit logs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Advanced;

import { useState, useEffect } from 'react';
import api from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import Sidebar from '../components/Sidebar';
import { CreditCard, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock');

function Billing() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      alert('Payment successful! Your bill has been marked as paid.');
    }
    if (query.get('canceled')) {
      alert('Payment was canceled. You can try again later.');
    }
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await api.get('/billing');
      setBills(response.data);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to load billing history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleCheckout = async (billId) => {
    try {
      setCheckoutLoading(billId);
      const response = await api.post('/billing/checkout', { billId });
      
      const { url } = response.data;
      if (url) {
        window.location.href = url; // Redirect to Stripe Checkout
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to initiate checkout.');
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Billing & Usage</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your monthly API usage bills and payment history.
            </p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Period</th>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">API Name</th>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Requests</th>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Cost (₹)</th>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Status</th>
                    <th scope="col" className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        Loading billing info...
                      </td>
                    </tr>
                  ) : bills.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No billing history</h3>
                        <p className="text-gray-500">You don't have any bills yet.</p>
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill) => (
                      <tr key={bill._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {bill.billingPeriod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {bill.apiId?.name || 'Unknown API'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                          {bill.totalRequests.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-right">
                          ₹{bill.cost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              bill.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {bill.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {bill.status === 'pending' ? (
                            <button
                              onClick={() => handleCheckout(bill._id)}
                              disabled={checkoutLoading === bill._id}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                            >
                              {checkoutLoading === bill._id ? 'Processing...' : 'Pay Now'}
                            </button>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Billing;

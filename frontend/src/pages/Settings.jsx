import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { User, Mail, Shield, Save } from 'lucide-react';

const Settings = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings updated successfully!');
    // Ideally this would make an API call to update the user profile
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your personal profile and preferences.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          <User size={16} />
                        </span>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          <Mail size={16} />
                        </span>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          disabled
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed sm:text-sm"
                          value={formData.email}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Account Role
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          <Shield size={16} />
                        </span>
                        <input
                          type="text"
                          disabled
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 bg-gray-50 text-gray-500 capitalize cursor-not-allowed sm:text-sm"
                          value={user.role || 'user'}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                <div className="pt-5 border-t border-gray-200 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Save size={16} className="mr-2 self-center" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Settings;

// src/Pages/Admin/AdminDashboardContent.tsx
import React from 'react';
import { FaUsers, FaSchool, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

// एक साधा स्टॅटिस्टिक कार्ड कंपोनंट
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  colorTheme: string; // e.g., 'blue', 'green', 'yellow', 'red'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorTheme }) => {
  const themeClasses: { [key: string]: string } = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    red: 'bg-red-500 hover:bg-red-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-[#d58e39] hover:bg-[#b86807]', // तुमचा थीम रंग
  };

  return (
    <div className={`p-6 rounded-lg shadow-lg text-white transition-all duration-300 transform hover:scale-105 ${themeClasses[colorTheme] || 'bg-gray-500'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
};


const AdminDashboardContent: React.FC = () => {
  // येथे तुम्ही API वरून खरी माहिती मिळवू शकता
  const stats = {
    totalUsers: 1250,
    totalSchools: 350,
    reportsToday: 25,
    pendingIssues: 3,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-1">Admin Dashboard</h2>
        <p className="text-gray-600">Welcome back, Admin! Here's a quick overview.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<FaUsers />}
          colorTheme="orange" // तुमचा थीम रंग
        />
        <StatCard
          title="Total Schools"
          value={stats.totalSchools.toLocaleString()}
          icon={<FaSchool />}
          colorTheme="blue"
        />
        <StatCard
          title="Reports Today"
          value={stats.reportsToday.toLocaleString()}
          icon={<FaChartLine />}
          colorTheme="green"
        />
        <StatCard
          title="Pending Issues"
          value={stats.pendingIssues.toLocaleString()}
          icon={<FaExclamationTriangle />}
          colorTheme="red"
        />
      </div>

      {/* Quick Actions or Recent Activity Section (Optional) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => alert('Navigate to Manage Users')} 
              className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
            >
              Manage Users
            </button>
            <button 
              onClick={() => alert('Navigate to Manage Schools')}
              className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
            >
              Manage Schools (Example)
            </button>
            <button 
              onClick={() => alert('View System Logs')}
              className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
            >
              View System Logs (Example)
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Recent Activity</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="border-l-4 border-green-500 pl-3 py-1">New user 'John Doe' registered.</li>
            <li className="border-l-4 border-blue-500 pl-3 py-1">School 'ABC High' added.</li>
            <li className="border-l-4 border-yellow-500 pl-3 py-1">Report submitted for 'XYZ Middle School'.</li>
            <li className="border-l-4 border-red-500 pl-3 py-1">User 'Jane S.' password reset request.</li>
            <li className="text-center pt-2">
                <a href="#" className="text-[#3a0ca3] hover:underline font-medium">View all activity...</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardContent;
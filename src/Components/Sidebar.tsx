import { FaHome, FaCog, FaUserFriends, FaChartBar, FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../Pages/Auth/AuthService";
import { useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [, setIsLoggedIn] = useState(false);

  const navLinkBaseClasses =
    "flex items-center gap-x-2 py-2.5 px-3 text-sm rounded-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 group focus:ring-offset-white";

  const getNavLinkClasses = ({ isActive }: { isActive: boolean }) => {
    if (isActive) {
      return `${navLinkBaseClasses} bg-[#d58e39] text-white font-semibold shadow-sm focus:ring-[#d58e39]/70`;
    }
    return `${navLinkBaseClasses} text-gray-700 hover:bg-gray-100 hover:text-[#d58e39] focus:ring-gray-300`;
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    navigate("/");
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      <div className="bg-white h-[calc(100vh-4rem)] w-56 fixed left-0 z-40 p-3 shadow-xl flex flex-col">
        <div className="mb-5 flex-shrink-0">
          <NavLink
            to="/dashboardadmin"
            className="inline-block text-xl font-bold text-gray-800 hover:text-[#d58e39] transition-colors duration-200"
          >
            <span>Anonymity</span>
          </NavLink>
        </div>

        <nav className="flex-grow overflow-y-auto pr-2">
          <ul className="space-y-1">
            <li>
              <NavLink
                to="dashboardadmin"
                className={({ isActive }) => getNavLinkClasses({ isActive })}
                end
              >
                <FaHome className="w-4 h-4 flex-shrink-0 opacity-90 group-hover:opacity-100" />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => getNavLinkClasses({ isActive })}
              >
                <FaUserFriends className="w-4 h-4 flex-shrink-0 opacity-90 group-hover:opacity-100" />
                <span>Users</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/addschool"
                className={({ isActive }) => getNavLinkClasses({ isActive })}
              >
                <FaUserFriends className="w-4 h-4 flex-shrink-0 opacity-90 group-hover:opacity-100" />
                <span>School</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/Grades"
                className={({ isActive }) => getNavLinkClasses({ isActive })}
              >
                <FaChartBar className="w-4 h-4 flex-shrink-0 opacity-90 group-hover:opacity-100" />
                <span>Grades</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => getNavLinkClasses({ isActive })}
              >
                <FaUserFriends className="w-4 h-4 flex-shrink-0 opacity-90 group-hover:opacity-100" />
                <span>Profile</span>
              </NavLink>
            </li>
            
            <li>
              <NavLink
                to="/messages"
                className={({ isActive }) => getNavLinkClasses({ isActive })}
              >
                <FaEnvelope className="w-4 h-4 flex-shrink-0 opacity-90 group-hover:opacity-100" />
                <span>Messages</span>
              </NavLink>
            </li>
            <li className="pt-4 pb-1">
              <span className="text-xs font-medium uppercase text-gray-500 tracking-wider">
                System
              </span>
            </li>
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) => getNavLinkClasses({ isActive })}
              >
                <FaCog className="w-4 h-4 flex-shrink-0 opacity-90 group-hover:opacity-100" />
                <span>Settings</span>
              </NavLink>
            </li>
            {/* Add more items here to test scrolling */}
          </ul>
        </nav>

        <div className="mt-auto pt-3 border-t border-gray-200 flex-shrink-0">
          <NavLink
            to="/profile"
            className={({ isActive }) => getNavLinkClasses({ isActive })}
          >
            <img
              src="https://via.placeholder.com/48/D58E39/FFFFFF?text=U"
              alt="User Avatar"
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
            <span>My Profile</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className={`${navLinkBaseClasses} w-full text-gray-700 hover:bg-red-500 hover:text-white focus:ring-red-300 mt-1.5`}
          >
            <FaSignOutAlt className="w-4 h-4 flex-shrink-0 opacity-90" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

import { FaHome, FaCog } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Sidebar = () => {  
  return (
    <div className="bg-black text-white h-full w-64 fixed top-16 left-0 z-40">
      <ul className="space-y-1 p-2">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 p-3 rounded-md m-1 ml-0 mr-0 ${
                isActive
                  ? "bg-[#d58e39] text-white font-semibold"
                  : "hover:bg-[#d58e39] hover:text-white"
              }`
            }
          >
            <FaHome className="text-lg" />
            <span>Dashboard</span> 
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/Setting"
            className={({ isActive }) =>
              `flex items-center gap-2 p-3 rounded-md m-1 ml-0 mr-0 ${
                isActive
                  ? "bg-[#d58e39] text-white font-semibold"
                  : "hover:bg-[#d58e39] hover:text-white"
              }`
            }
          >
            <FaCog className="text-lg" />
            <span>Settings</span> 
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
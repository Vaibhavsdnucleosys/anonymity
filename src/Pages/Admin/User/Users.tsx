import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaSyncAlt, FaAngleRight, FaAngleDoubleRight, FaAngleDoubleLeft, FaAngleLeft } from 'react-icons/fa';
import { HashLoader } from 'react-spinners';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from "../../../API/apiConfig";
import CreateUserPopup from './CreateUser'; // Import the new popup component

// Exporting types so they can be shared with other components
export interface UserFromAPI {
  id: number;
  email: string;
  userName: string;
  roleId?: number;
  name: string; // This is the Role Name
}

export interface UserCreationData {
  userName: string;
  email: string;
  password: string;
  roleId: number;
  authProvider?: string | null;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserFromAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get<UserFromAPI[]>(API_ENDPOINTS.GetAllUsers);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUserSubmit = async (newUserData: UserCreationData) => {
    // This function contains the API logic and is passed to the popup
    try {
      await axios.post(API_ENDPOINTS.AddUser, newUserData);
      toast.success("User created successfully!");
      setIsCreatePopupOpen(false);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user.");
      // Re-throwing the error allows the popup's loading state to be managed correctly
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?", text: "You won't be able to revert this!", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#d58e39", cancelButtonColor: "#000000",
      confirmButtonText: "Yes, delete it!", width: "350px",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_ENDPOINTS.User}/${id}`);
        toast.success("User deleted successfully!");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user.");
      }
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const renderPaginationButtons = () => {
    const totalPages = Math.ceil(users.length / pageSize);
    const buttonClasses = (disabled: boolean) => `p-2 bg-[#d58e39] text-white rounded-md transition text-xs sm:text-sm ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#b86807]"}`;
    return (
      <div className="flex gap-1 sm:gap-2">
        <button title="First Page" className={buttonClasses(currentPage === 1)} onClick={() => setCurrentPage(1)} disabled={currentPage === 1 || totalPages === 0}><FaAngleDoubleLeft /></button>
        <button title="Previous Page" className={buttonClasses(currentPage === 1)} onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1 || totalPages === 0}><FaAngleLeft /></button>
        <button title="Next Page" className={buttonClasses(currentPage === totalPages || totalPages === 0)} onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || totalPages === 0}><FaAngleRight /></button>
        <button title="Last Page" className={buttonClasses(currentPage === totalPages || totalPages === 0)} onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}><FaAngleDoubleRight /></button>
      </div>
    );
  };

  const totalPages = Math.ceil(users.length / pageSize);
  const currentRecords = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex-1 p-4 bg-gray-100 relative">
      <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-md mb-4">
        <h3 className="text-xl font-semibold">Manage Users</h3>
        <div className="flex items-center gap-2">
          <button onClick={fetchUsers} className="p-2 bg-[#d58e39] text-white rounded-md hover:bg-[#b86807] transition-colors" disabled={loading}><FaSyncAlt className={loading ? "animate-spin" : ""} /></button>
          <button onClick={() => setIsCreatePopupOpen(true)} className="px-4 py-2 bg-[#d58e39] text-white rounded-md hover:bg-[#b86807] transition-colors">Create New</button>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 shadow-md rounded-md overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-22rem)] sm:max-h-[calc(100vh-20rem)] border border-gray-200 rounded-md">
          <table className="w-full min-w-[600px]">
            <thead className="bg-[#d58e39] text-white sticky top-0 z-10 text-sm">
              <tr>
                <th className="p-2 sm:p-3 text-left">Sr.</th>
                <th className="p-2 sm:p-3 text-left">Username</th>
                <th className="p-2 sm:p-3 text-left">Email</th>
                <th className="p-2 sm:p-3 text-left">Role</th>
                <th className="p-2 sm:p-3 text-center">Action</th>
              </tr>
            </thead>
            {loading ? (
              <tbody><tr><td colSpan={5} className="text-center py-10"><div className="flex flex-col justify-center items-center"><HashLoader color="#d58e39" size={40} /><p className="mt-3 text-gray-600">Loading Users...</p></div></td></tr></tbody>
            ) : users.length === 0 ? (
              <tbody><tr><td colSpan={5} className="text-center py-10 text-gray-500">No Users Found</td></tr></tbody>
            ) : (
              <tbody className="text-sm text-gray-700">
                {currentRecords.map((item, index) => (
                  <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-2 sm:p-3">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="p-2 sm:p-3">{item.userName}</td>
                    <td className="p-2 sm:p-3">{item.email}</td>
                    <td className="p-2 sm:p-3">{item.name}</td>
                    <td className="p-2 sm:p-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <button title="Delete User" className="text-gray-500 hover:text-red-600 p-1" onClick={() => handleDelete(item.id)}><FaTrash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {!loading && users.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 mt-4 bg-white rounded-md shadow-md text-sm">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <label htmlFor="entries" className="text-gray-700">Rows:</label>
            <select id="entries" className="border border-gray-300 rounded-md px-2 py-1" value={pageSize} onChange={handlePageSizeChange}>
              <option value={5}>5</option><option value={10}>10</option><option value={15}>15</option><option value={25}>25</option>
            </select>
          </div>
          <span className="text-gray-700 mb-2 sm:mb-0">Page {totalPages > 0 ? currentPage : 0} of {totalPages} (Total: {users.length} users)</span>
          {renderPaginationButtons()}
        </div>
      )}

      {/* Renders the imported popup component */}
      <CreateUserPopup
        isOpen={isCreatePopupOpen}
        onClose={() => setIsCreatePopupOpen(false)}
        onSubmit={handleCreateUserSubmit}
      />
    </div>
  );
};

export default UsersPage;
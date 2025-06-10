// src/Pages/Admin/Grade/GradesPage.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaSyncAlt, FaEdit, FaAngleRight, FaAngleDoubleRight, FaAngleDoubleLeft, FaAngleLeft } from 'react-icons/fa';
import { HashLoader } from 'react-spinners';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { API_ENDPOINTS } from "../../../API/apiConfig";
import CreateGradePopup from './CreateGradePopup'; // Import create popup
import EditGrade from './EditGrade'; // Import edit popup

// Data structure for a Grade, matching your API response
export interface Grade {
  id: number;
  gradeLevel: string;
  isDeleted: boolean;
}

// Data structure for creating a new Grade
export interface GradeCreationData {
  gradeLevel: string;
}

const GradesPage: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Grade[]>(API_ENDPOINTS.GetAllGrades);
      // Assuming the API returns all grades including soft-deleted ones
      setGrades(response.data.filter(g => !g.isDeleted));
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to fetch grades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleCreateGradeSubmit = async (newGradeData: GradeCreationData) => {
    try {
      await axios.post(API_ENDPOINTS.AddGrade, newGradeData);
      toast.success("Grade created successfully!");
      setIsCreatePopupOpen(false);
      fetchGrades();
    } catch (error) {
      console.error("Error creating grade:", error);
      toast.error("Failed to create grade.");
      throw error;
    }
  };
  
  const handleUpdateGradeSubmit = async (updatedGradeData: Grade) => {
    try {
      await axios.put(`${API_ENDPOINTS.UpdateGrade}/${updatedGradeData.id}`, updatedGradeData);
      toast.success("Grade updated successfully!");
      setIsEditPopupOpen(false);
      setEditingGradeId(null);
      fetchGrades();
    } catch (error) {
      console.error("Error updating grade:", error);
      toast.error("Failed to update grade.");
    }
  };


  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?", text: "This will soft-delete the grade.", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#d58e39", cancelButtonColor: "#000000",
      confirmButtonText: "Yes, delete it!", width: "350px",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_ENDPOINTS.DeleteGrade}/${id}`);
        toast.success("Grade soft-deleted successfully!");
        fetchGrades();
      } catch (error) {
        console.error("Error deleting grade:", error);
        toast.error("Failed to delete grade.");
      }
    }
  };
  
  const handleEditClick = (id: number) => {
    setEditingGradeId(id);
    setIsEditPopupOpen(true);
  };


  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const renderPaginationButtons = () => {
    const totalPages = Math.ceil(grades.length / pageSize);
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

  const totalPages = Math.ceil(grades.length / pageSize);
  const currentRecords = grades.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex-1 p-4 bg-gray-100 relative">
      <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-md mb-4">
        <h3 className="text-xl font-semibold">Manage Grades</h3>
        <div className="flex items-center gap-2">
          <button onClick={fetchGrades} className="p-2 bg-[#d58e39] text-white rounded-md hover:bg-[#b86807] transition-colors" disabled={loading}><FaSyncAlt className={loading ? "animate-spin" : ""} /></button>
          <button onClick={() => setIsCreatePopupOpen(true)} className="px-4 py-2 bg-[#d58e39] text-white rounded-md hover:bg-[#b86807] transition-colors">Create New</button>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 shadow-md rounded-md overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-22rem)] sm:max-h-[calc(100vh-20rem)] border border-gray-200 rounded-md">
          <table className="w-full min-w-[500px]">
            <thead className="bg-[#d58e39] text-white sticky top-0 z-10 text-sm">
              <tr>
                <th className="p-2 sm:p-3 text-left w-16">Sr.</th>
                <th className="p-2 sm:p-3 text-left">Grade Level</th>
                <th className="p-2 sm:p-3 text-center w-32">Action</th>
              </tr>
            </thead>
            {loading ? (
              <tbody><tr><td colSpan={3} className="text-center py-10"><div className="flex flex-col justify-center items-center"><HashLoader color="#d58e39" size={40} /><p className="mt-3 text-gray-600">Loading Grades...</p></div></td></tr></tbody>
            ) : grades.length === 0 ? (
              <tbody><tr><td colSpan={3} className="text-center py-10 text-gray-500">No Grades Found</td></tr></tbody>
            ) : (
              <tbody className="text-sm text-gray-700">
                {currentRecords.map((item, index) => (
                  <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-2 sm:p-3">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="p-2 sm:p-3">{item.gradeLevel}</td>
                    <td className="p-2 sm:p-3 text-center">
                      <div className="flex justify-center space-x-2">
                         <button title="Edit Grade" className="text-gray-500 hover:text-blue-600 p-1" onClick={() => handleEditClick(item.id)}><FaEdit size={16} /></button>
                        <button title="Delete Grade" className="text-gray-500 hover:text-red-600 p-1" onClick={() => handleDelete(item.id)}><FaTrash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {!loading && grades.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 mt-4 bg-white rounded-md shadow-md text-sm">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <label htmlFor="entries" className="text-gray-700">Rows:</label>
            <select id="entries" className="border border-gray-300 rounded-md px-2 py-1" value={pageSize} onChange={handlePageSizeChange}>
              <option value={5}>5</option><option value={10}>10</option><option value={15}>15</option><option value={25}>25</option>
            </select>
          </div>
          <span className="text-gray-700 mb-2 sm:mb-0">Page {totalPages > 0 ? currentPage : 0} of {totalPages} (Total: {grades.length} grades)</span>
          {renderPaginationButtons()}
        </div>
      )}

      <CreateGradePopup
        isOpen={isCreatePopupOpen}
        onClose={() => setIsCreatePopupOpen(false)}
        onSubmit={handleCreateGradeSubmit}
      />
      
      {editingGradeId && (
        <EditGrade
          id={editingGradeId}
          onClose={() => {
            setIsEditPopupOpen(false);
            setEditingGradeId(null);
          }}
          onSubmit={handleUpdateGradeSubmit}
        />
      )}
    </div>
  );
};

export default GradesPage;
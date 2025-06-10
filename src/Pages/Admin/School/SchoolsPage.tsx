// SchoolsPage.tsx - CORRECTED

import React, { useState, useEffect } from 'react';
import { FaTrash, FaSyncAlt, FaAngleRight, FaAngleDoubleRight, FaAngleDoubleLeft, FaAngleLeft, FaEdit } from 'react-icons/fa';
import { HashLoader } from 'react-spinners';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import AddSchoolPopup from './AddSchools'; 
import EditSchoolPopup from './EditSchool'; 
import { API_ENDPOINTS } from "../../../API/apiConfig";

// --- Type Definitions ---
export interface SchoolCreationData {
  name: string;
  address: string;
  country: number | string;
  state: number | string;
  city: number | string;
}

// FIX 1: The interface now matches the property names from your backend's JSON response.
export interface SchoolFromAPI {
  id: number;
  schoolName: string; // <-- FIX: Changed from 'name'
  address: string;
  countryName: string;
  stateName: string;
  cityName: string;
}

interface SchoolForEdit {
    id: number;
    name: string;
    address: string;
    country: string;
    state: string;
    city: string;
}


const SchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<SchoolFromAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddSchoolPopupOpen, setIsAddSchoolPopupOpen] = useState(false);
  const [isEditSchoolPopupOpen, setIsEditSchoolPopupOpen] = useState(false);
  const [schoolToEdit, setSchoolToEdit] = useState<SchoolForEdit | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GetAllSchools);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: SchoolFromAPI[] = await response.json();
      setSchools(data);
    } catch (error) {
      console.error("Failed to fetch schools:", error);
      toast.error("Could not load schools from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleAddSchoolSubmit = async (newSchoolData: SchoolCreationData) => {
    const payload = {
      SchoolName: newSchoolData.name,
      Address: newSchoolData.address,
      CountryId: newSchoolData.country,
      StateId: newSchoolData.state,
      CityId: newSchoolData.city,
    };

    const promise = fetch(API_ENDPOINTS.AddSchool, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(async response => {
      if (!response.ok) {
        try {
          const errData = await response.json();
          const errorMessages = Object.values(errData.errors).flat().join(' ');
          throw new Error(errorMessages || 'Failed to add school.');
        } catch {
          throw new Error('Failed to add school and could not parse error response.');
        }
      }
      return response;
    });

    toast.promise(promise, {
      loading: 'Adding school...',
      success: () => {
        setIsAddSchoolPopupOpen(false);
        fetchSchools(); 
        return "School added successfully!";
      },
      error: (err) => err.message,
    });
  };

  const handleOpenEditPopup = (school: SchoolFromAPI) => {
    // FIX 3: Use the correct property 'schoolName' when creating the object for the edit popup.
    const schoolForEdit: SchoolForEdit = {
      id: school.id,
      name: school.schoolName, // <-- FIX: Changed from 'school.name'
      address: school.address,
      country: school.countryName,
      state: school.stateName,
      city: school.cityName
    };
    setSchoolToEdit(schoolForEdit);
    setIsEditSchoolPopupOpen(true);
  };

  const handleEditSchoolSubmit = async (updatedData: SchoolCreationData, id: number) => {
    const payload = {
      Id: id,
      SchoolName: updatedData.name,
      Address: updatedData.address,
      CountryId: updatedData.country,
      StateId: updatedData.state,
      CityId: updatedData.city,
    };

    const promise = fetch(`${API_ENDPOINTS.School}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to update school.');
        }
    });

    toast.promise(promise, {
      loading: 'Updating school...',
      success: () => {
        setIsEditSchoolPopupOpen(false);
        fetchSchools(); 
        return "School updated successfully!";
      },
      error: (err) => err.message,
    });
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
        title: "Are you sure?", text: "This will be removed from the list.", icon: "warning",
        showCancelButton: true, confirmButtonColor: "#d58e39", cancelButtonColor: "#000000",
        confirmButtonText: "Yes, delete it!", width: "350px",
    });

    if (result.isConfirmed) {
        const promise = fetch(`${API_ENDPOINTS.School}/${id}`, {
            method: 'DELETE'
        }).then(response => {
            if(!response.ok) {
                throw new Error('Failed to delete the school.');
            }
        });

        toast.promise(promise, {
            loading: 'Deleting school...',
            success: () => {
                fetchSchools(); 
                return "School deleted successfully!";
            },
            error: (err) => err.message,
        });
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const renderPaginationButtons = () => {
    const totalPages = Math.ceil(schools.length / pageSize);
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

  const totalPages = Math.ceil(schools.length / pageSize);
  const currentRecords = schools.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex-1 p-4 bg-gray-100 relative">
      <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-md mb-4">
        <h3 className="text-xl font-semibold">Manage Schools</h3>
        <div className="flex items-center gap-2">
          <button onClick={fetchSchools} className="p-2 bg-[#d58e39] text-white rounded-md hover:bg-[#b86807] transition-colors" disabled={loading}><FaSyncAlt className={loading ? "animate-spin" : ""} /></button>
          <button onClick={() => setIsAddSchoolPopupOpen(true)} className="px-4 py-2 bg-[#d58e39] text-white rounded-md hover:bg-[#b86807] transition-colors">Add School</button>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 shadow-md rounded-md overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-22rem)] sm:max-h-[calc(100vh-20rem)] border border-gray-200 rounded-md">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#d58e39] text-white sticky top-0 z-10 text-sm">
              <tr>
                <th className="p-2 sm:p-3 text-left">Sr.</th>
                <th className="p-2 sm:p-3 text-left">School Name</th>
                <th className="p-2 sm:p-3 text-left">Address</th>
                <th className="p-2 sm:p-3 text-left">City</th>
                <th className="p-2 sm:p-3 text-left">State</th>
                <th className="p-2 sm:p-3 text-left">Country</th>
                <th className="p-2 sm:p-3 text-center">Action</th>
              </tr>
            </thead>
            {loading ? (
              <tbody><tr><td colSpan={7} className="text-center py-10"><div className="flex flex-col justify-center items-center"><HashLoader color="#d58e39" size={40} /><p className="mt-3 text-gray-600">Loading Schools...</p></div></td></tr></tbody>
            ) : schools.length === 0 ? (
              <tbody><tr><td colSpan={7} className="text-center py-10 text-gray-500">No Schools Found</td></tr></tbody>
            ) : (
              <tbody className="text-sm text-gray-700">
                {currentRecords.map((school, index) => (
                  <tr key={school.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-2 sm:p-3">{(currentPage - 1) * pageSize + index + 1}</td>
                    {/* FIX 2: Use the correct property 'schoolName' to display in the table */}
                    <td className="p-2 sm:p-3 font-medium">{school.schoolName}</td>
                    <td className="p-2 sm:p-3">{school.address}</td>
                    <td className="p-2 sm:p-3">{school.cityName}</td>
                    <td className="p-2 sm:p-3">{school.stateName}</td>
                    <td className="p-2 sm:p-3">{school.countryName}</td>
                    <td className="p-2 sm:p-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button title="Edit School" className="text-gray-500 hover:text-blue-600 p-1" onClick={() => handleOpenEditPopup(school)}><FaEdit size={16} /></button>
                        <button title="Delete School" className="text-gray-500 hover:text-red-600 p-1" onClick={() => handleDelete(school.id)}><FaTrash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {!loading && schools.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 mt-4 bg-white rounded-md shadow-md text-sm">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <label htmlFor="entries" className="text-gray-700">Rows:</label>
            <select id="entries" className="border border-gray-300 rounded-md px-2 py-1" value={pageSize} onChange={handlePageSizeChange}>
              <option value={5}>5</option><option value={10}>10</option><option value={15}>15</option>
            </select>
          </div>
          <span className="text-gray-700 mb-2 sm:mb-0">Page {totalPages > 0 ? currentPage : 0} of {totalPages} (Total: {schools.length} schools)</span>
          {renderPaginationButtons()}
        </div>
      )}

      {isAddSchoolPopupOpen && (
        <AddSchoolPopup
          isOpen={isAddSchoolPopupOpen}
          onClose={() => setIsAddSchoolPopupOpen(false)}
          onSubmit={handleAddSchoolSubmit}
        />
      )}
      
      {isEditSchoolPopupOpen && schoolToEdit && (
        <EditSchoolPopup
            isOpen={isEditSchoolPopupOpen}
            onClose={() => setIsEditSchoolPopupOpen(false)}
            onSubmit={handleEditSchoolSubmit}
            initialData={schoolToEdit}
        />
      )}
    </div>
  );
};

export default SchoolsPage;
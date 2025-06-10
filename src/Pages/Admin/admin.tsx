// src/Pages/Admin/admin.tsx
import React from "react";
import Sidebar from "../../Components/Sidebar"; 
import Navbar from "../../Components/Navbar";   
import { Outlet } from "react-router-dom";

const AdminLayout: React.FC = () => {
    // Navbar height is assumed to be h-16 (4rem or 64px)
    // Sidebar width is assumed to be w-56 (14rem or 224px)

    return (
        <>
            <style>{`
                .admin-layout-container a, 
                .admin-layout-container .sidebar-container a {
                    color: rgb(58 12 163);
                    text-decoration: underline;
                }
                .admin-layout-container a:hover,
                .admin-layout-container .sidebar-container a:hover {
                   color: #2c077a;
                }
                /* .admin-layout-container .sidebar-container a:hover {
                   background-color: #e2dff7; 
                } */
                .admin-layout-container .active-nav-link,
                .admin-layout-container .sidebar-container .active-nav-link {
                    color: white !important; 
                    text-decoration: none !important;
                }
            `}</style>

            <div className="relative flex flex-col h-screen bg-gray-100 admin-layout-container">
                {/* Navbar at the top, full width */}
                {/* Navbar.tsx should have sticky top-0 z-50 and a fixed height e.g., h-16 */}
                <Navbar /> 

                {/* Container for Sidebar and Main Content, below Navbar */}
                <div className="flex flex-1 overflow-hidden"> {/* pt-16 काढले, कारण Navbar स्वतः जागा घेईल */}
                    {/* Sidebar is fixed to the left, starting below the Navbar */}
                    {/* Sidebar.tsx needs to be `fixed top-16 left-0 w-56 h-[calc(100vh-4rem)] z-40` */}
                    <Sidebar />

                    {/* Main content area, to the right of the sidebar */}
                    {/* It needs a margin-left equal to the sidebar's width */}
                    <main className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8 ml-56"> {/* <<<< ml-56 ADDED HERE */}
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
};
export default AdminLayout;
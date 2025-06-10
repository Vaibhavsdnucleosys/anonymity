import React from "react"; // No need for 'type' keyword here for default import
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";

// Page Imports
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import ResetPasswordPage from "./Pages/Auth/ResetPasswordPage"; // <-- IMPORT THE NEW PAGE

import Dashboard from "./Pages/Dashboard/Dashboard";
import Home from "./Pages/Dashboard/Home";
import BrowseSchools from "./Pages/Schoolsforuser/BrowseSchools"; // Assuming this is correct placement
import Profile from "./Pages/Users/profile";

import AdminLayout from "./Pages/Admin/admin";
import UsersPage from "./Pages/Admin/User/Users";
import AdminDashboardContent from "./Pages/Admin/dashboardofadmin/dashboardadmin";
import WriteReview from "./Pages/Schoolsforuser/WriteReview";
import AddSchool from "./Pages/Admin/School/SchoolsPage";
import SchoolsPage from "./Pages/Admin/School/SchoolsPage";
import GradesPage from "./Pages/Admin/Grade/GradesPage";


const App: React.FC = () => {
  useEffect(() => {
    const handleTabCloseLogout = () => {
      // This logic attempts to clear session on tab close, but it's not perfectly reliable across all browsers.
      // `beforeunload` + `unload` is a common approach but has limitations.
      if (!sessionStorage.getItem("isRefreshing")) {
        console.log("Tab closed or navigated away, clearing session storage (if not refreshing).");
        sessionStorage.removeItem("user"); // If you store user object separately
        sessionStorage.removeItem("token");
      }
    };

    const markPageRefresh = (event: BeforeUnloadEvent) => {
      // Set flag only if it's a refresh/navigation away, not just closing
      // However, distinguishing true close from navigation is tricky.
      sessionStorage.setItem("isRefreshing", "true");
    };

    const clearRefreshFlag = () => {
      sessionStorage.removeItem("isRefreshing");
    };

    window.addEventListener("beforeunload", markPageRefresh);
    // 'unload' is less reliable for this, but it's a common pattern.
    // Consider if this specific session clearing logic is critical or if relying on token expiry is sufficient.
    window.addEventListener("unload", handleTabCloseLogout);
    window.addEventListener("load", clearRefreshFlag); // Clear flag on new page load

    // Initial clear on component mount in case the flag was left from a previous session/crash
    clearRefreshFlag();


    return () => {
      window.removeEventListener("beforeunload", markPageRefresh);
      window.removeEventListener("unload", handleTabCloseLogout);
      window.removeEventListener("load", clearRefreshFlag);
    };
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Dashboard />,
      children: [
        {
          index: true,
          element: <Home />
        },
        {
          path: "/profile", // Keeping as a top-level route as per your existing structure
          element: <Profile />,
        },
        {
      path: "/write-review", // Keeping as a top-level route
      element: <WriteReview />,
    },

        // Example: If Profile should be under Dashboard layout and accessible via /profile
        // {
        //   path: "profile", // becomes /profile
        //   element: <Profile />,
        // },
        // Example: If BrowseSchools should be under Dashboard layout
        // {
        //   path: "browse-schools", // becomes /browse-schools
        //   element: <BrowseSchools />,
        // }
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/reset-password", // <-- ADDED ROUTE FOR RESET PASSWORD PAGE
      element: <ResetPasswordPage />,
    },
    {
      path: "/profile", // Keeping as a top-level route as per your existing structure
      element: <Profile />,
    },
    {
      path: "/BrowseSchools", // Keeping as a top-level route
      element: <BrowseSchools />,
    },
     

    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        {
          index: true, // Default child for "/admin", often the dashboard
          element: <AdminDashboardContent />
        },
        {
          path: "users",
          element: <UsersPage />
        },
      
        
        {
          path: "dashboardadmin", // This path might be redundant if AdminDashboardContent is the index.
          // Or it's a specific different dashboard accessible at /admin/dashboardadmin
          element: <AdminDashboardContent />
        },
        {
          path: "addschool",
          element: <SchoolsPage />
        },
          {
          path: "AddSchoolpage",
          element: <AddSchool />
        },
          {
          path: "Grades",
          element: <GradesPage />
        },
      ]
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
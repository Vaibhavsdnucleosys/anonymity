// import React from "react"; // No need for 'type' keyword here for default import
// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import { useEffect } from "react";

// // Page Imports
// import Login from "./Pages/Auth/Login";
// import Register from "./Pages/Auth/Register";
// import ResetPasswordPage from "./Pages/Auth/ResetPasswordPage"; // <-- IMPORT THE NEW PAGE

// import Dashboard from "./Pages/Dashboard/Dashboard";
// import Home from "./Pages/Dashboard/Home";
// import BrowseSchools from "./Pages/Schoolsforuser/BrowseSchools"; // Assuming this is correct placement
// import Profile from "./Pages/Users/profile";

// import AdminLayout from "./Pages/Admin/admin";
// import UsersPage from "./Pages/Admin/User/Users";
// import AdminDashboardContent from "./Pages/Admin/dashboardofadmin/dashboardadmin";
// import WriteReview from "./Pages/Schoolsforuser/WriteReview";
// import AddSchool from "./Pages/Admin/School/SchoolsPage";
// import SchoolsPage from "./Pages/Admin/School/SchoolsPage";
// import GradesPage from "./Pages/Admin/Grade/GradesPage";
// import SchoolDetails from "./Pages/Schoolsforuser/SchoolDetails";
// import FullReportPage from "./Pages/Schoolsforuser/FullReportPage";


// const App: React.FC = () => {
//   useEffect(() => {
//     const handleTabCloseLogout = () => {
//       if (!sessionStorage.getItem("isRefreshing")) {
//         console.log("Tab closed or navigated away, clearing session storage (if not refreshing).");
//         sessionStorage.removeItem("user");
//         sessionStorage.removeItem("token");
//       }
//     };

//     const markPageRefresh = () => {
//       sessionStorage.setItem("isRefreshing", "true");
//     };

//     const clearRefreshFlag = () => {
//       sessionStorage.removeItem("isRefreshing");
//     };

//     window.addEventListener("beforeunload", markPageRefresh);
//     // 'unload' is less reliable for this, but it's a common pattern.
//     // Consider if this specific session clearing logic is critical or if relying on token expiry is sufficient.
//     window.addEventListener("unload", handleTabCloseLogout);
//     window.addEventListener("load", clearRefreshFlag); // Clear flag on new page load

//     // Initial clear on component mount in case the flag was left from a previous session/crash
//     clearRefreshFlag();


//     return () => {
//       window.removeEventListener("beforeunload", markPageRefresh);
//       window.removeEventListener("unload", handleTabCloseLogout);
//       window.removeEventListener("load", clearRefreshFlag);
//     };
//   }, []);

//   const router = createBrowserRouter([
//     {
//       path: "/",
//       element: <Dashboard />,
//       children: [
//         {
//           index: true,
//           element: <Home />
//         },
//         {
//           path: "/profile", // Keeping as a top-level route as per your existing structure
//           element: <Profile />,
//         },
//         {
//           path: "/write-review", // Keeping as a top-level route
//           element: <WriteReview />,
//         },
//         {
//           path: "/schools/:schoolId", // <-- 3. ADDED THE NEW DETAILS ROUTE HERE
//           element: <SchoolDetails />,
//         },
//         {
//           path: "/report/:reviewId", // <-- 3. ADDED THE NEW DETAILS ROUTE HERE
//           element: <FullReportPage />,
//         },


//         // Example: If Profile should be under Dashboard layout and accessible via /profile
//         // {
//         //   path: "profile", // becomes /profile
//         //   element: <Profile />,
//         // },
//         // Example: If BrowseSchools should be under Dashboard layout
//         // {
//         //   path: "browse-schools", // becomes /browse-schools
//         //   element: <BrowseSchools />,
//         // }
//       ],
//     },
//     {
//       path: "/login",
//       element: <Login />,
//     },
//     {
//       path: "/register",
//       element: <Register />,
//     },
//     {
//       path: "/reset-password", // <-- ADDED ROUTE FOR RESET PASSWORD PAGE
//       element: <ResetPasswordPage />,
//     },
//     {
//       path: "/profile", // Keeping as a top-level route as per your existing structure
//       element: <Profile />,
//     },
//     {
//       path: "/BrowseSchools", // Keeping as a top-level route
//       element: <BrowseSchools />,
//     },



//     {
//       path: "/admin",
//       element: <AdminLayout />,
//       children: [
//         {
//           index: true, // Default child for "/admin", often the dashboard
//           element: <AdminDashboardContent />
//         },
//         {
//           path: "users",
//           element: <UsersPage />
//         },


//         {
//           path: "dashboardadmin", // This path might be redundant if AdminDashboardContent is the index.
//           // Or it's a specific different dashboard accessible at /admin/dashboardadmin
//           element: <AdminDashboardContent />
//         },
//         {
//           path: "addschool",
//           element: <SchoolsPage />
//         },
//         {
//           path: "AddSchoolpage",
//           element: <AddSchool />
//         },
//         {
//           path: "Grades",
//           element: <GradesPage />
//         },
//       ]
//     },
//   ]);

//   return <RouterProvider router={router} />;
// };

// export default App;
import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";

// Page Imports
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import ResetPasswordPage from "./Pages/Auth/ResetPasswordPage";

import Dashboard from "./Pages/Dashboard/Dashboard";
import Home from "./Pages/Dashboard/Home";
import BrowseSchools from "./Pages/Schoolsforuser/BrowseSchools";
import Profile from "./Pages/Users/profile";

import AdminLayout from "./Pages/Admin/admin";
import UsersPage from "./Pages/Admin/User/Users";
import AdminDashboardContent from "./Pages/Admin/dashboardofadmin/dashboardadmin";
import WriteReview from "./Pages/Schoolsforuser/WriteReview";
import AddSchool from "./Pages/Admin/School/SchoolsPage";
import SchoolsPage from "./Pages/Admin/School/SchoolsPage";
import GradesPage from "./Pages/Admin/Grade/GradesPage";
import SchoolDetails from "./Pages/Schoolsforuser/SchoolDetails";
import FullReportPage from "./Pages/Schoolsforuser/FullReportPage";

// <<< STEP 1: CREATE THE SCROLL-TO-TOP WRAPPER COMPONENT >>>
// This component will wrap your main layouts and handle scrolling.
const ScrollToTopWrapper = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // <Outlet /> renders the nested child routes.
  return <Outlet />;
};


const App: React.FC = () => {
  // Your session management useEffect hook (this is fine and unrelated to the scroll issue)
  useEffect(() => {
    const handleTabCloseLogout = () => {
      if (!sessionStorage.getItem("isRefreshing")) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      }
    };
    const markPageRefresh = () => {
      sessionStorage.setItem("isRefreshing", "true");
    };
    const clearRefreshFlag = () => {
      sessionStorage.removeItem("isRefreshing");
    };
    window.addEventListener("beforeunload", markPageRefresh);
    window.addEventListener("unload", handleTabCloseLogout);
    window.addEventListener("load", clearRefreshFlag);
    clearRefreshFlag();
    return () => {
      window.removeEventListener("beforeunload", markPageRefresh);
      window.removeEventListener("unload", handleTabCloseLogout);
      window.removeEventListener("load", clearRefreshFlag);
    };
  }, []);

  // <<< STEP 2: APPLY THE WRAPPER TO YOUR LAYOUTS >>>
  const router = createBrowserRouter([
    {
      path: "/",
      // Use the Dashboard component which contains your main layout (nav, footer, etc.)
      element: <Dashboard />,
      // Wrap all children in the scroll-to-top logic
      children: [
        {
          // The wrapper will now control the rendering of all nested routes
          element: <ScrollToTopWrapper />, 
          children: [
            {
              index: true,
              element: <Home />
            },
            {
              path: "/profile",
              element: <Profile />,
            },
            {
              path: "/write-review",
              element: <WriteReview />,
            },
            {
              path: "/schools/:schoolId",
              element: <SchoolDetails />,
            },
            {
              path: "/report/:reviewId",
              element: <FullReportPage />,
            },
             {
              path: "/BrowseSchools", 
              element: <BrowseSchools />,
            },
          ]
        }
      ],
    },
    // Routes without the main dashboard layout don't need the wrapper unless they also have this issue.
    // Login, Register, etc., are usually simple enough not to need it.
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/reset-password",
      element: <ResetPasswordPage />,
    },
    
    // Your Admin routes, which have their own layout
    {
      path: "/admin",
      element: <AdminLayout />,
      // You can apply the same wrapper pattern here if needed!
      children: [
        {
          element: <ScrollToTopWrapper />,
          children: [
            {
              index: true,
              element: <AdminDashboardContent />
            },
            {
              path: "users",
              element: <UsersPage />
            },
            {
              path: "dashboardadmin",
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
        }
      ]
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
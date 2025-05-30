import type React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Home from "./Pages/Dashboard/Home";

const App: React.FC = () => {
  useEffect(() => {
    const handleTabCloseLogout = () => {
      if (!sessionStorage.getItem("isRefreshing")) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    };

    const markPageRefresh = () => {
      sessionStorage.setItem("isRefreshing", "true");
    };

    window.addEventListener("beforeunload", markPageRefresh);
    window.addEventListener("unload", handleTabCloseLogout);
    window.addEventListener("load", () =>
      sessionStorage.removeItem("isRefreshing")
    );

    return () => {
      window.removeEventListener("beforeunload", markPageRefresh);
      window.removeEventListener("unload", handleTabCloseLogout);
    };
  }, []);
   const router = createBrowserRouter([
    {
      path: "/",
      // element:<ProtectedRoute><Dashboard /></ProtectedRoute>,
       element:<Dashboard />,
      children: [
       { path: "", element: <Home /> },
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
  ]);
  return <RouterProvider router={router} />;
};
export default App;

// // import React, { useState } from 'react'
// // import Sidebar from '../../Components/Sidebar';
// // import Navbar from '../../Components/Navbar';
// // import { Outlet } from 'react-router-dom';

// // const Dashboard: React.FC = () => {
// //     const [isSidebarOpen, setIsSidebarOpen] = useState(true);

// //   return (
// //     <div className="flex h-screen">
// //       <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
// //       <div className={`flex-1 transition-all ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
// //         <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
// //         <div className="p-6 overflow-auto h-[calc(100vh-64px)]">
// //           <Outlet />
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// // export default Dashboard
// import React from 'react';
// import Sidebar from '../../Components/Sidebar';
// import Navbar from '../../Components/Navbar';
// import { Outlet } from 'react-router-dom';

// const Dashboard: React.FC = () => {
//   return (
//     <div className="flex flex-col h-screen">
      
//       <Navbar />
      
//       <div className="flex-1 overflow-auto ml-64"> 
//           <div className="p-6">
//             <Outlet />
//           </div>
//         </div>
//       {/* <div className="flex flex-1 overflow-hidden pt-16"> 
//         <Sidebar />
        
//         <div className="flex-1 overflow-auto ml-64"> 
//           <div className="p-6">
//             <Outlet />
//           </div>
//         </div>
//       </div> */}

//     </div>
//   );
// };

// export default Dashboard;
import React from 'react';
import Navbar from '../../Components/Navbar';
import { Outlet } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

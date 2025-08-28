import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from '../Dashboard/Header';
import Sidebar from '../Sidebar/Sidebar';
import CandidateTable from '../Candidates/CandidateTable';
import UploadDocuments from '../Dashboard/UploadDocuments';
import React, { useRef,useEffect, useState } from "react";
import ResponseTable from "../Dashboard/ResponseTable";
import AdminDashboard from "../ProfileSection/AdminDashboard";
import AdminUserDetail from "../ProfileSection/AdminUserDetail"; // Add this import
import UserProfile from "../ProfileSection/UserProfile";



function Dashboard({ onLogout }) {
  const [resumeData, setResumeData] = useState([]); // State to store resume data
  const [responseData, setResponseData] = useState(null); // State to store API response data

  // Update ResponseData based on filtered results or processing
  const updateCandidatesData = (newData) => {
  setResponseData(newData);
  };
  return (
    <div className="d-flex min-vh-100">
      
      <div className="flex-grow-1 d-flex flex-column">
        <Header />
        
        <div className="flex-grow-1 bg-light">
          <Routes>
            <Route path="candidates" element={<CandidateTable 
              data={resumeData} 
              updateCandidatesData={updateCandidatesData} 
            /> } />
            <Route path="upload" element={<UploadDocuments setResponseData={setResponseData}/>} />
            <Route path="response"element= {responseData && (<ResponseTable data={responseData.results}duplicateCount={responseData.duplicateCount} 
            />
            
          )}/>
     


             <Route path="admin/*" element={<AdminDashboard />} />
            <Route path="admin/users/:id" element={<AdminUserDetail />} /> {/* Add this route */}

             <Route path="user" element={<UserProfile />} />
            
           
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


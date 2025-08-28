import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faSearch,
  faBell,
  faGear,
  faFilter,
  faSort,
  faRotateLeft,
  faUpload,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import { axiosInstance } from "../../axiosUtils";

function Header({ onResponseSubmit }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [responseInput, setResponseInput] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/user', { withCredentials: true });
        setUser(res.data.user);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };
    fetchUser();
  }, []);

  if (!user) return <div>Loading...</div>;

  const handleResponseSubmit = (e) => {
    e.preventDefault();
    if (responseInput.trim()) {
      onResponseSubmit(responseInput);
      setResponseInput("");
    }
  };

  return (
    <div className="dashboard-header align-items-center">
      <div className="d-flex flex-column w-100">
        {/* Top purple header */}
        <div
     className="px-4 py-3 d-flex align-items-center justify-content-between position-relative"
         style={{ backgroundColor: 'rgb(63 51 196 / 31%)' }}
        >
               {/* Left side empty placeholder if needed */}
      <div className="d-flex" style={{ width: '200px' }}></div>

      {/* Centered Navigation Links */}
      <div
        className="d-flex gap-3 position-absolute start-50 translate-middle-x"
        style={{ zIndex: 1 }}
      >

            <Link
              to="/dashboard/candidates"
                className={`btn fw-medium shadow-sm px-3 py-2 rounded-pill ${currentPath === "/dashboard/candidates" ? "active-nav" : "inactive-nav"}`}
           style={{
           backgroundColor: "rgb(125 117 221 / 46%)",
            color: "black",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
          }}
          >
             Talent Workspace
            </Link>
            <Link
              to="/dashboard/response"
                  className={`btn fw-medium shadow-sm px-3 py-2 rounded-pill ${currentPath === "/dashboard/response" ? "active-nav" : "inactive-nav"}`}
               style={{
             backgroundColor: "rgb(125 117 221 / 46%)",
              color: "black",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
            }}
                    >
             Evaluation Results
            </Link>
            <Link
              to="/dashboard/upload"
                className={`btn fw-medium shadow-sm px-3 py-2 rounded-pill${currentPath === "/dashboard/upload" ? "active-nav" : "inactive-nav"}`}
               style={{
            backgroundColor: "rgb(125 117 221 / 46%)",
            color: "black",
            boxShadow: "1px 1px 3px rgb(0, 0, 0)",
          }}
            >
              AI Matching 
            </Link>


          </div>
          
          
          {/* Profile Section - Pushed to right */}
          <div className="d-flex justify-content-end">
            <Link
              to={user.isAdmin ? "/dashboard/admin" : "/dashboard/user"}
              className="btn btn-light d-flex align-items-center px-3 py-2"
              style={{
                borderRadius: "20px",
                fontWeight: "500",
                backgroundColor: "#f8f9fa",
                border: "1px solid #ddd",
                color: "#333",
              }}
            >
              <FaUserCircle size={24} className="me-2" />
              {user.isAdmin ? "Admin Dashboard" : "User Profile"}
            </Link>
          </div>
        </div>

        {/* Bottom white header with response input */}
        <div className="bg-white px-4 py-3 border-bottom">
          <form onSubmit={handleResponseSubmit} className="d-flex align-items-center gap-3">
            <div className="position-relative flex-grow-1">
              <FontAwesomeIcon
                icon={faComment}
                className="position-absolute"
                style={{
                  color: "#6B7280",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "14px",
                }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Ask something about the responses..."
                value={responseInput}
                onChange={(e) => setResponseInput(e.target.value)}
                style={{
                  backgroundColor: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  fontSize: "14px",
                  paddingLeft: "36px",
                  paddingRight: "16px",
                  height: "38px",
                }}
              />
            </div>
            <button
              type="submit"
              className="btn d-flex align-items-center gap-2 px-3"
              style={{
                backgroundColor: "#8B5CF6",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                color: "white",
                height: "38px",
              }}
            >
              <FontAwesomeIcon icon={faComment} style={{ fontSize: "14px" }} />
              <span className="fw-medium">Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Header;
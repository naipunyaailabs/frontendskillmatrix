
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faMagnifyingGlass, faRotateRight,
  faComment,
  faFileAlt,
  faVideo,
  faChevronDown,
  faChevronUp,
  faStar,
  faDownload,
  faEye,
  faFilter,
  faTimes,
  faSearch,
  faMapMarkerAlt,
  faClock,
  faGraduationCap,
  faLanguage,
  faBriefcase,
  faMoneyBillWave,
  faTools,
  faUserTie,
  faBuilding,
  faRotateLeft,
  faCalendarAlt,
  faIdBadge ,
  
} from "@fortawesome/free-solid-svg-icons"
import React, { useState, useEffect } from "react";
import { useLocation,useNavigate  } from 'react-router-dom';

import axios from "axios";
import { Button, Modal, Form,Dropdown } from "react-bootstrap";
import { io } from "socket.io-client";
import { FaExpand, FaCompress } from "react-icons/fa";
import { faGoogle, faMicrosoft} from '@fortawesome/free-brands-svg-icons';
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UploadDocuments.css";
import { axiosInstance } from "../../axiosUtils";
  import TopNotificationModal from './TopNotificationModal';

function ResponseTable({ data, duplicateCount  }) {

  console.log("Received data:", data);
  console.log("Duplicate count:", duplicateCount);  


const [showTopModal, setShowTopModal] = useState(false);
const [modalMessage, setModalMessage] = useState('');

    const [expandedRow, setExpandedRow] = useState(null)
   const [members, setMembers] = useState([]); // Store fetched members
    const [filteredMembers, setFilteredMembers] = useState([]); // Store filtered results
    const [expandedLists, setExpandedLists] = useState({});
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [allSelected, setAllSelected] = useState({});
    const location = useLocation();
const fromUpload = location.state?.fromUpload || false; 
    const [showSuccessModal, setShowSuccessModal] = useState(true); // modal shown initially

   const [selectedFilters, setSelectedFilters] = useState({
  skills: [],
  designation: [],
  degree: [],
  company_names: [],
  jobType: [],
  job_title: [], // ✅ NEW
});

    const [showModal, setShowModal] = useState({});
   const filterIcons = {
  skills: faTools,
  designation: faUserTie,
  degree: faGraduationCap,
  company_names: faBuilding,
  jobType: faBriefcase,
  job_title: faIdBadge, // ✅ NEW
};

  const navigate = useNavigate(); // ✅ Initialize it here
useEffect(() => {
  if (duplicateCount !== undefined && duplicateCount > 0) {
    setModalMessage(`We detected ${duplicateCount} duplicate profile${duplicateCount > 1 ? 's' : ''}. Check the Candidate History section.`);
    setShowTopModal(true);
  }
}, [duplicateCount]);
  if (!data || data.length === 0) {
    console.log("No data available to display.");

  }



  useEffect(() => {
    if (data && Array.isArray(data)) {
      // Process and sort the data
      const sortedData = data
        .map((result) => {
          const matchingResult = result.matchingResult?.[0]?.["Resume Data"] || {};
          const matchingPercentage = matchingResult?.["Matching Percentage"] || 0;
          console.log(`Processing result: ${JSON.stringify(result)}`);
          return { ...result, matchingResult, matchingPercentage };
        })
        .sort((a, b) => b.matchingPercentage - a.matchingPercentage);

      console.log("Sorted data:", sortedData);

      // Update state with the processed data
      setMembers(sortedData);
      setFilteredMembers(sortedData); // Initially show all members
    }
  }, [data]); // Re-run if `data` prop changes
  // State for expanding/collapsing lists
  const [expandedSkills, setExpandedSkills] = useState({});
  const [expandedDesignations, setExpandedDesignations] = useState({});

 
  const toggleModal = (filter) => {
    setShowModal((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleFilterChange = (filterCategory, value) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterCategory]: value,
    }));
  };
  const applyFilters = () => {
    let filtered = members;

    if (selectedFilters.jobType.length) {
      filtered = filtered.filter((member) => {
        const experienceStr = member.matchingResult?.total_experience || "0 years";
        console.log(experienceStr);
        const experienceYears = parseFloat(experienceStr); // Extract numeric value
  
        const isFresher = selectedFilters.jobType.includes("Fresher") && experienceYears === 0;
        const isExperienced = selectedFilters.jobType.includes("Experienced") && experienceYears > 0;
  
        return isFresher || isExperienced;
      });
    }
    if (selectedFilters.skills.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.skills.some((skills) =>
          member.matchingResult?.skills
            ?.join(", ")
            .toLowerCase()
            .includes(skills.toLowerCase())
        )
      );
    }
    if (selectedFilters.degree.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.degree.some((degree) =>
          member.matchingResult?.degree
            ?.join(", ")
            .toLowerCase()
            .includes(degree.toLowerCase())
        )
      );
    }
    if (selectedFilters.company_names.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.company_names.some((company_name) =>
          member.matchingResult?.company_names
            ?.join(", ")
            .toLowerCase()
            .includes(company_name.toLowerCase())
        )
      );
    }
    if (selectedFilters.designation.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.designation.some((designation) =>
          member.matchingResult?.designation
            ?.join(", ")
            .toLowerCase()
            .includes(designation.toLowerCase())
        )
      );
    }
    if (selectedFilters.job_title.length) {
  filtered = filtered.filter((member) =>
    selectedFilters.job_title.some((jobTitle) =>
      member.matchingResult?.["Job Title"]?.toLowerCase().includes(jobTitle.toLowerCase())
    )
  );
}

 
    
    setFilteredMembers(filtered);
  };
 const extractUniqueValues = (key) => {
  if (key === "jobType") {
    return ["Fresher", "Experienced"];
  }
  if (key === "job_title") {
    return [
      ...new Set(
        members.map((member) => member.matchingResult?.["Job Title"]).filter(Boolean)
      ),
    ];
  }
  return [
    ...new Set(
      members.flatMap((member) => member.matchingResult?.[key]?.flat() || [])
    ),
  ];
};


  const resetFilters = (filterCategory) => {
    handleFilterChange(filterCategory, []);
    setAllSelected((prev) => ({ ...prev, [filterCategory]: false }));
  };

  const resetAllFilters = () => {
    setSelectedFilters({
      skills: [],
      designation: [],
      degree: [],
      company_names: [],
      jobType: [],
        job_title: [], // ✅ RESET too
    });
    setAllSelected({});
    setFilteredMembers(members);
  };
  const toggleExpand = (index, type) => {
    setExpandedLists((prev) => ({
      ...prev,
      [`${index}-${type}`]: !prev[`${index}-${type}`],
    }));
  };

  const renderListWithExpand = (items, index, type) => {
    const maxItems = 3;
    const isExpanded = expandedLists[`${index}-${type}`];
    const visibleItems = isExpanded ? items : items.slice(0, maxItems);

    return (
      <>
        <ul className="bullet-list">
          {visibleItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        {items.length > maxItems && (
          <span
            className="toggle-link"
            onClick={() => toggleExpand(index, type)}
          >
            {isExpanded ? "Show Less" : "More..."}
          </span>
        )}
      </>
    );
  };

  const handleOpenLink = (url) => {
    window.open(url, '_blank'); // Opens the link in a new tab
  };
  const handleResumeLink = async (resumeId) => {
    try {
      if (!resumeId) return '#';
      const response = await axiosInstance.get(`/api/resumes/${resumeId}`);
      return response.data?.url || '#';
    } catch (error) {
      console.error('Error getting resume URL:', error);
      return '#';
    }
  };

  const toggleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id)
  }
  return (
     <div className="card border-0 responsedisplay  shadow-sm">
   <div
        className="filter-buttons-container p-3 border-bottom d-flex justify-content-center"
        style={{ backgroundColor: 'rgb(63 51 196 / 31%)' }}
      >
   <div className="d-flex flex-wrap gap-2 align-items-center">
        {Object.keys(filterIcons).map((filter) => (
          <Button
            key={filter}
            variant="outline-dark"
            className="d-flex align-items-center gap-2 filter-btn bg-white"
            onClick={() => toggleModal(filter)}
          >
            <FontAwesomeIcon icon={filterIcons[filter]} className="text-black" />
            <span className="text-black">{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
          </Button>
        ))}
  
          <Button
         variant="outline-dark"
            className="d-flex align-items-center gap-2 filter-btn bg-white"
          onClick={resetAllFilters}
        >
          <FontAwesomeIcon icon={faRotateRight} /> 
          <span className="text-black">Reset All</span>
        </Button>
  
        <Button
            variant="outline-none"
            className="d-flex align-items-center gap-2 filter-btn bg-white"
          onClick={applyFilters}
        >
       <FontAwesomeIcon icon={faMagnifyingGlass} />
       <FontAwesomeIcon icon={faRotateRight} /> 
          <span className="text-black">Search</span>
          
        </Button>
        
        {Object.keys(filterIcons).map((filter) => (
          <Modal
            key={filter}
            show={showModal[filter] || false}
            onHide={() => toggleModal(filter)}
            centered
            className="filter-modal"
            style={{ background: "rgba(255, 255, 255, 0.68)" }}
          >

      <div style={{  backgroundColor: 'rgb(215 211 255 / 82%)', borderRadius: '8px' }}>
            <Modal.Header closeButton>
              <Modal.Title className="d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={filterIcons[filter]} className="text-primary" />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="filter-options">
                <Form>
                  <Form.Check
                    type="checkbox"
                    label="Select All"
                    checked={allSelected[filter] || false}
                    onChange={(e) => {
                      const isSelected = e.target.checked;
                      const allValues = extractUniqueValues(filter);
                      setAllSelected((prev) => ({ ...prev, [filter]: isSelected }));
                      handleFilterChange(filter, isSelected ? allValues : []);
                    }}
                  />
                  {extractUniqueValues(filter).map((value, index) => (
                    <Form.Check
                      key={index}
                      type="checkbox"
                      label={value}
                      checked={selectedFilters[filter]?.includes(value) || false}
                      onChange={(e) => {
                        const selected = e.target.checked
                          ? [...(selectedFilters[filter] || []), value]
                          : selectedFilters[filter].filter((v) => v !== value);
                        handleFilterChange(filter, selected);
                      }}
                    />
                  ))}
                </Form>
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-content-between">
              <Button variant="secondary" onClick={() => handleFilterChange(filter, [])}>
                Reset
              </Button>
              <Button variant="primary" onClick={applyFilters}>
                Apply
              </Button>
            </Modal.Footer>
            </div>
          </Modal>
        ))}
      </div>
    </div>
        <div className="table-responsive">
    {showTopModal && (
  <TopNotificationModal
    message={modalMessage}
    onClose={() => setShowTopModal(false)}
  />
)}

       {showSuccessModal && (
  <div className="custom-success-modal-backdrop">
    <div className="custom-success-modal">
      <h2 className="modal-heading">Upload Successful 🎉</h2>

      <p className="modal-message">
        Your candidates were processed successfully.  
        <strong> Go to the "Candidates" section</strong> to assign assessments or take further action.
      </p>

      <p className="modal-message text-muted" style={{ fontSize: "14px" }}>
        🔍 You can also explore <strong>Recommended Profiles</strong> — AI-curated candidates that best match your job description.
        <br />
        <button
          className="btn btn-link px-0 text-primary"
          style={{ fontSize: "14px", textDecoration: "underline" }}
          onClick={() => {
            setShowSuccessModal(false); // close modal
     navigate("/dashboard/candidates", { state: { view: 'recommended' } });


          }}
        >
          Go to Recommended Profiles →
        </button>
      </p>

      <button className="modal-button" onClick={() => setShowSuccessModal(false)}>
        Got it
      </button>
    </div>
  </div>
)}


          <table className="table table-hover align-middle mb-0">
                 <thead className="table candidate-table-header">
              <tr>
                <th style={{ padding: "16px 24px" }}>Rank</th>
                <th style={{ padding: "16px 24px" }}>Candidate</th>
                <th style={{ padding: "16px 24px" }}>Job Title</th>
                <th style={{ padding: "16px 24px" }}>Experience</th>
                <th style={{ padding: "16px 24px" }}>Match</th>
                <th style={{ padding: "16px 24px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
            {filteredMembers.map((result, index) => {
              const resumeData = result.matchingResult || {};
                return(
                <React.Fragment key={index}>
                  <tr className={expandedRow === index ? "expanded-row" : ""}>
                    <td style={{ padding: "16px 24px" }}>
                      <span className="badge bg-primary">{index + 1}</span>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div className="d-flex align-items-center">
                        
                        <div>
                          <h6 className="mb-0">{resumeData.name || "N/A"}</h6>
                          <small className="text-muted">{resumeData.email}</small>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>{resumeData?.["Job Title"] || "N/A"}</td>
                    <td style={{ padding: "16px 24px" }}>{resumeData.total_experience || "0"}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${resumeData["Matching Percentage"] || "0"}%` }}
                            aria-valuenow={resumeData["Matching Percentage"] || "0"}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <span className="ms-2 fw-bold">{resumeData["Matching Percentage"] || "0"}%</span>
                      </div>
                      {result.candidateConsent?.allowedToShare && (
  <span className="badge bg-success">Shared</span>
)}

                    </td>
                    <td style={{ padding: "16px 24px" }}>
                            <div className="d-flex gap-2">
                              <Dropdown>
                            <Dropdown.Toggle
                          
                              size="sm"
                              id={`resume-dropdown-${result._id}`}
                              className="custom-dropdown"
                                style={{ backgroundColor: 'rgb(63 51 196 / 31%)' }}
  
                              
                            >
                              <FontAwesomeIcon icon={faFileAlt} className="me-1" />
                              
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="custom-dropdown-menu"
                              style={{ backgroundColor: 'rgb(215 211 255 / 82%)' }}
                            >
                        
                                <Dropdown.Item 
                                as="a" 
                                href="#" 
                                onClick={async (e) => {
                                  e.preventDefault();
                                  const url = await handleResumeLink(result.resumeId);
                                  if (url && url !== '#') {
                                    window.open(url, '_blank');
                                  }
                                }}
                                className="custom-dropdown-item"
                              >
                                <FontAwesomeIcon icon={faEye} className="me-2 text-primary" />
                                View Resume
                              </Dropdown.Item>
                              <Dropdown.Item 
                                as="a" 
                                href="#" 
                                onClick={async (e) => {
                                  e.preventDefault();
                                  try {
                                    const response = await axiosInstance.get(
                                      `/api/resumes/${result.resumeId}?download=true`
                                    );
                                    if (response.data?.url) {
                                      window.location.href = response.data.url; // This triggers the download
                                    }
                                  } catch (error) {
                                    console.error('Download failed:', error);
                                    toast.error('Failed to initiate download');
                                  }
                                }}
                                className="custom-dropdown-item"
                              >
                                <FontAwesomeIcon icon={faDownload} className="me-2 text-success" />
                                Download Resume
                              </Dropdown.Item>
                                              </Dropdown.Menu>
                                            </Dropdown>
                                         
                                          <Dropdown>
                                    <Dropdown.Toggle
                                      variant="outline-none"
                                      size="sm"
                                      className="custom-dropdown text-white border-0"
                                      style={{ backgroundColor: '#56629cb8' }}
                                      
                                    >
                                                <FontAwesomeIcon icon={faCalendarAlt}  className="me-1" />
                                                Interview
                                              </Dropdown.Toggle>
                                              <Dropdown.Menu
                                              style={{ backgroundColor: 'rgb(215 211 255 / 82%)' }}
                                              >

                                                <Dropdown.Item
                                                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&add=${encodeURIComponent(resumeData.email || "")}&text=${encodeURIComponent(`Interview - ${resumeData["Job Title"] || "Job Title"}`)}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                >
                                                  <FontAwesomeIcon icon={faGoogle} className="me-2" />
                                                  Google Calendar
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                  href={`https://outlook.office.com/calendar/0/deeplink/compose?to=${encodeURIComponent(resumeData.email || "")}&subject=${encodeURIComponent(`Interview - ${resumeData["Job Title"] || "Job Title"}`)}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                >
                                                  <FontAwesomeIcon icon={faMicrosoft} className="me-2" />
                                                  Microsoft Teams
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                  href={`https://zoom.us/schedule?email=${encodeURIComponent(resumeData.email || "")}&topic=${encodeURIComponent(`Interview - ${resumeData["Job Title"] || "Job Title"}`)}`}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                >
                                                  <FontAwesomeIcon icon={faVideo} className="me-2" />
                                                  Zoom
                                                </Dropdown.Item>
                                              </Dropdown.Menu>
                                            </Dropdown>
                                            
                        <button
                                 className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 text-white"
                          onClick={() => toggleExpandRow(index)}
                          title="Toggle Details"
                         style={{ backgroundColor: 'rgb(63 51 196 / 31%)' }}
                        >
                              Details
                          <FontAwesomeIcon icon={expandedRow === index ? faChevronUp : faChevronDown} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <tr className="expanded-content">
                      <td colSpan="6"
                      style={{ backgroundColor: 'rgb(63 51 196 / 31%)' }}
                      >
                           <div
                        className="p-4 rounded shadow-sm text-white"
                        style={{ backgroundColor: 'rgb(63 51 196 / 31%)' }}
                      >
                          <div className="row">
                            <div className="col-md-6">
                                <h6 className="mb-3 text-black text-decoration-underline"><strong>Contact Information</strong></h6>
                                                          <p className="text-black ">
                                                            <strong>Mobile : </strong> {resumeData.mobile_number || "N/A"}
                                                          </p>
                                                        
                                                            <p className="text-black ">
                                                        <strong>Email: </strong>
                                                        {resumeData.email ? (
                                                          <span className="badge bg-black">{resumeData.email}</span>
                                                        ) : (
                                                          "N/A"
                                                        )}
                                                              </p>
                                                        </div>
                                                        <div className="col-md-6">
                                                          <h6 className="mb-3 text-black text-decoration-underline"><strong>Professional Details</strong></h6>
                                                            <p className="text-black ">
                                                            <strong>Designation : </strong> {resumeData.designation}
                                                          </p>
                                                            <p className="text-black ">
                                                            <strong>Degree : </strong> {resumeData.degree?.join(", ") || "N/A"}
                                                          </p>
                                                        </div>
                                                      </div>
                                                      <div className="row mt-3">
                                                        <div className="col-md-6">
                                                          <h6 className="mb-3 text-black"> <strong>Skills : </strong></h6>
                                                          <div className="d-flex flex-wrap gap-2">
                                                            {resumeData.skills?.map((skill, index) => (
                                                                <span key={index} className="badge bg-black">
                                                                  {skill}
                                                                </span>
                                                              )) || (
                                                                <span className="text-black">No skills available</span>
                                                              )}
                                                          </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                          <h6 className="mb-3 text-black"><strong>Previous Companies : </strong></h6>
                                                          <ul className="list-unstyled">
                                                            {resumeData.company_names?.map((company, index) => (
                                                              <li key={index} className="mb-1">
                                                                <FontAwesomeIcon icon={faStar} className="text-warning me-2" />
                                                                {company}
                                                              </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                     
                  )}
                </React.Fragment>
                );
            })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

export default ResponseTable


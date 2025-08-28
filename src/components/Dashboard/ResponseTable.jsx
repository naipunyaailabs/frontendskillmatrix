
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass, faRotateRight, faFileAlt, faVideo,
  faChevronDown, faChevronUp, faStar, faDownload, faEye,
  faTools, faUserTie, faGraduationCap, faBuilding, faBriefcase,
  faIdBadge, faCalendarAlt, faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle, faMicrosoft } from "@fortawesome/free-brands-svg-icons";
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Modal, Form, Dropdown } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UploadDocuments.css";
import { axiosInstance } from "../../axiosUtils";

function ResponseTable({ data, duplicateCount }) {
  const [showTopModal, setShowTopModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [expandedLists, setExpandedLists] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    skills: [], designation: [], degree: [], company_names: [], jobType: [], job_title: [],
  });
  const [showModal, setShowModal] = useState({});
  const [allSelected, setAllSelected] = useState({});
  const location = useLocation();
  const fromUpload = location.state?.fromUpload || false;
  const navigate = useNavigate();

  const filterIcons = {
    skills: faTools,
    designation: faUserTie,
    degree: faGraduationCap,
    company_names: faBuilding,
    jobType: faBriefcase,
    job_title: faIdBadge,
  };

  // Handle duplicate count notification and success modal
  useEffect(() => {
    if (duplicateCount > 0) {
      setModalMessage(
        `We detected ${duplicateCount} duplicate profile${duplicateCount > 1 ? "s" : ""}. Check the Candidate History section.`
      );
      setShowTopModal(true);
    }
    setShowSuccessModal(fromUpload);
  }, [duplicateCount, fromUpload]);

  // Process and sort data
  useEffect(() => {
    let inputData = [];
    if (data) {
      // Handle segmented data (recent/history), POST Response, array, or single response
      if (data.recent || data.history) {
        inputData = [...(data.recent || []), ...(data.history || [])];
      } else if (data["POST Response"]) {
        inputData = data["POST Response"];
      } else if (Array.isArray(data)) {
        inputData = data;
      } else {
        inputData = [data];
      }
    }

    const sortedData = inputData
      .map((result) => {
        const matchingResult = result["Resume Data"] || result.matchingResult?.[0]?.["Resume Data"] || result;
        const analysis = result.matchingResult?.[0]?.Analysis || result.Analysis || {};
        const matchingPercentage = result["Matching Percentage"] || result.matchingResult?.[0]?.["Matching Percentage"] || analysis["Matching Score"] || 0;
        return { 
          ...result, 
          matchingResult, 
          matchingPercentage,
          Analysis: {
            "Matching Score": analysis["Matching Score"] || 0,
            "Matched Skills": analysis["Matched Skills"] || [],
            "Unmatched Skills": analysis["Unmatched Skills"] || [],
            "Matched Skills Percentage": analysis["Matched Skills Percentage"] || 0,
            "Unmatched Skills Percentage": analysis["Unmatched Skills Percentage"] || 0,
            "Strengths": analysis.Strengths || [],
            "Recommendations": analysis.Recommendations || [],
            "Required Industrial Experience": analysis["Required Industrial Experience"] || "N/A",
            "Candidate Industrial Experience": analysis["Candidate Industrial Experience"] || "N/A",
            "Required Domain Experience": analysis["Required Domain Experience"] || "N/A",
            "Candidate Domain Experience": analysis["Candidate Domain Experience"] || "N/A",
          }
        };
      })
      .sort((a, b) => b.matchingPercentage - a.matchingPercentage);
    setMembers(sortedData);
    setFilteredMembers(sortedData);
  }, [data]);

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
        const experienceYears = parseFloat(member.matchingResult?.experience || member.matchingResult?.total_experience || 0);
        const isFresher = selectedFilters.jobType.includes("Fresher") && experienceYears === 0;
        const isExperienced = selectedFilters.jobType.includes("Experienced") && experienceYears > 0;
        return isFresher || isExperienced;
      });
    }

    if (selectedFilters.skills.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.skills.every((skill) =>
          member.matchingResult?.skills?.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
        )
      );
    }

    if (selectedFilters.degree.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.degree.every((degree) =>
          (Array.isArray(member.matchingResult?.degree)
            ? member.matchingResult?.degree
            : [member.matchingResult?.degree]
          )?.map((d) => d?.toLowerCase()).includes(degree.toLowerCase())
        )
      );
    }

    if (selectedFilters.company_names.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.company_names.every((company) =>
          member.matchingResult?.company_names?.map((c) => c.toLowerCase()).includes(company.toLowerCase())
        )
      );
    }

    if (selectedFilters.designation.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.designation.every((designation) =>
          (Array.isArray(member.matchingResult?.designation)
            ? member.matchingResult?.designation
            : [member.matchingResult?.designation]
          )?.map((d) => d?.toLowerCase()).includes(designation.toLowerCase())
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
    if (key === "jobType") return ["Fresher", "Experienced"];
    if (key === "job_title") {
      return [...new Set(members.map((member) => member.matchingResult?.["Job Title"]).filter(Boolean))];
    }
    return [...new Set(members.flatMap((member) => 
      Array.isArray(member.matchingResult?.[key]) 
        ? member.matchingResult?.[key] 
        : [member.matchingResult?.[key]]
    ).filter(Boolean))];
  };

  const resetFilters = (filterCategory) => {
    handleFilterChange(filterCategory, []);
    setAllSelected((prev) => ({ ...prev, [filterCategory]: false }));
  };

  const resetAllFilters = () => {
    setSelectedFilters({
      skills: [], designation: [], degree: [], company_names: [], jobType: [], job_title: [],
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

  const renderListWithExpand = useMemo(() => (items, index, type, maxItems = 3) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return <span className="text-muted">None</span>;
    }
    const isExpanded = expandedLists[`${index}-${type}`];
    const visibleItems = isExpanded ? items : items.slice(0, maxItems);

    return (
      <div className="list-container" aria-describedby={`${type}-${index}`}>
        <ul className="bullet-list list-unstyled">
          {visibleItems.map((item, i) => (
            <li key={i} className="mb-1">{item}</li>
          ))}
        </ul>
        {items.length > maxItems && (
          <span
            className="toggle-link text-primary cursor-pointer"
            onClick={() => toggleExpand(index, type)}
            role="button"
            aria-label={isExpanded ? `Collapse ${type} list` : `Expand ${type} list`}
          >
            {isExpanded ? "Show Less" : "Show More"}
          </span>
        )}
      </div>
    );
  }, [expandedLists]);

  const handleResumeLink = async (resumeId) => {
    try {
      if (!resumeId) throw new Error("No resume ID");
      const response = await axiosInstance.get(`/api/resumes/${resumeId}`);
      return response.data?.url || "#";
    } catch (error) {
      console.error("Error getting resume URL:", error);
      toast.error("Failed to fetch resume URL");
      return "#";
    }
  };

  const handleReportLink = async (assessmentSessionId) => {
    try {
      if (!assessmentSessionId) throw new Error("No assessment session ID");
      const response = await axiosInstance.get(`/api/reports/${assessmentSessionId}`);
      return response.data?.url || "#";
    } catch (error) {
      console.error("Error getting report URL:", error);
      toast.error("Failed to fetch report URL");
      return "#";
    }
  };

  const toggleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="card border-0 responsedisplay shadow-sm" style={{ borderRadius: "12px" }}>
      <div
        className="filter-buttons-container p-3 border-bottom d-flex justify-content-center"
        style={{ backgroundColor: "rgb(63 51 196 / 12%)" }}
      >
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {Object.keys(filterIcons).map((filter) => (
            <Button
              key={filter}
              variant="outline-dark"
              className="d-flex align-items-center gap-2 filter-btn bg-white"
              onClick={() => toggleModal(filter)}
              aria-label={`Open ${filter} filter modal`}
            >
              <FontAwesomeIcon icon={filterIcons[filter]} className="text-black" />
              <span className="text-black">{filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
            </Button>
          ))}
          <Button
            variant="outline-dark"
            className="d-flex align-items-center gap-2 filter-btn bg-white"
            onClick={resetAllFilters}
            aria-label="Reset all filters"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            <span className="text-black">Reset All</span>
          </Button>
          <Button
            variant="outline-none"
            className="d-flex align-items-center gap-2 filter-btn bg-white"
            onClick={applyFilters}
            aria-label="Apply filters"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
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
              <div style={{ backgroundColor: "rgb(215 211 255 / 82%)", borderRadius: "8px" }}>
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
                        id={`select-all-${filter}`}
                        aria-label={`Select all ${filter} options`}
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
                          id={`${filter}-${index}`}
                          aria-label={`Select ${value} for ${filter}`}
                        />
                      ))}
                    </Form>
                  </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                  <Button variant="secondary" onClick={() => resetFilters(filter)}>
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
            onViewHistory={() => navigate("/dashboard/candidate-history")}
          />
        )}
        {showSuccessModal && (
          <div className="custom-success-modal-backdrop">
            <div className="custom-success-modal" style={{ borderRadius: "12px", padding: "20px" }}>
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
                    setShowSuccessModal(false);
                    navigate("/dashboard/candidates", { state: { view: "recommended" } });
                  }}
                  aria-label="Go to Recommended Profiles"
                >
                  Go to Recommended Profiles →
                </button>
              </p>
              <button
                className="modal-button btn btn-primary"
                onClick={() => setShowSuccessModal(false)}
                aria-label="Close success modal"
              >
                Got it
              </button>
            </div>
          </div>
        )}
        <table className="table table-hover align-middle mb-0">
          <thead className="table candidate-table-header">
            <tr>
              <th scope="col" style={{ padding: "16px 24px" }}>Rank</th>
              <th scope="col" style={{ padding: "16px 24px" }}>Candidate</th>
              <th scope="col" style={{ padding: "16px 24px" }}>Job Title</th>
              <th scope="col" style={{ padding: "16px 24px" }}>Experience</th>
              <th scope="col" style={{ padding: "16px 24px" }}>Match</th>
              <th scope="col" style={{ padding: "16px 24px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((result, index) => {
              const resumeData = result.matchingResult || result;
              const analysis = result.Analysis || {};
              const testScore = result.testScore || {};
              const assessmentSession = result.assessmentSession || {};
              return (
                <React.Fragment key={index}>
                  <tr className={expandedRow === index ? "expanded-row" : ""}>
                    <td style={{ padding: "16px 24px" }}>
                      <span className="badge bg-primary">{index + 1}</span>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div className="d-flex align-items-center">
                        <div>
                          <h6 className="mb-0">{resumeData.name || "N/A"}</h6>
                          <small className="text-muted">{resumeData.email || "N/A"}</small>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>{resumeData["Job Title"] || "N/A"}</td>
                    <td style={{ padding: "16px 24px" }}>
                      {resumeData.experience || resumeData.total_experience || "0"} years
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1" style={{ height: "8px" }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${resumeData["Matching Percentage"] || analysis["Matching Score"] || 0}%` }}
                            aria-valuenow={resumeData["Matching Percentage"] || analysis["Matching Score"] || 0}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <span className="ms-2 fw-bold">
                          {resumeData["Matching Percentage"] || analysis["Matching Score"] || 0}%
                        </span>
                      </div>
                      {result.candidateConsent?.allowedToShare && (
                        <span className="badge bg-success mt-1">Shared</span>
                      )}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div className="d-flex gap-2">
                        <Dropdown>
                          <Dropdown.Toggle
                            size="sm"
                            id={`resume-dropdown-${result._id || result.Id}`}
                            className="custom-dropdown"
                            style={{ backgroundColor: "rgb(63 51 196 / 31%)" }}
                            aria-label="Resume actions"
                          >
                            <FontAwesomeIcon icon={faFileAlt} className="me-1" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu style={{ backgroundColor: "rgb(215 211 255 / 82%)" }}>
                            <Dropdown.Item
                              as="a"
                              href="#"
                              onClick={async (e) => {
                                e.preventDefault();
                                const url = await handleResumeLink(result.resumeId?._id || result.resumeId || result.Id);
                                if (url && url !== "#") {
                                  window.open(url, "_blank");
                                }
                              }}
                              className="custom-dropdown-item"
                              aria-label="View resume"
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
                                    `/api/resumes/${result.resumeId?._id || result.resumeId || result.Id}?download=true`
                                  );
                                  if (response.data?.url) {
                                    window.location.href = response.data.url;
                                  }
                                } catch (error) {
                                  console.error("Download failed:", error);
                                  toast.error("Failed to initiate download");
                                }
                              }}
                              className="custom-dropdown-item"
                              aria-label="Download resume"
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
                            style={{ backgroundColor: "#56629cb8" }}
                            aria-label="Interview scheduling options"
                          >
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                            Interview
                          </Dropdown.Toggle>
                          <Dropdown.Menu style={{ backgroundColor: "rgb(215 211 255 / 82%)" }}>
                            <Dropdown.Item
                              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&add=${encodeURIComponent(
                                resumeData.email || ""
                              )}&text=${encodeURIComponent(`Interview - ${resumeData["Job Title"] || "Job Title"}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Schedule with Google Calendar"
                            >
                              <FontAwesomeIcon icon={faGoogle} className="me-2" />
                              Google Calendar
                            </Dropdown.Item>
                            <Dropdown.Item
                              href={`https://outlook.office.com/calendar/0/deeplink/compose?to=${encodeURIComponent(
                                resumeData.email || ""
                              )}&subject=${encodeURIComponent(`Interview - ${resumeData["Job Title"] || "Job Title"}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Schedule with Microsoft Teams"
                            >
                              <FontAwesomeIcon icon={faMicrosoft} className="me-2" />
                              Microsoft Teams
                            </Dropdown.Item>
                            <Dropdown.Item
                              href={`https://zoom.us/schedule?email=${encodeURIComponent(
                                resumeData.email || ""
                              )}&topic=${encodeURIComponent(`Interview - ${resumeData["Job Title"] || "Job Title"}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Schedule with Zoom"
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
                          style={{ backgroundColor: "rgb(63 51 196 / 31%)" }}
                          aria-label={expandedRow === index ? "Collapse details" : "Expand details"}
                        >
                          Details
                          <FontAwesomeIcon icon={expandedRow === index ? faChevronUp : faChevronDown} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <tr className="expanded-content">
                      <td colSpan="6" style={{ backgroundColor: "rgb(63 51 196 / 12%)" }}>
                        <div className="p-4 rounded shadow-sm" style={{ backgroundColor: "rgb(215 211 255 / 82%)" }}>
                          <div className="row g-4">
                            <div className="col-md-6">
                              <h6 className="mb-3 text-black text-decoration-underline">Contact Information</h6>
                              <p className="text-black mb-2">
                                <strong>Mobile: </strong> {resumeData.mobile_number || "N/A"}
                              </p>
                              <p className="text-black mb-2">
                                <strong>Email: </strong>
                                {resumeData.email ? (
                                  <span className="badge bg-dark">{resumeData.email}</span>
                                ) : (
                                  "N/A"
                                )}
                              </p>
                              <p className="text-black mb-2">
                                <strong>Consent Status: </strong>
                                {result.candidateConsent?.allowedToShare ? (
                                  <span className="badge bg-success">Shared</span>
                                ) : (
                                  <span className="badge bg-warning">Not Shared</span>
                                )}
                              </p>
                            </div>
                            <div className="col-md-6">
                              <h6 className="mb-3 text-black text-decoration-underline">Professional Details</h6>
                              <p className="text-black mb-2">
                                <strong>Designation: </strong> 
                                {(Array.isArray(resumeData.designation) 
                                  ? resumeData.designation.join(", ") 
                                  : resumeData.designation) || "N/A"}
                              </p>
                              <p className="text-black mb-2">
                                <strong>Degree: </strong> 
                                {(Array.isArray(resumeData.degree) 
                                  ? resumeData.degree.join(", ") 
                                  : resumeData.degree) || "N/A"}
                              </p>
                              <div className="text-black mb-2">
                                <strong>Certifications: </strong>
                                {renderListWithExpand(resumeData.certifications || [], index, "certifications")}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <h6 className="mb-3 text-black text-decoration-underline">Skills</h6>
                              <div className="d-flex flex-wrap gap-2">
                                {resumeData.skills?.length ? (
                                  resumeData.skills.map((skill, i) => (
                                    <span key={i} className="badge bg-dark">{skill}</span>
                                  ))
                                ) : (
                                  <span className="text-muted">No skills available</span>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <h6 className="mb-3 text-black text-decoration-underline">Previous Companies</h6>
                              {renderListWithExpand(resumeData.company_names || [], index, "company_names")}
                            </div>
                            <div className="col-12">
                              <h6 className="mb-3 text-black text-decoration-underline">Experience</h6>
                              {resumeData.total_experience?.length ? (
                                resumeData.total_experience.map((exp, i) => (
                                  <div key={i} className="mb-3 p-3 border rounded" style={{ backgroundColor: "#fff" }}>
                                    <p className="text-black mb-1">
                                      <strong>Role: </strong> {exp.role || "N/A"}
                                    </p>
                                    <p className="text-black mb-1">
                                      <strong>Company: </strong> {exp.company || "N/A"}
                                    </p>
                                    <p className="text-black mb-1">
                                      <strong>Duration: </strong> {exp.duration || "N/A"}
                                    </p>
                                    <div className="text-black mb-1">
                                      <strong>Responsibilities: </strong>
                                      {renderListWithExpand(exp.responsibilities || [], index, `responsibilities-${i}`, 2)}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <span className="text-muted">No experience available</span>
                              )}
                            </div>
                            <div className="col-12">
                              <h6 className="mb-3 text-black text-decoration-underline">Analysis</h6>
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <div className="text-black mb-2">
                                    <strong>Matched Skills: </strong>
                                    {renderListWithExpand(analysis["Matched Skills"] || [], index, "matchedSkills")}
                                  </div>
                                  <div className="text-black mb-2">
                                    <strong>Unmatched Skills: </strong>
                                    {renderListWithExpand(analysis["Unmatched Skills"] || [], index, "unmatchedSkills")}
                                  </div>
                                  <div className="text-black mb-2">
                                    <strong>Strengths: </strong>
                                    {renderListWithExpand(analysis.Strengths || [], index, "strengths")}
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <p className="text-black mb-2">
                                    <strong>Matching Score: </strong> {analysis["Matching Score"] || "N/A"}
                                  </p>
                                  <p className="text-black mb-2">
                                    <strong>Matched Skills Percentage: </strong> {analysis["Matched Skills Percentage"] || 0}%
                                  </p>
                                  <p className="text-black mb-2">
                                    <strong>Unmatched Skills Percentage: </strong> {analysis["Unmatched Skills Percentage"] || 0}%
                                  </p>
                                  <div className="text-black mb-2">
                                    <strong>Recommendations: </strong>
                                    {renderListWithExpand(analysis.Recommendations || [], index, "recommendations")}
                                  </div>
                                  <p className="text-black mb-2">
                                    <strong>Required Industrial Experience: </strong>
                                    {analysis["Required Industrial Experience"] || "N/A"}
                                  </p>
                                  <p className="text-black mb-2">
                                    <strong>Candidate Industrial Experience: </strong>
                                    {analysis["Candidate Industrial Experience"] || "N/A"}
                                  </p>
                                  <p className="text-black mb-2">
                                    <strong>Required Domain Experience: </strong>
                                    {analysis["Required Domain Experience"] || "N/A"}
                                  </p>
                                  <p className="text-black mb-2">
                                    <strong>Candidate Domain Experience: </strong>
                                    {analysis["Candidate Domain Experience"] || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {assessmentSession._id && (
                              <div className="col-12">
                                <h6 className="mb-3 text-black text-decoration-underline">Assessment Results</h6>
                                <p className="text-black mb-2">
                                  <strong>MCQ Score: </strong> {testScore.score ? `${testScore.score.toFixed(2)}/100` : "N/A"}
                                </p>
                                <p className="text-black mb-2">
                                  <strong>Audio Score: </strong> {testScore.audioScore ? `${testScore.audioScore.toFixed(2)}/100` : "N/A"}
                                </p>
                                <p className="text-black mb-2">
                                  <strong>Text Score: </strong> {testScore.textScore ? `${testScore.textScore.toFixed(2)}/100` : "N/A"}
                                </p>
                                <p className="text-black mb-2">
                                  <strong>Video Score: </strong> {testScore.videoScore ? `${testScore.videoScore.toFixed(2)}/100` : "N/A"}
                                </p>
                                <p className="text-black mb-2">
                                  <strong>Combined Score: </strong> {testScore.combinedScore ? `${testScore.combinedScore.toFixed(2)}/100` : "N/A"}
                                </p>
                                {assessmentSession.reportStatus === "completed" && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={async () => {
                                      const url = await handleReportLink(assessmentSession._id);
                                      if (url && url !== "#") {
                                        window.open(url, "_blank");
                                      }
                                    }}
                                    aria-label="View assessment report"
                                  >
                                    <FontAwesomeIcon icon={faFilePdf} className="me-1" />
                                    View Report
                                  </Button>
                                )}
                              </div>
                            )}
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
      <ToastContainer position="top-center" />
    </div>
  );
}

export default ResponseTable;


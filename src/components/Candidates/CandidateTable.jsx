
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation } from 'react-router-dom';
import {
  faMagnifyingGlass, faRotateRight,
  faComment, faFileAlt, faVideo, faCode,
  faChevronDown, faChevronUp, faStar,
  faDownload, faEye, faGraduationCap,
  faBriefcase, faUserTie, faBuilding,
  faIdBadge, faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import '../Dashboard/UploadDocuments.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Spinner, Alert, Dropdown, Badge } from 'react-bootstrap';
import { io } from "socket.io-client";
import { faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { axiosInstance } from "../../axiosUtils";

function CandidateTable() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [expandedLists, setExpandedLists] = useState({});
  const [allSelected, setAllSelected] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testScores, setTestScores] = useState([]);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationStatus, setGenerationStatus] = useState({
    loading: false,
    error: null,
    success: false,
    message: null
  });
  const location = useLocation();
  const initialViewMode = location.state?.view || 'all';
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [historicalCandidates, setHistoricalCandidates] = useState([]);
  const [recommendedCandidates, setRecommendedCandidates] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    skills: [],
    designation: [],
    degree: [],
    company_names: [],
    jobType: [],
    job_title: [],
  });

  const filterIcons = {
    jobType: faUserTie,
    skills: faCode,
    designation: faBriefcase,
    degree: faGraduationCap,
    company_names: faBuilding,
    job_title: faIdBadge,
  };

  const [showModal, setShowModal] = useState({});

  useEffect(() => {
    const socket = io("");
    socket.on("apiResponseUpdated", (newResponse) => {
      setCandidates((prevCandidates) => {
        const exists = prevCandidates.some(
          (candidate) =>
            candidate.resumeId === newResponse.resumeId &&
            candidate.jobDescriptionId === newResponse.jobDescriptionId
        );
        if (exists) {
          console.log("Duplicate record detected and ignored:", newResponse);
          return prevCandidates;
        }
        return [newResponse, ...prevCandidates];
      });
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesRes, scoresRes] = await Promise.all([
          axiosInstance.get('/api/candidate-filtering'),
          axiosInstance.get('/api/test-results')
        ]);
        const uniqueCandidates = candidatesRes.data.filter((member, index, self) => {
          return (
            index ===
            self.findIndex(
              (c) =>
                c.resumeId === member.resumeId &&
                c.jobDescriptionId === member.jobDescriptionId
            )
          );
        }).map((member) => ({
          ...member,
          matchingResult: member.matchingResult?.[0] ? [{
            "Resume Data": member.matchingResult[0]["Resume Data"],
            Analysis: {
              "Matching Score": member.matchingResult[0].Analysis?.["Matching Score"] || 0,
              "Matched Skills": member.matchingResult[0].Analysis?.["Matched Skills"] || [],
              "Unmatched Skills": member.matchingResult[0].Analysis?.["Unmatched Skills"] || [],
              "Matched Skills Percentage": member.matchingResult[0].Analysis?.["Matched Skills Percentage"] || 0,
              "Unmatched Skills Percentage": member.matchingResult[0].Analysis?.["Unmatched Skills Percentage"] || 0,
              Strengths: member.matchingResult[0].Analysis?.Strengths || [],
              Recommendations: member.matchingResult[0].Analysis?.Recommendations || [],
              "Required Industrial Experience": member.matchingResult[0].Analysis?.["Required Industrial Experience"] || "N/A",
              "Candidate Industrial Experience": member.matchingResult[0].Analysis?.["Candidate Industrial Experience"] || "N/A",
              "Required Domain Experience": member.matchingResult[0].Analysis?.["Required Domain Experience"] || "N/A",
              "Candidate Domain Experience": member.matchingResult[0].Analysis?.["Candidate Domain Experience"] || "N/A",
            }
          }] : []
        }));
        setCandidates(uniqueCandidates);
        setMembers(uniqueCandidates);
        setFilteredMembers(uniqueCandidates);
        setTestScores(scoresRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSegmentedData = async () => {
      try {
        const response = await axiosInstance.get('/api/candidates/segmented');
        setRecentCandidates(response.data.recent);
        setHistoricalCandidates(response.data.history);
      } catch (error) {
        console.error('Error fetching segmented candidates:', error);
        setRecentCandidates([]);
        setHistoricalCandidates([]);
      }
    };
    fetchSegmentedData();
  }, []);

  const fetchRecommendationsConsentOnly = async () => {
    try {
      const res = await axiosInstance.get("/api/recommendations/candidates");
      const data = res.data.map((member) => ({
        ...member,
        matchingResult: member.matchingResult?.[0] ? [{
          "Resume Data": member.matchingResult[0]["Resume Data"],
          Analysis: {
            "Matching Score": member.matchingResult[0].Analysis?.["Matching Score"] || 0,
            "Matched Skills": member.matchingResult[0].Analysis?.["Matched Skills"] || [],
            "Unmatched Skills": member.matchingResult[0].Analysis?.["Unmatched Skills"] || [],
            "Matched Skills Percentage": member.matchingResult[0].Analysis?.["Matched Skills Percentage"] || 0,
            "Unmatched Skills Percentage": member.matchingResult[0].Analysis?.["Unmatched Skills Percentage"] || 0,
            Strengths: member.matchingResult[0].Analysis?.Strengths || [],
            Recommendations: member.matchingResult[0].Analysis?.Recommendations || [],
            "Required Industrial Experience": member.matchingResult[0].Analysis?.["Required Industrial Experience"] || "N/A",
            "Candidate Industrial Experience": member.matchingResult[0].Analysis?.["Candidate Industrial Experience"] || "N/A",
            "Required Domain Experience": member.matchingResult[0].Analysis?.["Required Domain Experience"] || "N/A",
            "Candidate Domain Experience": member.matchingResult[0].Analysis?.["Candidate Domain Experience"] || "N/A",
          }
        }] : []
      }));
      setRecommendedCandidates(data);
      setMembers(data);
      setFilteredMembers([]);
    } catch (error) {
      console.error('Failed to fetch recommended candidates:', error.message);
    }
  };

  useEffect(() => {
    if (viewMode === 'recommended') {
      fetchRecommendationsConsentOnly();
    } else {
      setFilteredMembers(
        viewMode === 'recent'
          ? recentCandidates
          : viewMode === 'history'
            ? historicalCandidates
            : candidates
      );
      setSelectedFilters({
        skills: [],
        designation: [],
        degree: [],
        company_names: [],
        jobType: [],
        job_title: [],
      });
      setAllSelected({});
    }
  }, [viewMode, candidates, recentCandidates, historicalCandidates]);

  const sendTestLink = async (candidateEmail, jobTitle, resumeId, jdId) => {
    setShowGenerationModal(true);
    setGenerationStatus({
      loading: true,
      error: null,
      success: false,
      message: 'Checking your assessment limits...'
    });
    try {
      const userRes = await axiosInstance.get('/user', { withCredentials: true });
      const user = userRes.data.user;
      if (!user.isAdmin && user.subscription?.limits?.assessments) {
        const remainingAssessments = user.subscription.limits.assessments - (user.usage?.assessments || 0);
        if (remainingAssessments <= 0) {
          throw new Error(`You've reached your assessment limit (${user.subscription.limits.assessments})`);
        }
      }
      setGenerationStatus(prev => ({
        ...prev,
        message: 'Generating MCQ questions...'
      }));
      const mcqResponse = await axiosInstance.post(
        '/api/generate-questions',
        { resumeId, jobDescriptionId: jdId }
      );
      if (!mcqResponse.data.success) {
        throw new Error(mcqResponse.data.error || 'MCQ question generation failed');
      }
      setGenerationStatus(prev => ({
        ...prev,
        message: 'Generating voice questions...'
      }));
      const voiceResponse = await axiosInstance.post(
        '/api/generate-voice-questions',
        { jobDescriptionId: jdId }
      );
      if (!voiceResponse.data.success) {
        throw new Error(voiceResponse.data.error || 'Voice question generation failed');
      }
      setGenerationStatus(prev => ({
        ...prev,
        message: 'Sending assessment email...'
      }));
      const sessionResponse = await axiosInstance.post(
        '/api/send-test-link',
        {
          candidateEmail,
          jobTitle,
          resumeId,
          jobDescriptionId: jdId,
          questions: mcqResponse.data.questions,
          voiceQuestions: voiceResponse.data.questions
        }
      );
      if (!sessionResponse.data.success) {
        throw new Error(sessionResponse.data.error || 'Email sending failed');
      }
      setGenerationStatus({
        loading: false,
        error: null,
        success: true,
        message: `Assessment sent to ${candidateEmail}`,
        testLink: sessionResponse.data.testLink
      });
      setTimeout(() => {
        setShowGenerationModal(false);
        const fetchCandidates = async () => {
          try {
            const response = await axiosInstance.get("/api/candidate-filtering");
            const data = response.data;
            const uniqueCandidates = data.filter((member, index, self) => {
              return (
                index ===
                self.findIndex(
                  (c) =>
                    c.resumeId === member.resumeId &&
                    c.jobDescriptionId === member.jobDescriptionId
                )
              );
            }).map((member) => ({
              ...member,
              matchingResult: member.matchingResult?.[0] ? [{
                "Resume Data": member.matchingResult[0]["Resume Data"],
                Analysis: {
                  "Matching Score": member.matchingResult[0].Analysis?.["Matching Score"] || 0,
                  "Matched Skills": member.matchingResult[0].Analysis?.["Matched Skills"] || [],
                  "Unmatched Skills": member.matchingResult[0].Analysis?.["Unmatched Skills"] || [],
                  "Matched Skills Percentage": member.matchingResult[0].Analysis?.["Matched Skills Percentage"] || 0,
                  "Unmatched Skills Percentage": member.matchingResult[0].Analysis?.["Unmatched Skills Percentage"] || 0,
                  Strengths: member.matchingResult[0].Analysis?.Strengths || [],
                  Recommendations: member.matchingResult[0].Analysis?.Recommendations || [],
                  "Required Industrial Experience": member.matchingResult[0].Analysis?.["Required Industrial Experience"] || "N/A",
                  "Candidate Industrial Experience": member.matchingResult[0].Analysis?.["Candidate Industrial Experience"] || "N/A",
                  "Required Domain Experience": member.matchingResult[0].Analysis?.["Required Domain Experience"] || "N/A",
                  "Candidate Domain Experience": member.matchingResult[0].Analysis?.["Candidate Domain Experience"] || "N/A",
                }
              }] : []
            }));
            setCandidates(uniqueCandidates);
            setMembers(uniqueCandidates);
            setFilteredMembers(uniqueCandidates);
          } catch (error) {
            console.error("Error fetching candidate data:", error.message);
          }
        };
        fetchCandidates();
      }, 10000);
    } catch (error) {
      console.error('Assessment error:', error);
      let errorMessage = 'Failed to send assessment';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setGenerationStatus({
        loading: false,
        error: errorMessage,
        success: false,
        message: null,
        testLink: error.response?.data?.testLink
      });
    }
  };

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
        const experienceStr = member.matchingResult[0]?.["Resume Data"]?.experience || "0 years";
        const experienceYears = parseFloat(experienceStr);
        const isFresher = selectedFilters.jobType.includes("Fresher") && experienceYears === 0;
        const isExperienced = selectedFilters.jobType.includes("Experienced") && experienceYears > 0;
        return isFresher || isExperienced;
      });
    }
    if (selectedFilters.degree.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.degree.some((degree) =>
          (member.matchingResult[0]?.["Resume Data"]?.degree || [])
            .join(", ")
            .toLowerCase()
            .includes(degree.toLowerCase())
        )
      );
    }
    if (selectedFilters.company_names.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.company_names.some((company_name) =>
          (member.matchingResult[0]?.["Resume Data"]?.company_names || [])
            .join(", ")
            .toLowerCase()
            .includes(company_name.toLowerCase())
        )
      );
    }
    if (selectedFilters.skills.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.skills.some((skill) =>
          (member.matchingResult[0]?.["Resume Data"]?.skills || [])
            .join(", ")
            .toLowerCase()
            .includes(skill.toLowerCase())
        )
      );
    }
    if (selectedFilters.job_title.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.job_title.some((title) =>
          (member.matchingResult[0]?.["Resume Data"]?.["Job Title"] || "")
            .toLowerCase()
            .includes(title.toLowerCase())
        )
      );
    }
    if (selectedFilters.designation.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.designation.some((designation) =>
          (member.matchingResult[0]?.["Resume Data"]?.designation || [])
            .join(", ")
            .toLowerCase()
            .includes(designation.toLowerCase())
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
          members.map(
            (m) => m.matchingResult[0]?.["Resume Data"]?.["Job Title"] || ""
          ).filter(Boolean)
        ),
      ];
    }
    return [
      ...new Set(
        members.flatMap((member) =>
          (member.matchingResult[0]?.["Resume Data"]?.[key] || []).flat()
        ).filter(Boolean)
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
      job_title: [],
    });
    setAllSelected({});
    if (viewMode === 'recommended') {
      setFilteredMembers([]);
    } else {
      setFilteredMembers(members);
    }
  };

  const handleResumeLink = async (resumeId) => {
    try {
      if (!resumeId) {
        console.error('No resume ID provided');
        return { success: false, error: 'No resume selected' };
      }
      const response = await axiosInstance.get(`/api/resumes/${resumeId}`);
      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Failed to get resume URL');
      }
      return {
        success: true,
        url: response.data.url,
        filename: response.data.filename
      };
    } catch (error) {
      console.error('Error getting resume URL:', {
        error: error.response?.data || error.message,
        resumeId
      });
      return { 
        success: false,
        error: error.response?.data?.error || 'Failed to access resume',
        details: process.env.NODE_ENV === 'development' 
          ? error.response?.data?.details || error.message 
          : undefined
      };
    }
  };

  const handlejdLink = async (jobDescriptionId) => {
    try {
      if (!jobDescriptionId) return '#';
      const response = await axiosInstance.get(`/api/job-descriptions/${jobDescriptionId}`);
      return response.data?.url || '#';
    } catch (error) {
      console.error('Error getting resume URL:', error);
      return '#';
    }
  };

  const calculateTotalExperience = (experiences) => {
    if (!experiences || !Array.isArray(experiences)) return "0 years";
    return experiences.reduce((total, exp) => {
      const match = exp.duration?.match(/(\d+\.?\d*)\s*(?:years?|yrs?)/i);
      return total + (match ? parseFloat(match[1]) : 0);
    }, 0) + " years";
  };

  const toggleExpand = (index, type) => {
    setExpandedLists((prev) => ({
      ...prev,
      [`${index}-${type}`]: !prev[`${index}-${type}`],
    }));
  };

  const renderListWithExpand = (items, index, type, maxItems = 3) => {
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
  };

  const toggleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) return (
    <div className="text-center p-5">
      <Spinner animation="border" />
      <p>Loading candidate data...</p>
    </div>
  );

  const renderViewToggle = () => (
    <div className="view-toggle mb-1 mt-1 d-flex justify-content-center">
      <Button 
        variant={viewMode === 'all' ? 'primary' : 'outline-primary'}
        onClick={() => setViewMode('all')}
        className="me-2 text-black"
        style={{ backgroundColor: 'rgb(63 51 196 / 31%)' }}
      >
        All Applicants 
      </Button>
      <Button 
        variant={viewMode === 'recent' ? 'primary' : 'outline-primary'}
        onClick={() => setViewMode('recent')}
        className="me-2 text-black"
        style={{ backgroundColor: 'rgb(63 51 196 / 31%)' }}
      >
        Latest Profiles
        {recentCandidates.length > 0 && (
          <Badge bg="danger" className="ms-2">{recentCandidates.length}</Badge>
        )}
      </Button>
      <Button 
        variant={viewMode === 'recommended' ? 'primary' : 'outline-primary'}
        onClick={() => {
          setViewMode('recommended');
          fetchRecommendationsConsentOnly();
        }}
        className="text-black"
        style={{ backgroundColor: 'rgb(63 51 196 / 31%)' }}
      >
        Recommended Profiles
        {recommendedCandidates.length > 0 && (
          <Badge bg="info" className="ms-2">{recommendedCandidates.length}</Badge>
        )}
      </Button>
    </div>
  );

  const candidatesToDisplay = viewMode === 'recommended'
    ? filteredMembers
    : viewMode === 'recent'
      ? recentCandidates
      : viewMode === 'history'
        ? historicalCandidates
        : filteredMembers;

  const sortedCandidatesToDisplay = [...candidatesToDisplay].sort((a, b) => {
    const aMatch = a.matchingResult?.[0]?.["Resume Data"]?.["Matching Percentage"] || 0;
    const bMatch = b.matchingResult?.[0]?.["Resume Data"]?.["Matching Percentage"] || 0;
    return bMatch - aMatch;
  });

  return (
    <div className="card border-0 responsedisplay shadow-sm">
      {renderViewToggle()}
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
              <div style={{ backgroundColor: 'rgb(215 211 255 / 82%)', borderRadius: '8px' }}>
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
                  <Button variant="secondary" 
                    onClick={() => {
                      handleFilterChange(filter, []);
                      if (viewMode === 'recommended') {
                        setFilteredMembers([]);
                      } else {
                        setFilteredMembers(members);
                      }
                    }}
                  >
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
      <div className="container-fluid mt-4 px-0">
        <Modal show={showGenerationModal} onHide={() => setShowGenerationModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Preparing Assessment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {generationStatus.loading && (
              <div className="text-center">
                <Spinner animation="border" />
                <p>{generationStatus.message || 'Processing...'}</p>
              </div>
            )}
            {generationStatus.error && (
              <Alert variant="danger">
                <Alert.Heading>Error</Alert.Heading>
                <p>{generationStatus.error}</p>
              </Alert>
            )}
            {generationStatus.success && (
              <Alert variant="success">
                <Alert.Heading>Success!</Alert.Heading>
                <p>{generationStatus.message}</p>
              </Alert>
            )}
          </Modal.Body>
        </Modal>
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table candidate-table-header">
              <tr>
                <th>Rank</th>
                <th>Candidate</th>
                <th>Job Title</th>
                <th>Experience</th>
                <th>Match %</th>
                <th>View pdf</th>
                <th>Interview Schedular</th>
                <th>Details</th>
                <th>Status</th>
                <th>Score</th>
                <th>Send Test-Link</th>
              </tr>
            </thead>
            <tbody>
              {sortedCandidatesToDisplay.map((result, index) => {
                const resumeData = result.matchingResult?.[0]?.["Resume Data"] || {};
                const analysis = result.matchingResult?.[0]?.Analysis || {};
                const email = resumeData.email || "N/A";
                const session = result.assessmentSession;
                const testScore = result.testScore;
                const isRecent = recentCandidates.some(rc => rc._id === result._id);
                const getStatusBadge = () => {
                  if (!session) return <span className="badge bg-secondary">Not Sent</span>;
                  switch (session.status) {
                    case 'completed': return <span className="badge bg-success">Completed</span>;
                    case 'in-progress': return <span className="badge bg-warning">In Progress</span>;
                    default: return <span className="badge bg-info">Pending</span>;
                  }
                };
                return (
                  <React.Fragment key={result._id || index}>
                    <tr className={`${expandedRow === result._id ? "expanded-row" : ""} ${isRecent ? "recent-candidate" : ""}`}>
                      <td>
                        {isRecent && viewMode !== 'recent' && (
                          <Badge bg="success" className="me-2">New</Badge>
                        )}
                        <span className="badge bg-white text-dark">{index + 1}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div>
                            <h6 className="mb-0">{resumeData.name || "N/A"}</h6>
                            <small className="text-muted">{resumeData.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{resumeData?.["Job Title"] || "N/A"}</td>
                      <td>{resumeData.experience || calculateTotalExperience(resumeData.total_experience) || "0 years"}</td>
                      <td>
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
                          <span className="ms-2 fw-bold">{resumeData["Matching Percentage"] || analysis["Matching Score"] || 0}%</span>
                        </div>
                        {result.candidateConsent?.allowedToShare && (
                          <span className="badge bg-success">Shared</span>
                        )}
                      </td>
                      <td>
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
                            <Dropdown.Menu style={{ backgroundColor: 'rgb(215 211 255 / 82%)' }}>
                              <Dropdown.Item 
                                as="a" 
                                href="#" 
                                onClick={async (e) => {
                                  e.preventDefault();
                                  const { success, url, error } = await handleResumeLink(result.resumeId?._id);
                                  if (success && url) {
                                    window.open(url, '_blank');
                                  } else {
                                    toast.error(error || 'Failed to open resume');
                                  }
                                }}
                                className="custom-dropdown-item"
                              >
                                <FontAwesomeIcon icon={faEye} className="me-2 text-dark" />
                                View Resume
                              </Dropdown.Item>
                              <Dropdown.Item 
                                as="a" 
                                href="#" 
                                onClick={async (e) => {
                                  e.preventDefault();
                                  try {
                                    const response = await axiosInstance.get(
                                      `/api/resumes/${result.resumeId?._id}?download=true`
                                    );
                                    if (response.data?.url) {
                                      window.location.href = response.data.url;
                                    }
                                  } catch (error) {
                                    console.error('Download failed:', error);
                                    toast.error('Failed to initiate download');
                                  }
                                }}
                                className="custom-dropdown-item"
                              >
                                <FontAwesomeIcon icon={faDownload} className="me-2 text-dark" />
                                Download Resume
                              </Dropdown.Item>
                              <Dropdown.Item 
                                as="a" 
                                href="#" 
                                onClick={async (e) => {
                                  e.preventDefault();
                                  const url = await handlejdLink(result.jobDescriptionId?._id);
                                  if (url && url !== '#') {
                                    window.open(url, '_blank');
                                  }
                                }}
                                className="custom-dropdown-item"
                              >
                                <FontAwesomeIcon icon={faEye} className="me-2 text-dark" />
                                View JD
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="outline-none"
                            size="sm"
                            className="custom-dropdown text-white border-0"
                            style={{ backgroundColor: '#56629cb8' }}
                          >
                            <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                            Interview
                          </Dropdown.Toggle>
                          <Dropdown.Menu style={{ backgroundColor: 'rgb(215 211 255 / 82%)' }}>
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
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 text-white"
                          onClick={() => toggleExpandRow(result._id)}
                          title="Toggle Details"
                          style={{ backgroundColor: 'rgb(63 51 196 / 31%)' }}
                        >
                          Details
                          <FontAwesomeIcon icon={expandedRow === result._id ? faChevronUp : faChevronDown} />
                        </button>
                      </td>
                      <td>{getStatusBadge()}</td>
                      <td>
                        {testScore ? (
                          <Dropdown 
                            onClick={(e) => e.stopPropagation()}
                            className="score-dropdown"
                          >
                            <Dropdown.Toggle 
                              variant="outline-primary" 
                              id={`score-dropdown-${result._id}`}
                              className="d-flex align-items-center justify-content-between"
                              style={{ backgroundColor: 'rgb(250 250 255 / 70%)' }}
                            >
                              <span className="fw-bold">
                                {testScore.combinedScore !== undefined ? `${testScore.combinedScore}%` : 'N/A'}
                              </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ backgroundColor: 'rgb(215 211 255 / 95%)' }}>
                              <Dropdown.Header>Score Breakdown</Dropdown.Header>
                              <Dropdown.ItemText className="d-flex justify-content-between">
                                <span>MCQ Score:</span>
                                <span className="fw-bold">{testScore.score || 0}%</span>
                              </Dropdown.ItemText>
                              <Dropdown.ItemText className="d-flex justify-content-between">
                                <span>Audio Score:</span>
                                <span className="fw-bold">{testScore.audioScore ? Math.round(testScore.audioScore) : 0}%</span>
                              </Dropdown.ItemText>
                              <Dropdown.ItemText className="d-flex justify-content-between">
                                <span>Text Score:</span>
                                <span className="fw-bold">{testScore.textScore ? Math.round(testScore.textScore) : 0}%</span>
                              </Dropdown.ItemText>
                              <Dropdown.ItemText className="d-flex justify-content-between">
                                <span>Video Score:</span>
                                <span className="fw-bold">{testScore.videoScore || 0}%</span>
                              </Dropdown.ItemText>
                              <Dropdown.Divider />
                              <Dropdown.ItemText className="d-flex justify-content-between">
                                <span className="fw-bold">Combined:</span>
                                <span className="fw-bold text-primary">
                                  {testScore.combinedScore !== undefined ? `${testScore.combinedScore}%` : 'Calculating...'}
                                </span>
                              </Dropdown.ItemText>
                            </Dropdown.Menu>
                          </Dropdown>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td>
                        {!session || session.status === 'pending' ? (
                          <button
                            className="btn btn-sm btn-primary"
                            style={{ backgroundColor: '#56629cb8' }}
                            onClick={() => sendTestLink(
                              email,
                              resumeData["Job Title"],
                              result.resumeId?._id,
                              result.jobDescriptionId?._id
                            )}
                          >
                            Send Assessment 
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-outline-secondary" disabled>
                            Sent
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedRow === result._id && (
                      <tr className="expanded-content">
                        <td colSpan="11" style={{ backgroundColor: 'rgb(213 211 254 / 68%)' }}>
                          <div className="p-4 rounded shadow-sm text-white" style={{ backgroundColor: 'rgb(213 211 254 / 68%)' }}>
                            <div className="row g-4">
                              <div className="col-md-6">
                                <h6 className="mb-3 text-black text-decoration-underline"><strong>Contact Information</strong></h6>
                                <p className="text-black mb-2">
                                  <strong>Mobile: </strong> {resumeData.mobile_number || "N/A"}
                                </p>
                                <p className="text-black mb-2">
                                  <strong>Email: </strong>
                                  {resumeData.email ? (
                                    <span className="badge bg-black">{resumeData.email}</span>
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
                                <h6 className="mb-3 text-black text-decoration-underline"><strong>Professional Details</strong></h6>
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
                                <h6 className="mb-3 text-black text-decoration-underline"><strong>Skills</strong></h6>
                                <div className="d-flex flex-wrap gap-2">
                                  {resumeData.skills?.length ? (
                                    resumeData.skills.map((skill, i) => (
                                      <span key={i} className="badge bg-black">{skill}</span>
                                    ))
                                  ) : (
                                    <span className="text-muted">No skills available</span>
                                  )}
                                </div>
                              </div>
                              <div className="col-md-6">
                                <h6 className="mb-3 text-black text-decoration-underline"><strong>Previous Companies</strong></h6>
                                {renderListWithExpand(resumeData.company_names || [], index, "company_names")}
                              </div>
                              <div className="col-12">
                                <h6 className="mb-3 text-black text-decoration-underline"><strong>Experience</strong></h6>
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
                                <h6 className="mb-3 text-black text-decoration-underline"><strong>Analysis</strong></h6>
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
    </div>
  );
}

export default CandidateTable;
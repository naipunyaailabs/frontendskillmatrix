import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Routes, Route, Link,useLocation  } from 'react-router-dom';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { 
  FaEdit, FaSave, FaTrash, FaCheck, FaTimes, 
  FaUsers, FaUserClock, FaUserCheck, FaUserShield,
  FaChartPie, FaList, FaUserCog, FaSignOutAlt,FaUserTie
} from 'react-icons/fa';
import { 
  Card, Table, Button, Form, Container, Row, Col, 
  Nav, Navbar, Badge, Alert, Spinner 
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { axiosInstance } from '../../axiosUtils';
import HRManagement from './HRManagement';

import "./Admin.css"


const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

    // Add this effect to sync activeTab with current route
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    setActiveTab(path || 'dashboard');
  }, [location]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/admin/dashboard', { withCredentials: true });
        setUsers(res.data.users);
        setPendingUsers(res.data.pendingUsers);
        setStats(res.data.stats);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  // Add this helper function
  const getAccessDisplay = (user) => {
    if (user.isAdmin) return 'Admin (Unlimited)';
    
    if (user.subscription.plan === 'paid') {
      return `Paid until ${new Date(user.subscription.expiresAt).toLocaleDateString()}`;
    }
    
    if (user.subscription.plan === 'free') {
      return 'Free (Unlimited)';
    }
    
    // For trial users
    return `Trial until ${new Date(user.subscription.expiresAt).toLocaleDateString()}`;
  };
  const handleApproveUser = async (userId) => {
    confirmAlert({
      title: 'Approve User',
      message: 'Are you sure you want to approve this user?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const res = await axiosInstance.post(
                `/admin/approve-user/${userId}`,
                {},
                { withCredentials: true }
              );
              toast.success(res.data.message);
              // Update the user list
              const updatedPending = pendingUsers.filter(u => u._id !== userId);
              const approvedUser = pendingUsers.find(u => u._id === userId);
              setPendingUsers(updatedPending);
              setUsers([...users, { ...approvedUser, isApproved: true }]);
              // Update stats
              setStats({
                ...stats,
                pendingApproval: updatedPending.length,
                activeUsers: stats.activeUsers + 1
              });
            } catch (error) {
              toast.error(error.response?.data?.message || 'Failed to approve user');
            }
          }
        },
        { label: 'No' }
      ]
    });
  };

  const handleRejectUser = (userId) => {
    confirmAlert({
      title: 'Reject User',
      message: 'Are you sure you want to reject this user?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const res = await axiosInstance.delete(
                `/admin/delete-user/${userId}`,
                { withCredentials: true }
              );
              toast.success(res.data.message);
              const updatedPending = pendingUsers.filter(u => u._id !== userId);
              setPendingUsers(updatedPending);
              setStats({
                ...stats,
                pendingApproval: updatedPending.length
              });
            } catch (error) {
              toast.error(error.response?.data?.message || 'Failed to reject user');
            }
          }
        },
        { label: 'No' }
      ]
    });
  };

  const DashboardHome = () => (
    <div>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-white bg-primary">
            <Card.Body>
              <Card.Title><FaUsers /> Total Users</Card.Title>
              <Card.Text className="display-4">
                {stats?.totalUsers || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-warning">
            <Card.Body>
              <Card.Title><FaUserClock /> Pending Approval</Card.Title>
              <Card.Text className="display-4">
                {stats?.pendingApproval || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-success">
            <Card.Body>
              <Card.Title><FaUserCheck /> Active Users</Card.Title>
              <Card.Text className="display-4">
                {stats?.activeUsers || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-white bg-danger">
            <Card.Body>
              <Card.Title><FaUserShield /> Admin Users</Card.Title>
              <Card.Text className="display-4">
                {stats?.adminUsers || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {pendingUsers.length > 0 && (
        <Card className="mb-4">
          <Card.Header className="bg-warning text-white">
            <FaUserClock /> Users Pending Approval
          </Card.Header>
          <Card.Body>
            <Table striped hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user._id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.companyName}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleApproveUser(user._id)}
                      >
                        <FaCheck /> Approve
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleRejectUser(user._id)}
                      >
                        <FaTimes /> Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

       <Card>
    <Card.Header className="bg-primary text-white">
      <FaUsers /> All Users
    </Card.Header>
    <Card.Body>
     <Table striped hover responsive>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Company</th>
          <th>Status</th>
          <th>Access Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user._id}>
            <td>{user.fullName}</td>
            <td>{user.email}</td>
            <td>{user.companyName}</td>
            <td>
              {user.isApproved ? (
                <Badge bg="success">Approved</Badge>
              ) : (
                <Badge bg="warning">Pending</Badge>
              )}
            </td>
            <td>
              {getAccessDisplay(user)}
            </td>
            <td>
              <Button 
                as={Link} 
                to={`/dashboard/admin/users/${user._id}`}
                variant="outline-primary" 
                size="sm"
              >
                <FaUserCog /> Manage
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
       <div className="p-3">
        
        <Button 
          variant="danger" 
          className="w-10 mt-3"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="me-2" /> Logout
        </Button>


        </div>
    </Card.Body>
  </Card>
    </div>
  );

  const UserManagement = () => (
    <div>
      <h2>User Management</h2>
      {/* Your existing user management table */}
    </div>
  );

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <div className="d-flex">
    
      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px' }}>
        <Navbar bg="light" expand="lg" className="mb-4">
          <Container fluid>
            <Navbar.Brand>Admin Dashboard</Navbar.Brand>

<Nav.Item>
  <Nav.Link 
    as={Link}
    to="hr-management"  // Relative path
    active={activeTab === 'hr-management'}
    onClick={() => setActiveTab('hr-management')}
  >
    <FaUserTie /> HR Management
  </Nav.Link>
</Nav.Item>
          </Container>
        </Navbar>

        <Container fluid>
         <Routes>
  <Route index element={<DashboardHome />} />
  <Route path="dashboard" element={<DashboardHome />} />
  <Route path="users" element={<UserManagement />} />
  <Route path="hr-management" element={<HRManagement />} />

            <Route path="/pending" element={
              <Card>
                <Card.Header className="bg-warning text-white">
                  <FaUserClock /> Pending Approvals
                </Card.Header>
                <Card.Body>

                  {pendingUsers.length === 0 ? (
                    <Alert variant="info">No users pending approval</Alert>
                  ) : (
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Company</th>
                          <th>Registered On</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingUsers.map(user => (
                          <tr key={user._id}>
                            <td>{user.fullName}</td>
                            <td>{user.email}</td>
                            <td>{user.companyName}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                              <Button 
                                variant="success" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleApproveUser(user._id)}
                              >
                                <FaCheck /> Approve
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleRejectUser(user._id)}
                              >
                                <FaTimes /> Reject
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      
                    </Table>
                  )}
                </Card.Body>
              </Card>
            } />
          </Routes>
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;
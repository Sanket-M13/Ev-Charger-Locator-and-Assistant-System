import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tab, Tabs } from 'react-bootstrap';
import { FiUser, FiMail, FiLock, FiTruck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    vehicleNumber: '',
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  // Sample vehicle data
  const sampleVehicleData = {
    Car: [
      { id: 1, name: 'Tata', models: [{ id: 1, name: 'Nexon EV' }, { id: 2, name: 'Tigor EV' }] },
      { id: 2, name: 'MG', models: [{ id: 3, name: 'ZS EV' }, { id: 4, name: 'Comet EV' }] },
      { id: 3, name: 'Hyundai', models: [{ id: 5, name: 'Kona Electric' }, { id: 6, name: 'Ioniq 5' }] }
    ],
    Bike: [
      { id: 6, name: 'Ather', models: [{ id: 11, name: '450X' }, { id: 12, name: '450 Plus' }] },
      { id: 7, name: 'TVS', models: [{ id: 13, name: 'iQube' }, { id: 14, name: 'X21' }] },
      { id: 8, name: 'Bajaj', models: [{ id: 15, name: 'Chetak' }] }
    ]
  };

  const [vehicleBrands, setVehicleBrands] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);

  useEffect(() => {
    // Load user data from API
    loadUserData();
  }, []);

  useEffect(() => {
    if (profileData.vehicleType && sampleVehicleData[profileData.vehicleType]) {
      setVehicleBrands(sampleVehicleData[profileData.vehicleType]);
    } else {
      setVehicleBrands([]);
      setVehicleModels([]);
    }
  }, [profileData.vehicleType]);

  useEffect(() => {
    if (profileData.vehicleBrand) {
      const selectedBrand = vehicleBrands.find(b => b.name === profileData.vehicleBrand);
      if (selectedBrand && selectedBrand.models) {
        setVehicleModels(selectedBrand.models);
      }
    } else {
      setVehicleModels([]);
    }
  }, [profileData.vehicleBrand, vehicleBrands]);

  const loadUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          vehicleNumber: userData.vehicleNumber || '',
          vehicleType: userData.vehicleType || '',
          vehicleBrand: userData.vehicleBrand || '',
          vehicleModel: userData.vehicleModel || ''
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        // Update localStorage userData
        const vehicleData = {
          vehicleType: profileData.vehicleType,
          vehicleBrand: profileData.vehicleBrand,
          vehicleModel: profileData.vehicleModel,
          vehicleNumber: profileData.vehicleNumber
        };
        localStorage.setItem('userData', JSON.stringify(vehicleData));
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <Container>
        <Row>
          <Col lg={8} className="mx-auto">
            <div className="page-header">
              <h1 className="page-title">
                <FiUser className="me-2" />
                My Profile
              </h1>
              <p className="page-subtitle">Manage your account settings</p>
            </div>

            <Card className="profile-card">
              <Card.Body>
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="profile-tabs"
                >
                  <Tab eventKey="profile" title="Profile Information">
                    <div className="tab-content-wrapper">
                      <Form onSubmit={handleProfileSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name</Form.Label>
                          <div className="input-group">
                            <FiUser className="input-icon" />
                            <Form.Control
                              type="text"
                              name="name"
                              value={profileData.name}
                              onChange={handleProfileChange}
                              className="profile-input"
                              required
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Email Address</Form.Label>
                          <div className="input-group">
                            <FiMail className="input-icon" />
                            <Form.Control
                              type="email"
                              name="email"
                              value={profileData.email}
                              onChange={handleProfileChange}
                              className="profile-input"
                              required
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="profile-input"
                          />
                        </Form.Group>

                        {user?.role !== 'StationMaster' && (
                          <>
                            <h5 className="mb-3">Vehicle Information</h5>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Vehicle Number</Form.Label>
                              <div className="input-group">
                                <FiTruck className="input-icon" />
                                <Form.Control
                                  type="text"
                                  name="vehicleNumber"
                                  value={profileData.vehicleNumber}
                                  onChange={handleProfileChange}
                                  className="profile-input"
                                  placeholder="e.g., MH12-AB-1234"
                                />
                              </div>
                            </Form.Group>

                            <Row>
                              <Col md={4}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Vehicle Type</Form.Label>
                                  <Form.Select
                                    name="vehicleType"
                                    value={profileData.vehicleType}
                                    onChange={handleProfileChange}
                                    className="profile-input"
                                  >
                                    <option value="">Select Type</option>
                                    <option value="Car">Car</option>
                                    <option value="Bike">Bike</option>
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                              <Col md={4}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Vehicle Brand</Form.Label>
                                  <Form.Select
                                    name="vehicleBrand"
                                    value={profileData.vehicleBrand}
                                    onChange={handleProfileChange}
                                    className="profile-input"
                                    disabled={!profileData.vehicleType}
                                  >
                                    <option value="">Select Brand</option>
                                    {vehicleBrands.map(brand => (
                                      <option key={brand.id} value={brand.name}>{brand.name}</option>
                                    ))}
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                              <Col md={4}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Vehicle Model</Form.Label>
                                  <Form.Select
                                    name="vehicleModel"
                                    value={profileData.vehicleModel}
                                    onChange={handleProfileChange}
                                    className="profile-input"
                                    disabled={!profileData.vehicleBrand}
                                  >
                                    <option value="">Select Model</option>
                                    {vehicleModels.map(model => (
                                      <option key={model.id} value={model.name}>{model.name}</option>
                                    ))}
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                            </Row>
                          </>
                        )}

                        <Button 
                          type="submit" 
                          className="btn-primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Updating...
                            </>
                          ) : (
                            'Update Profile'
                          )}
                        </Button>
                      </Form>
                    </div>
                  </Tab>

                  <Tab eventKey="password" title="Change Password">
                    <div className="tab-content-wrapper">
                      <Form onSubmit={handlePasswordSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Current Password</Form.Label>
                          <div className="input-group">
                            <FiLock className="input-icon" />
                            <Form.Control
                              type="password"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              className="profile-input"
                              required
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>New Password</Form.Label>
                          <div className="input-group">
                            <FiLock className="input-icon" />
                            <Form.Control
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className="profile-input"
                              required
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label>Confirm New Password</Form.Label>
                          <div className="input-group">
                            <FiLock className="input-icon" />
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="profile-input"
                              required
                            />
                          </div>
                        </Form.Group>

                        <Button 
                          type="submit" 
                          className="btn-primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Changing...
                            </>
                          ) : (
                            'Change Password'
                          )}
                        </Button>
                      </Form>
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;
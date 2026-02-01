import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FiMapPin, FiSave, FiArrowLeft } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AddStation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    connectorTypes: ['Type 2', 'CCS'],
    powerOutput: '22kW',
    pricePerKwh: '',
    amenities: ['Parking', 'Restroom'],
    operatingHours: '24/7',
    totalSlots: 4,
    availableSlots: 4,
    status: 'Active'
  });

  const connectorOptions = ['Type 2', 'CCS', 'CHAdeMO', 'Type 1', 'CCS2'];
  const amenityOptions = ['Parking', 'Restroom', 'Cafe', 'WiFi', 'Shopping', 'ATM'];
  const statusOptions = ['Active', 'Maintenance', 'Electricity Shortage'];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      setFormData(prev => ({
        ...prev,
        [name]: value // Keep as string to allow partial decimal input
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value === '' ? '' : parseFloat(value) || 0) : value
      }));
    }
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleMapClick = () => {
    // Simple coordinate picker - in real app, integrate with map library
    const lat = prompt('Enter Latitude (e.g., 19.0760):');
    const lng = prompt('Enter Longitude (e.g., 72.8777):');
    
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
    } else if (lat || lng) {
      alert('Please enter valid decimal numbers for coordinates');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/station-master/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Station created successfully!');
        navigate('/station-master/stations');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create station');
      }
    } catch (error) {
      toast.error('Error creating station');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <div className="d-flex align-items-center mb-4">
            <Button as={Link} to="/station-master/dashboard" variant="outline-secondary" className="me-3">
              <FiArrowLeft />
            </Button>
            <div>
              <h1>Add New Charging Station</h1>
              <p className="text-muted">Create a new charging station for your network</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Station Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Mumbai Central Station"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Complete address of the charging station"
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Latitude *</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="19.0760"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Longitude *</Form.Label>
                      <Form.Control
                        type="number"
                        step="any"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="72.8777"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>&nbsp;</Form.Label>
                      <Button 
                        type="button" 
                        variant="outline-primary" 
                        className="d-block w-100"
                        onClick={handleMapClick}
                      >
                        <FiMapPin className="me-2" />
                        Pick from Map
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Power Output</Form.Label>
                      <Form.Select
                        name="powerOutput"
                        value={formData.powerOutput}
                        onChange={handleChange}
                      >
                        <option value="7kW">7kW (Slow)</option>
                        <option value="22kW">22kW (Fast)</option>
                        <option value="50kW">50kW (Rapid)</option>
                        <option value="150kW">150kW (Ultra Rapid)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price per kWh (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="pricePerKwh"
                        value={formData.pricePerKwh}
                        onChange={handleChange}
                        placeholder="12.50"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Total Slots</Form.Label>
                      <Form.Control
                        type="number"
                        name="totalSlots"
                        value={formData.totalSlots}
                        onChange={handleChange}
                        min="1"
                        max="20"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Operating Hours</Form.Label>
                      <Form.Control
                        type="text"
                        name="operatingHours"
                        value={formData.operatingHours}
                        onChange={handleChange}
                        placeholder="24/7 or 6:00 AM - 10:00 PM"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Connector Types</Form.Label>
                  <div>
                    {connectorOptions.map(connector => (
                      <Form.Check
                        key={connector}
                        inline
                        type="checkbox"
                        label={connector}
                        value={connector}
                        checked={formData.connectorTypes.includes(connector)}
                        onChange={(e) => handleCheckboxChange(e, 'connectorTypes')}
                      />
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Amenities</Form.Label>
                  <div>
                    {amenityOptions.map(amenity => (
                      <Form.Check
                        key={amenity}
                        inline
                        type="checkbox"
                        label={amenity}
                        value={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onChange={(e) => handleCheckboxChange(e, 'amenities')}
                      />
                    ))}
                  </div>
                </Form.Group>

                <div className="d-flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="d-flex align-items-center"
                  >
                    <FiSave className="me-2" />
                    {loading ? 'Creating...' : 'Create Station'}
                  </Button>
                  <Button
                    as={Link}
                    to="/station-master/dashboard"
                    variant="outline-secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Station Preview</h6>
            </Card.Header>
            <Card.Body>
              <p><strong>Name:</strong> {formData.name || 'Station Name'}</p>
              <p><strong>Location:</strong> {formData.latitude && formData.longitude ? `${formData.latitude}, ${formData.longitude}` : 'Not set'}</p>
              <p><strong>Power:</strong> {formData.powerOutput}</p>
              <p><strong>Slots:</strong> {formData.totalSlots}</p>
              <p><strong>Status:</strong> {formData.status}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddStation;
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form } from 'react-bootstrap';
import { FiCalendar, FiMapPin, FiClock, FiDollarSign, FiX, FiStar } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Reservations.css';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchReservations();
    
    // Set up auto-refresh every 30 seconds to catch status updates
    const interval = setInterval(fetchReservations, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Full API Response:', data);
        console.log('Bookings array:', data.bookings);
        if (data.bookings && data.bookings.length > 0) {
          console.log('First booking object:', data.bookings[0]);
          console.log('All keys in first booking:', Object.keys(data.bookings[0]));
          data.bookings.forEach((booking, index) => {
            console.log(`Booking ${index} status:`, booking.status);
          });
        }
        setReservations(data.bookings || []);
      }
    } catch (error) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedReservation) return;

    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      const stationId = selectedReservation.station?.id || selectedReservation.stationId;
      
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          stationId,
          rating: reviewData.rating,
          comment: reviewData.comment
        })
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
        setShowReviewModal(false);
        setReviewData({ rating: 5, comment: '' });
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error('Failed to submit review');
    }
  };

  const renderStars = (rating, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        size={20}
        style={{
          color: i < rating ? '#ffc107' : '#6c757d',
          fill: i < rating ? '#ffc107' : 'none',
          cursor: interactive ? 'pointer' : 'default',
          marginRight: '4px'
        }}
        onClick={interactive ? () => setReviewData({...reviewData, rating: i + 1}) : undefined}
      />
    ));
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;

    try {
      // Check if cancellation is within 20 minutes of booking time
      const bookingDate = selectedReservation.Date || selectedReservation.date;
      const bookingTime = selectedReservation.TimeSlot || selectedReservation.timeSlot;
      
      if (bookingDate && bookingTime) {
        const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00`);
        const now = new Date();
        const timeDifference = bookingDateTime.getTime() - now.getTime();
        const minutesDifference = Math.floor(timeDifference / (1000 * 60));
        
        if (minutesDifference <= 20 && minutesDifference >= 0) {
          toast.error('Cancellation of booking before 20 minutes is not allowed');
          setShowCancelModal(false);
          return;
        }
      }
      
      // Get the correct booking ID
      const bookingId = selectedReservation.Id || selectedReservation.id;
      console.log('Cancelling booking with ID:', bookingId);
      
      // Cancel the reservation in database
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Cancel response status:', response.status);
      
      if (response.ok) {
        // Remove from localStorage as well
        const existingBookings = JSON.parse(localStorage.getItem('stationBookings') || '[]');
        const stationId = selectedReservation.StationId || selectedReservation.stationId;
        const updatedBookings = existingBookings.filter(booking => 
          !(booking.stationId === stationId && 
            booking.date === bookingDate && 
            booking.timeSlot === bookingTime)
        );
        localStorage.setItem('stationBookings', JSON.stringify(updatedBookings));
        
        toast.success('Reservation cancelled successfully');
        fetchReservations();
      } else {
        const errorText = await response.text();
        console.error('Cancel error:', errorText);
        toast.error('Failed to cancel reservation');
      }
      
      setShowCancelModal(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('Cancel reservation error:', error);
      toast.error('Failed to cancel reservation');
      setShowCancelModal(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'confirmed': return 'success';
      case 'completed': return 'primary';
      case 'cancelled': return 'secondary';
      case 'active': return 'success';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="reservations-page">
        <Container>
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="reservations-page">
      <Container>
        <Row>
          <Col>
            <div className="page-header">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="page-title">My Reservations</h1>
                  <p className="page-subtitle">Manage your charging station bookings</p>
                </div>
                <Button 
                  variant="outline-primary" 
                  onClick={fetchReservations}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {reservations.length > 0 ? (
          <Row>
            {reservations.map((reservation) => (
              <Col key={reservation.id} lg={6} className="mb-4">
                <Card className="reservation-card">
                  <Card.Body>
                    <div className="reservation-header">
                      <h4 className="station-name">{reservation.Station?.Name || reservation.station?.name || reservation.StationName || reservation.stationName || 'Station'}</h4>
                      <Badge bg={getStatusBadgeVariant(reservation.status)}>
                        {reservation.Status || reservation.status || 'Unknown'}
                      </Badge>
                    </div>

                    <div className="reservation-details">
                      <div className="detail-item">
                        <FiCalendar className="detail-icon" />
                        <span>
                          <strong>Date:</strong> {reservation.Date || reservation.date || 'No date'}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <FiClock className="detail-icon" />
                        <span>
                          <strong>Time:</strong> {reservation.TimeSlot || reservation.timeSlot || 'No time'} ({reservation.Duration || reservation.duration || 0}h)
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <FiDollarSign className="detail-icon" />
                        <span>
                          <strong>Amount:</strong> ₹{reservation.Amount || reservation.amount || 0}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span style={{color: 'white'}}>
                          <strong>Vehicle:</strong> {reservation.VehicleBrand || reservation.vehicleBrand || ''} {reservation.VehicleModel || reservation.vehicleModel || ''}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span style={{color: 'white'}}>
                          <strong>Payment:</strong> {reservation.PaymentMethod || reservation.paymentMethod || 'Card'}
                          {(reservation.PaymentId || reservation.paymentId) && (
                            <small className="d-block" style={{color: 'white'}}>ID: {reservation.PaymentId || reservation.paymentId}</small>
                          )}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span style={{color: 'white'}}>
                          <strong>Booked on:</strong> {reservation.CreatedAt || reservation.createdAt ? new Date(reservation.CreatedAt || reservation.createdAt).toLocaleDateString('en-IN') : 'Unknown'}
                        </span>
                      </div>
                      
                      {(reservation.Status || reservation.status) === 'Cancelled' && reservation.CancellationMessage && (
                        <div className="detail-item" style={{ backgroundColor: '#ffebee', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                          <span style={{color: '#d32f2f'}}>
                            <strong>Cancellation Reason:</strong> {reservation.CancellationMessage}
                          </span>
                        </div>
                      )}
                    </div>

                    {(reservation.Status || reservation.status) === 'Confirmed' && (
                      <div className="reservation-actions">
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowCancelModal(true);
                          }}
                        >
                          <FiX size={16} className="me-1" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {(reservation.Status || reservation.status) === 'Completed' && (
                      <div className="reservation-actions">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowReviewModal(true);
                          }}
                        >
                          <FiStar size={16} className="me-1" />
                          Write Review
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row>
            <Col>
              <Card className="empty-state-card">
                <Card.Body className="text-center">
                  <FiCalendar size={64} className="empty-icon" />
                  <h3>No Reservations Yet</h3>
                  <p>You haven't made any reservations. Start by finding a charging station near you.</p>
                  <Button href="/map" className="btn-primary">
                    Find Charging Stations
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this reservation?</p>
          {selectedReservation && (
            <div className="cancel-details">
              <strong>{selectedReservation.stationName}</strong><br />
              {new Date(selectedReservation.startTime).toLocaleDateString()} at{' '}
              {new Date(selectedReservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Reservation
          </Button>
          <Button variant="danger" onClick={handleCancelReservation}>
            Cancel Reservation
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
          <Modal.Title style={{ color: 'white' }}>Write Review</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
          {selectedReservation && (
            <div className="mb-3">
              <h6>{selectedReservation.Station?.Name || selectedReservation.station?.name || 'Station'}</h6>
            </div>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: 'white' }}>Rating</Form.Label>
              <div className="d-flex align-items-center">
                {renderStars(reviewData.rating, true)}
                <span className="ms-2" style={{ color: 'white' }}>({reviewData.rating}/5)</span>
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: 'white' }}>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reviewData.comment}
                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                placeholder="Share your experience..."
                style={{ backgroundColor: '#2a2a2a', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#1a1a1a', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitReview}>
            Submit Review
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Reservations;
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { reservationsAPI, spacesAPI, amenitiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalReservas: 0,
    totalEspacos: 0,
    totalAmenidades: 0,
    reservasHoje: 0
  });
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManage = isAdmin();

  const fetchStats = useCallback(async () => {
    try {
      setError('');
      const apiCalls = [
        canManage ? reservationsAPI.getAll() : reservationsAPI.getMy(),
        canManage ? spacesAPI.getAll() : Promise.resolve({ data: [] }),
        canManage ? amenitiesAPI.getAll() : Promise.resolve({ data: [] })
      ];
      
      const [reservasRes, espacosRes, amenidadesRes] = await Promise.all(apiCalls);

      // Defensively check if the response data is an array before using array methods.
      const reservasData = Array.isArray(reservasRes.data?.data) ? reservasRes.data.data : [];
      const espacosData = Array.isArray(espacosRes.data?.data) ? espacosRes.data.data : [];
      const amenidadesData = Array.isArray(amenidadesRes.data?.data) ? amenidadesRes.data.data : [];

      const today = new Date().toISOString().split('T')[0];
      const reservasHoje = reservasData.filter(reserva => 
        reserva.dataInicio && reserva.dataInicio.startsWith(today)
      ).length;

      setStats({
        totalReservas: reservasData.length,
        totalEspacos: espacosData.length,
        totalAmenidades: amenidadesData.length,
        reservasHoje
      });
    } catch (error) {
      setError('Failed to load dashboard statistics. Please try again.');
    }
  }, [canManage]);

  const fetchUpcomingReservations = useCallback(async () => {
    try {
      const response = await reservationsAPI.getMy();
      const reservationsData = Array.isArray(response.data?.data) ? response.data.data : [];
      
      const now = new Date();
      const upcoming = reservationsData
        .filter(reserva => new Date(reserva.dataInicio) > now)
        .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))
        .slice(0, 5);
      
      setUpcomingReservations(upcoming);
    } catch (error) {
      setError('Failed to load upcoming reservations.');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUpcomingReservations()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchUpcomingReservations]);

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading dashboard...</p>
      </Container>
    );
  }

  const getStatusBadge = (status) => {
    const variants = {
      'confirmada': 'success',
      'pendente': 'warning',
      'cancelada': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <Container className="mt-4">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.nome || 'user'}!</p>
      
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      
      {/* Stats Cards */}
      <Row>
        <Col md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Total Reservations</Card.Title>
              <h2 className="text-primary">{stats.totalReservas}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Today's Reservations</Card.Title>
              <h2 className="text-success">{stats.reservasHoje}</h2>
            </Card.Body>
          </Card>
        </Col>
        {canManage && (
          <>
            <Col md={3}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Total Spaces</Card.Title>
                  <h2 className="text-info">{stats.totalEspacos}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Total Amenities</Card.Title>
                  <h2 className="text-warning">{stats.totalAmenidades}</h2>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <div className="d-flex gap-2 flex-wrap">
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/spaces')}
                >
                  Book a New Space
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={() => navigate('/reservations')}
                >
                  View My Reservations
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* My Upcoming Reservations */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>My Upcoming Reservations</Card.Title>
              {upcomingReservations.length > 0 ? (
                <ListGroup variant="flush">
                  {upcomingReservations.map(reservation => (
                    <ListGroup.Item key={reservation.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{reservation.titulo}</strong>
                        <br />
                        <small className="text-muted">
                          {reservation.Espaco?.nome} - {new Date(reservation.dataInicio).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                      <div>
                        {getStatusBadge(reservation.status)}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">No upcoming reservations.</p>
              )}
              {upcomingReservations.length > 0 && (
                <div className="mt-3">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => navigate('/reservations')}
                  >
                    View All Reservations
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
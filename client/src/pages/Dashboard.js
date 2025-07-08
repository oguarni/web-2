import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAdminOrGestor } = useAuth();
  const [stats, setStats] = useState({
    totalReservas: 0,
    totalEspacos: 0,
    totalAmenidades: 0,
    reservasHoje: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const [reservasRes, espacosRes, amenidadesRes] = await Promise.all([
        axios.get('/api/reservas'),
        isAdminOrGestor() ? axios.get('/api/espacos') : Promise.resolve({ data: [] }),
        isAdminOrGestor() ? axios.get('/api/amenities') : Promise.resolve({ data: [] })
      ]);

      const today = new Date().toISOString().split('T')[0];
      const reservasHoje = reservasRes.data.filter(reserva => 
        reserva.dataInicio.startsWith(today)
      ).length;

      setStats({
        totalReservas: reservasRes.data.length,
        totalEspacos: espacosRes.data.length,
        totalAmenidades: amenidadesRes.data.length,
        reservasHoje
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  }, [isAdminOrGestor]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <Container className="mt-4">
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user?.nome}!</p>
      
      <Row>
        <Col md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Total de Reservas</Card.Title>
              <h2 className="text-primary">{stats.totalReservas}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Reservas Hoje</Card.Title>
              <h2 className="text-success">{stats.reservasHoje}</h2>
            </Card.Body>
          </Card>
        </Col>
        {isAdminOrGestor() && (
          <>
            <Col md={3}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Total de Espaços</Card.Title>
                  <h2 className="text-info">{stats.totalEspacos}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Total de Amenidades</Card.Title>
                  <h2 className="text-warning">{stats.totalAmenidades}</h2>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}
      </Row>
    </Container>
  );
};

export default Dashboard;
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { reservationsAPI, spacesAPI, amenitiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAdminOrGestor } = useAuth();
  const [stats, setStats] = useState({
    totalReservas: 0,
    totalEspacos: 0,
    totalAmenidades: 0,
    reservasHoje: 0
  });

  const canManage = isAdminOrGestor();

  const fetchStats = useCallback(async () => {
    try {
      const apiCalls = [
        reservationsAPI.getAll(),
        canManage ? spacesAPI.getAll() : Promise.resolve({ data: [] }),
        canManage ? amenitiesAPI.getAll() : Promise.resolve({ data: [] })
      ];
      
      const [reservasRes, espacosRes, amenidadesRes] = await Promise.all(apiCalls);

      // Defensively check if the response data is an array before using array methods.
      const reservasData = Array.isArray(reservasRes.data) ? reservasRes.data : [];
      const espacosData = Array.isArray(espacosRes.data) ? espacosRes.data : [];
      const amenidadesData = Array.isArray(amenidadesRes.data) ? amenidadesRes.data : [];

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
      console.error('Erro ao buscar estatísticas:', error.response?.data?.message || error.message);
    }
  }, [canManage]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <Container className="mt-4">
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user?.nome || 'usuário'}!</p>
      
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
        {canManage && (
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
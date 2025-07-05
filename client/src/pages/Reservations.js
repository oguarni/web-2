import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Reservations = () => {
  const { user, isAdminOrGestor } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    dataInicio: '',
    dataFim: '',
    descricao: '',
    espacoId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReservations();
    fetchSpaces();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get('/api/reservas');
      setReservations(response.data);
    } catch (error) {
      setError('Erro ao carregar reservas');
    }
  };

  const fetchSpaces = async () => {
    try {
      const response = await axios.get('/api/espacos');
      setSpaces(response.data.filter(space => space.ativo));
    } catch (error) {
      console.error('Erro ao carregar espaços');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        espacoId: parseInt(formData.espacoId)
      };

      if (editingReservation) {
        await axios.put(`/api/reservas/${editingReservation.id}`, submitData);
        setSuccess('Reserva atualizada com sucesso!');
      } else {
        await axios.post('/api/reservas', submitData);
        setSuccess('Reserva criada com sucesso!');
      }
      
      setShowModal(false);
      setFormData({ titulo: '', dataInicio: '', dataFim: '', descricao: '', espacoId: '' });
      setEditingReservation(null);
      fetchReservations();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar reserva');
    }
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setFormData({
      titulo: reservation.titulo,
      dataInicio: new Date(reservation.dataInicio).toISOString().slice(0, 16),
      dataFim: new Date(reservation.dataFim).toISOString().slice(0, 16),
      descricao: reservation.descricao || '',
      espacoId: reservation.espacoId.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta reserva?')) {
      try {
        await axios.delete(`/api/reservas/${id}`);
        setSuccess('Reserva excluída com sucesso!');
        fetchReservations();
      } catch (error) {
        setError('Erro ao excluir reserva');
      }
    }
  };

  const canEditReservation = (reservation) => {
    return isAdminOrGestor() || reservation.usuarioId === user?.id;
  };

  const getStatusBadge = (status) => {
    const variants = {
      'confirmada': 'success',
      'pendente': 'warning',
      'cancelada': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReservation(null);
    setFormData({ titulo: '', dataInicio: '', dataFim: '', descricao: '', espacoId: '' });
    setError('');
  };

  const filteredReservations = isAdminOrGestor() 
    ? reservations 
    : reservations.filter(r => r.usuarioId === user?.id);

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1>Reservas</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Nova Reserva
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Espaço</th>
                <th>Data/Hora Início</th>
                <th>Data/Hora Fim</th>
                <th>Status</th>
                {isAdminOrGestor() && <th>Usuário</th>}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map(reservation => (
                <tr key={reservation.id}>
                  <td>{reservation.id}</td>
                  <td>{reservation.titulo}</td>
                  <td>{reservation.Espaco?.nome}</td>
                  <td>{new Date(reservation.dataInicio).toLocaleString('pt-BR')}</td>
                  <td>{new Date(reservation.dataFim).toLocaleString('pt-BR')}</td>
                  <td>{getStatusBadge(reservation.status)}</td>
                  {isAdminOrGestor() && <td>{reservation.Usuario?.nome}</td>}
                  <td>
                    {canEditReservation(reservation) && (
                      <>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(reservation)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(reservation.id)}
                        >
                          Excluir
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredReservations.length === 0 && (
            <div className="text-center py-4">
              <p>Nenhuma reserva encontrada.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para criar/editar reserva */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingReservation ? 'Editar Reserva' : 'Nova Reserva'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Título *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Espaço *</Form.Label>
                  <Form.Select
                    value={formData.espacoId}
                    onChange={(e) => setFormData({...formData, espacoId: e.target.value})}
                    required
                  >
                    <option value="">Selecione um espaço</option>
                    {spaces.map(space => (
                      <option key={space.id} value={space.id}>
                        {space.nome} - {space.localizacao}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data/Hora Início *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({...formData, dataInicio: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data/Hora Fim *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.dataFim}
                    onChange={(e) => setFormData({...formData, dataFim: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descrição opcional da reserva"
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {editingReservation ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Reservations;
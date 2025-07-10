import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { reservationsAPI, spacesAPI } from '../services/api';
import '../styles/datetime-br.css';

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

  // Função para gerar valores padrão das datas
  const getDefaultDates = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9:00 AM
    
    const endTime = new Date(tomorrow);
    endTime.setHours(10, 0, 0, 0); // 10:00 AM (1 hora depois)
    
    return {
      dataInicio: tomorrow.toISOString().slice(0, 16),
      dataFim: endTime.toISOString().slice(0, 16)
    };
  };


  // Componente customizado para input de data/hora com formatação brasileira
  const DateTimeInput = ({ label, value, onChange, required = false }) => {
    // Converter formato ISO para brasileiro para exibição
    const formatToBrazilian = (isoValue) => {
      if (!isoValue) return '';
      const date = new Date(isoValue);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hour}:${minute}`;
    };

    // Converter formato brasileiro para ISO
    const formatToISO = (brValue) => {
      if (!brValue) return '';
      const regex = /(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2})/;
      const match = brValue.match(regex);
      if (match) {
        const [, day, month, year, hour, minute] = match;
        const date = new Date(year, month - 1, day, hour, minute);
        return date.toISOString().slice(0, 16);
      }
      return brValue;
    };

    const [displayValue, setDisplayValue] = useState(formatToBrazilian(value));

    useEffect(() => {
      setDisplayValue(formatToBrazilian(value));
    }, [value]);

    const handleChange = (e) => {
      const inputValue = e.target.value;
      setDisplayValue(inputValue);
      
      // Converter para ISO se necessário
      const isoValue = formatToISO(inputValue);
      onChange(isoValue);
    };

    return (
      <Form.Group className="mb-3">
        <Form.Label>{label} {required && '*'}</Form.Label>
        <Form.Control
          type="text"
          value={displayValue}
          onChange={handleChange}
          required={required}
          placeholder="DD/MM/AAAA HH:MM"
          pattern="[0-9]{2}/[0-9]{2}/[0-9]{4} [0-9]{2}:[0-9]{2}"
          title="Formato: DD/MM/AAAA HH:MM"
        />
        <Form.Text className="text-muted">
          Formato: DD/MM/AAAA HH:MM (ex: 11/07/2025 14:30)
        </Form.Text>
      </Form.Group>
    );
  };

  useEffect(() => {
    fetchReservations();
    fetchSpaces();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchReservations = async () => {
    try {
      const response = await reservationsAPI.getAll();
      setReservations(response.data.data || []);
    } catch (error) {
      setError('Erro ao carregar reservas');
    }
  };

  const fetchSpaces = async () => {
    try {
      const response = await spacesAPI.getAll();
      setSpaces(response.data.data?.filter(space => space.ativo) || []);
    } catch (error) {
      setError('Erro ao carregar espaços');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validação no frontend
    const startDate = new Date(formData.dataInicio);
    const endDate = new Date(formData.dataFim);
    const now = new Date();

    // Verificar se a data de início é no futuro
    if (startDate <= now) {
      setError('A data de início deve ser no futuro.');
      return;
    }

    // Verificar se a data de fim é após a data de início
    if (endDate <= startDate) {
      setError('A data de fim deve ser após a data de início.');
      return;
    }

    // Verificar se a reserva não excede 24 horas
    const maxDuration = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    if (endDate - startDate > maxDuration) {
      setError('A reserva não pode exceder 24 horas.');
      return;
    }

    // Verificar se a reserva não é mais de 1 ano no futuro
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (startDate > oneYearFromNow) {
      setError('Reservas não podem ser feitas com mais de 1 ano de antecedência.');
      return;
    }

    try {
      const submitData = {
        ...formData,
        espacoId: parseInt(formData.espacoId)
      };

      if (editingReservation) {
        await reservationsAPI.update(editingReservation.id, submitData);
        setSuccess('Reserva atualizada com sucesso!');
      } else {
        await reservationsAPI.create(submitData);
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
      espacoId: reservation.espacoId?.toString() || reservation.espaco?.id?.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta reserva?')) {
      try {
        await reservationsAPI.delete(id);
        setSuccess('Reserva excluída com sucesso!');
        fetchReservations();
      } catch (error) {
        setError('Erro ao excluir reserva');
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await reservationsAPI.updateStatus(id, 'confirmada');
      setSuccess('Reserva aprovada com sucesso!');
      fetchReservations();
    } catch (error) {
      setError('Erro ao aprovar reserva');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Tem certeza que deseja rejeitar esta reserva?')) {
      try {
        await reservationsAPI.updateStatus(id, 'cancelada');
        setSuccess('Reserva rejeitada com sucesso!');
        fetchReservations();
      } catch (error) {
        setError('Erro ao rejeitar reserva');
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
          <Button variant="primary" onClick={() => {
            const defaultDates = getDefaultDates();
            setFormData({
              titulo: '',
              dataInicio: defaultDates.dataInicio,
              dataFim: defaultDates.dataFim,
              descricao: '',
              espacoId: ''
            });
            setShowModal(true);
          }}>
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
                  <td>{new Date(reservation.dataInicio).toLocaleString('pt-BR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}</td>
                  <td>{new Date(reservation.dataFim).toLocaleString('pt-BR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}</td>
                  <td>{getStatusBadge(reservation.status)}</td>
                  {isAdminOrGestor() && <td>{reservation.usuario?.nome}</td>}
                  <td>
                    {isAdminOrGestor() && reservation.status === 'pendente' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleApprove(reservation.id)}
                        >
                          Aprovar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="me-2"
                          onClick={() => handleReject(reservation.id)}
                        >
                          Rejeitar
                        </Button>
                      </>
                    )}
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
                <DateTimeInput
                  label="Data/Hora Início"
                  value={formData.dataInicio}
                  onChange={(value) => setFormData({...formData, dataInicio: value})}
                  required={true}
                />
              </Col>
              <Col md={6}>
                <DateTimeInput
                  label="Data/Hora Fim"
                  value={formData.dataFim}
                  onChange={(value) => setFormData({...formData, dataFim: value})}
                  required={true}
                />
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
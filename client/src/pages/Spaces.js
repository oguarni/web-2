import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { spacesAPI, reservationsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Spaces = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    capacidade: '',
    localizacao: '',
    equipamentos: '',
    ativo: true
  });
  const [reservationData, setReservationData] = useState({
    titulo: '',
    dataInicio: '',
    dataFim: '',
    descricao: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
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

  const fetchSpaces = async () => {
    try {
      const response = await spacesAPI.getAll();
      setSpaces(response.data.data);
    } catch (error) {
      setError('Erro ao carregar espaços');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        capacidade: parseInt(formData.capacidade)
      };

      if (editingSpace) {
        await spacesAPI.update(editingSpace.id, submitData);
        setSuccess('Espaço atualizado com sucesso!');
      } else {
        await spacesAPI.create(submitData);
        setSuccess('Espaço criado com sucesso!');
      }
      
      setShowModal(false);
      setFormData({ nome: '', descricao: '', capacidade: '', localizacao: '', equipamentos: '', ativo: true });
      setEditingSpace(null);
      fetchSpaces();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar espaço');
    }
  };

  const handleEdit = (space) => {
    setEditingSpace(space);
    setFormData({
      nome: space.nome,
      descricao: space.descricao || '',
      capacidade: space.capacidade.toString(),
      localizacao: space.localizacao,
      equipamentos: space.equipamentos || '',
      ativo: space.ativo
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este espaço?')) {
      try {
        await spacesAPI.delete(id);
        setSuccess('Espaço excluído com sucesso!');
        fetchSpaces();
      } catch (error) {
        setError('Erro ao excluir espaço');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSpace(null);
    setFormData({ nome: '', descricao: '', capacidade: '', localizacao: '', equipamentos: '', ativo: true });
    setError('');
  };

  const getDefaultReservationDates = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setHours(10, 0, 0, 0);
    
    return {
      dataInicio: tomorrow.toISOString().slice(0, 16),
      dataFim: endTime.toISOString().slice(0, 16)
    };
  };

  const handleBookSpace = (space) => {
    setSelectedSpace(space);
    const defaultDates = getDefaultReservationDates();
    setReservationData({
      titulo: `Reservation for ${space.nome}`,
      dataInicio: defaultDates.dataInicio,
      dataFim: defaultDates.dataFim,
      descricao: ''
    });
    setShowReservationModal(true);
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const startDate = new Date(reservationData.dataInicio);
    const endDate = new Date(reservationData.dataFim);
    const now = new Date();

    if (startDate <= now) {
      setError('A data de início deve ser no futuro.');
      return;
    }

    if (endDate <= startDate) {
      setError('A data de fim deve ser posterior à data de início.');
      return;
    }

    try {
      const submitData = {
        ...reservationData,
        espacoId: selectedSpace.id
      };

      await reservationsAPI.create(submitData);
      setSuccess('Reserva criada com sucesso!');
      setShowReservationModal(false);
      setReservationData({ titulo: '', dataInicio: '', dataFim: '', descricao: '' });
      setSelectedSpace(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao criar reserva');
    }
  };

  const handleCloseReservationModal = () => {
    setShowReservationModal(false);
    setSelectedSpace(null);
    setReservationData({ titulo: '', dataInicio: '', dataFim: '', descricao: '' });
    setError('');
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1>Espaços</h1>
        </Col>
        {isAdmin() && (
          <Col xs="auto">
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Novo Espaço
            </Button>
          </Col>
        )}
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Carregando espaços...</p>
        </div>
      ) : (
        isAdmin() ? (
        // Admin Table View
        <Card>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Localização</th>
                  <th>Capacidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {spaces.map(space => (
                  <tr key={space.id}>
                    <td>{space.id}</td>
                    <td>{space.nome}</td>
                    <td>{space.localizacao}</td>
                    <td>{space.capacidade} people</td>
                    <td>
                      <Badge bg={space.ativo ? 'success' : 'danger'}>
                        {space.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(space)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(space.id)}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
                {spaces.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Nenhum espaço encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        // User Card View
        <Row>
          {spaces.filter(space => space.ativo).map(space => (
            <Col key={space.id} md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{space.nome}</Card.Title>
                  <Card.Text>
                    <strong>Localização:</strong> {space.localizacao}<br />
                    <strong>Capacidade:</strong> {space.capacidade} pessoas<br />
                    {space.descricao && (
                      <><strong>Descrição:</strong> {space.descricao}<br /></>
                    )}
                    {space.equipamentos && (
                      <><strong>Equipamentos:</strong> {space.equipamentos}</>
                    )}
                  </Card.Text>
                  <div className="mt-auto">
                    <Button 
                      variant="primary" 
                      className="w-100"
                      onClick={() => handleBookSpace(space)}
                    >
                      Reservar este Espaço
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
          {spaces.filter(space => space.ativo).length === 0 && (
            <Col>
              <div className="text-center py-4">
                <p>Nenhum espaço ativo encontrado.</p>
              </div>
            </Col>
          )}
        </Row>
        )
      )}

      {/* Modal para criar/editar espaço - Admin only */}
      {isAdmin() && (
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingSpace ? 'Editar Espaço' : 'Novo Espaço'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Localização *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.localizacao}
                      onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Capacidade *</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={formData.capacidade}
                      onChange={(e) => setFormData({...formData, capacidade: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={formData.ativo}
                      onChange={(e) => setFormData({...formData, ativo: e.target.value === 'true'})}
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </Form.Select>
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
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Equipamentos</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.equipamentos}
                  onChange={(e) => setFormData({...formData, equipamentos: e.target.value})}
                  placeholder="Liste os equipamentos disponíveis"
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={handleCloseModal} disabled={submitting}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                      {editingSpace ? 'Atualizando...' : 'Criando...'}
                    </>
                  ) : (
                    editingSpace ? 'Atualizar' : 'Criar'
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}

      {/* Modal para criar reserva - User booking */}
      <Modal show={showReservationModal} onHide={handleCloseReservationModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Reservar {selectedSpace?.nome}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <div className="mb-3">
            <strong>Espaço:</strong> {selectedSpace?.nome}<br />
            <strong>Localização:</strong> {selectedSpace?.localizacao}<br />
            <strong>Capacidade:</strong> {selectedSpace?.capacidade} pessoas
          </div>
          <Form onSubmit={handleReservationSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Título *</Form.Label>
              <Form.Control
                type="text"
                value={reservationData.titulo}
                onChange={(e) => setReservationData({...reservationData, titulo: e.target.value})}
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data/Hora de Início *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={reservationData.dataInicio}
                    onChange={(e) => setReservationData({...reservationData, dataInicio: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data/Hora de Fim *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={reservationData.dataFim}
                    onChange={(e) => setReservationData({...reservationData, dataFim: e.target.value})}
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
                value={reservationData.descricao}
                onChange={(e) => setReservationData({...reservationData, descricao: e.target.value})}
                placeholder="Descrição opcional para sua reserva"
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleCloseReservationModal} disabled={submitting}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                    Criando...
                  </>
                ) : (
                  'Criar Reserva'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Spaces;
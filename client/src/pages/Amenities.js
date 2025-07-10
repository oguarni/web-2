import React, { useState, useEffect } from 'react';
import { Container, Button, Table, Modal, Form, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { amenitiesAPI } from '../services/api';

/**
 * Amenities Management Page
 * Allows administrators to perform full CRUD operations on amenities.
 */
const Amenities = () => {
  // State for amenities data
  const [amenities, setAmenities] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });
  const [editingAmenity, setEditingAmenity] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { isAdminOrGestor } = useAuth();

  // Clear alerts after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch amenities on component mount
  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    setLoading(true);
    try {
      const response = await amenitiesAPI.getAll();
      setAmenities(response.data.data);
      setError('');
    } catch (err) {
      setError('Erro ao carregar amenidades');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearAlerts = () => {
    setError('');
    setSuccess('');
  };

  // Modal handlers
  const handleShowCreateModal = () => {
    clearAlerts();
    setFormData({ nome: '', descricao: '' });
    setEditingAmenity(null);
    setShowModal(true);
  };

  const handleShowEditModal = (amenity) => {
    clearAlerts();
    setEditingAmenity(amenity);
    setFormData({
      nome: amenity.nome,
      descricao: amenity.descricao || ''
    });
    setShowModal(true);
  };

  const handleShowDeleteModal = (amenity) => {
    clearAlerts();
    setEditingAmenity(amenity);
    setShowDeleteModal(true);
  };

  const handleCloseModals = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setEditingAmenity(null);
    setFormData({ nome: '', descricao: '' });
    setError('');
  };

  // CRUD operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAlerts();
    
    if (!formData.nome.trim()) {
      setError('Nome da amenidade não pode estar vazio.');
      return;
    }

    try {
      if (editingAmenity) {
        await amenitiesAPI.update(editingAmenity.id, formData);
        setSuccess('Amenidade atualizada com sucesso!');
      } else {
        await amenitiesAPI.create(formData);
        setSuccess('Amenidade criada com sucesso!');
      }
      handleCloseModals();
      fetchAmenities();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar amenidade');
    }
  };

  const handleDelete = async () => {
    clearAlerts();
    try {
      await amenitiesAPI.delete(editingAmenity.id);
      setSuccess('Amenidade excluída com sucesso!');
      handleCloseModals();
      fetchAmenities();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao excluir amenidade');
    }
  };

  // Access control check
  if (!isAdminOrGestor()) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          Você não tem permissão para acessar esta página.
        </Alert>
      </Container>
    );
  }

  // Loading state
  if (loading && amenities.length === 0) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h1>Amenidades</h1>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={handleShowCreateModal}>
            <i className="bi bi-plus-lg me-2"></i>Nova Amenidade
          </Button>
        </Col>
      </Row>

      {/* Global Success/Error Alerts */}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
      {error && !showModal && !showDeleteModal && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>
      )}

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {amenities.length > 0 ? (
                amenities.map(amenity => (
                  <tr key={amenity.id}>
                    <td>{amenity.id}</td>
                    <td>{amenity.nome}</td>
                    <td>{amenity.descricao || '-'}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowEditModal(amenity)}
                      >
                        <i className="bi bi-pencil-fill"></i> Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleShowDeleteModal(amenity)}
                      >
                        <i className="bi bi-trash-fill"></i> Excluir
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">Nenhuma amenidade encontrada.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModals} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAmenity ? 'Editar Amenidade' : 'Nova Amenidade'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Nome *</Form.Label>
              <Form.Control
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModals}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingAmenity ? 'Atualizar' : 'Criar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModals} centered>
        <Modal.Header closeButton>
          <Modal.Title>Excluir Amenidade</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir a amenidade "<strong>{editingAmenity?.nome}</strong>"?</p>
          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModals}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Amenities;
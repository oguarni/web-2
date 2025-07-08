import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { amenitiesAPI } from '../services/api';

const Amenities = () => {
  const { isAdminOrGestor } = useAuth();
  const [amenities, setAmenities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      const response = await amenitiesAPI.getAll();
      setAmenities(response.data);
    } catch (error) {
      setError('Erro ao carregar amenidades');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingAmenity) {
        await amenitiesAPI.update(editingAmenity.id, formData);
        setSuccess('Amenidade atualizada com sucesso!');
      } else {
        await amenitiesAPI.create(formData);
        setSuccess('Amenidade criada com sucesso!');
      }
      
      setShowModal(false);
      setFormData({ nome: '', descricao: '' });
      setEditingAmenity(null);
      fetchAmenities();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar amenidade');
    }
  };

  const handleEdit = (amenity) => {
    setEditingAmenity(amenity);
    setFormData({
      nome: amenity.nome,
      descricao: amenity.descricao || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta amenidade?')) {
      try {
        await amenitiesAPI.delete(id);
        setSuccess('Amenidade excluída com sucesso!');
        fetchAmenities();
      } catch (error) {
        setError('Erro ao excluir amenidade');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAmenity(null);
    setFormData({ nome: '', descricao: '' });
    setError('');
  };

  if (!isAdminOrGestor()) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          Você não tem permissão para acessar esta página.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1>Amenidades</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Nova Amenidade
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
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {amenities.map(amenity => (
                <tr key={amenity.id}>
                  <td>{amenity.id}</td>
                  <td>{amenity.nome}</td>
                  <td>{amenity.descricao || '-'}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(amenity)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(amenity.id)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {amenities.length === 0 && (
            <div className="text-center py-4">
              <p>Nenhuma amenidade encontrada.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para criar/editar amenidade */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAmenity ? 'Editar Amenidade' : 'Nova Amenidade'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
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
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {editingAmenity ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Amenities;
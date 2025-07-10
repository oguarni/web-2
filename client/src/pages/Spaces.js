import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { spacesAPI } from '../services/api';

const Spaces = () => {
  const { isAdminOrGestor } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    capacidade: '',
    localizacao: '',
    equipamentos: '',
    ativo: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSpaces();
  }, []);

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
          <h1>Espaços</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Novo Espaço
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
                  <td>{space.capacidade} pessoas</td>
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
            </tbody>
          </Table>
          {spaces.length === 0 && (
            <div className="text-center py-4">
              <p>Nenhum espaço encontrado.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para criar/editar espaço */}
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
              <Button variant="secondary" className="me-2" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {editingSpace ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Spaces;
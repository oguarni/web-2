import React, { useState, useEffect, useCallback } from 'react';
import { Container, Button, Table, Modal, Form, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Users Management Page
 * Allows administrators to perform CRUD operations on users.
 */
const Users = () => {
  // State for users data
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { user: loggedInUser, isAdmin } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      const usersData = Array.isArray(response.data?.data) ? response.data.data : [];
      setUsers(usersData);
      setError('');
    } catch (err) {
      setError('Falha ao carregar usuários: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Clear success message after delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const clearAlerts = () => {
    setError('');
  };

  // Modal handlers
  const handleClose = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setCurrentUser(null);
    setFormData({ nome: '', email: '', password: '', role: 'user' });
    setError('');
    setIsNewUser(false);
  };

  const handleNew = () => {
    clearAlerts();
    setCurrentUser(null);
    setFormData({ nome: '', email: '', password: '', role: 'user' });
    setIsNewUser(true);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    clearAlerts();
    setCurrentUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      password: '', // Don't populate password on edit
      role: user.role
    });
    setIsNewUser(false);
    setShowModal(true);
  };

  const handleShowDeleteModal = (user) => {
    clearAlerts();
    setCurrentUser(user);
    setShowDeleteModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // CRUD operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAlerts();
    
    // Validation
    if (!formData.nome || !formData.email) {
      setError('Nome e email são obrigatórios.');
      return;
    }

    if (isNewUser && (!formData.password || formData.password.length < 6)) {
      setError('Senha é obrigatória e deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      if (isNewUser) {
        await usersAPI.create(formData);
        setSuccess('Usuário criado com sucesso!');
      } else {
        // Remove password if empty
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await usersAPI.update(currentUser.id, updateData);
        setSuccess('Usuário atualizado com sucesso!');
      }
      fetchUsers();
      handleClose();
    } catch (err) {
      setError('Operação falhou: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    clearAlerts();
    try {
      await usersAPI.delete(currentUser.id);
      setSuccess('Usuário excluído com sucesso!');
      fetchUsers();
      handleClose();
    } catch (err) {
      setError('Falha ao excluir usuário: ' + (err.response?.data?.message || err.message));
    }
  };

  // Access control check
  if (!isAdmin()) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          Você não tem permissão para acessar esta página.
        </Alert>
      </Container>
    );
  }

  // Loading state
  if (loading && users.length === 0) {
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
          <h1>Gerenciar Usuários</h1>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={handleNew}>
            <i className="bi bi-person-plus-fill me-2"></i>Novo Usuário
          </Button>
        </Col>
      </Row>

      {/* Alerts */}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
      {error && !showModal && !showDeleteModal && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>
                  <Badge bg={user.role === 'admin' ? 'success' : user.role === 'gestor' ? 'primary' : 'secondary'}>
                    {user.role}
                  </Badge>
                </td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2" 
                    onClick={() => handleEdit(user)}
                  >
                    <i className="bi bi-pencil-fill"></i> Editar
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleShowDeleteModal(user)}
                    disabled={loggedInUser?.id === user.id} // Prevent self-deletion
                  >
                    <i className="bi bi-trash-fill"></i> Excluir
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">Nenhum usuário encontrado.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isNewUser ? 'Novo Usuário' : 'Editar Usuário'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Nome *</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Senha {isNewUser ? '*' : ''}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isNewUser ? "" : "Deixe em branco para não alterar"}
                required={isNewUser}
              />
              {isNewUser && (
                <Form.Text className="text-muted">
                  A senha deve ter pelo menos 6 caracteres.
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipo *</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="gestor">Gestor</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
            <Button variant="primary" type="submit">
              {isNewUser ? 'Criar' : 'Salvar Alterações'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p>Tem certeza que deseja excluir o usuário "<strong>{currentUser?.nome}</strong>"?</p>
          <p>Esta ação não pode ser desfeita.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
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

export default Users;
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

const Users = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    login: '',
    senha: '',
    tipo: '2'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      setError('Erro ao carregar usuários');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        tipo: parseInt(formData.tipo)
      };

      // Se estamos editando e a senha está vazia, não incluir senha
      if (editingUser && !formData.senha) {
        delete submitData.senha;
      }

      if (editingUser) {
        await usersAPI.update(editingUser.id, submitData);
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        await usersAPI.create(submitData);
        setSuccess('Usuário criado com sucesso!');
      }
      
      setShowModal(false);
      setFormData({ nome: '', login: '', senha: '', tipo: '2' });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar usuário');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      login: user.login,
      senha: '', // Password should be empty for editing
      tipo: user.tipo.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await usersAPI.delete(id);
        setSuccess('Usuário excluído com sucesso!');
        fetchUsers();
      } catch (error) {
        setError('Erro ao excluir usuário');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ nome: '', login: '', senha: '', tipo: '2' });
    setError('');
  };

  const getUserTypeBadge = (tipo) => {
    const types = {
      1: { text: 'Administrador', variant: 'danger' },
      2: { text: 'Usuário', variant: 'success' },
      3: { text: 'Gestor', variant: 'warning' }
    };
    const userType = types[tipo] || { text: 'Desconhecido', variant: 'secondary' };
    return <Badge bg={userType.variant}>{userType.text}</Badge>;
  };

  if (!isAdmin()) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Você não tem permissão para acessar esta página. Somente administradores podem gerenciar usuários.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h1>Gerenciar Usuários</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Novo Usuário
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
                <th>Login</th>
                <th>Tipo</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.nome}</td>
                  <td>{user.login}</td>
                  <td>{getUserTypeBadge(user.tipo)}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(user)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {users.length === 0 && (
            <div className="text-center py-4">
              <p>Nenhum usuário encontrado.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para criar/editar usuário */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
              <Form.Label>Login *</Form.Label>
              <Form.Control
                type="text"
                value={formData.login}
                onChange={(e) => setFormData({...formData, login: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                Senha {editingUser ? '(deixe em branco para não alterar)' : '*'}
              </Form.Label>
              <Form.Control
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                required={!editingUser}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Usuário *</Form.Label>
              <Form.Select
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                required
              >
                <option value="2">Usuário</option>
                <option value="3">Gestor</option>
                <option value="1">Administrador</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                {editingUser ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Users;
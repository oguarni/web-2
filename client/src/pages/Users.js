import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', role: 'user', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user: loggedInUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await usersAPI.getAll();
      // Defensively check if the response data is an array.
      const usersData = Array.isArray(response.data) ? response.data : [];
      setUsers(usersData);
    } catch (err) {
      setError('Falha ao carregar usuários. ' + (err.response?.data?.message || err.message));
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleClose = () => {
    setShowModal(false);
    setCurrentUser(null);
    setFormData({ nome: '', email: '', role: 'user', password: '' });
    setError('');
    setSuccess('');
    setIsNewUser(false);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({ nome: user.nome, email: user.email, role: user.role, password: '' });
    setIsNewUser(false);
    setShowModal(true);
  };

  const handleNew = () => {
    setCurrentUser(null);
    setFormData({ nome: '', email: '', role: 'user', password: '' });
    setIsNewUser(true);
    setShowModal(true);
  };
  
  const handleDelete = async (user) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.nome}?`)) {
      try {
        await usersAPI.delete(user.id);
        setSuccess('Usuário excluído com sucesso!');
        fetchUsers(); // Refresh the list
      } catch (err) {
        setError('Falha ao excluir usuário. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (isNewUser && !formData.password) {
        setError('A senha é obrigatória para novos usuários.');
        return;
    }

    try {
      if (isNewUser) {
        await usersAPI.create(formData);
        setSuccess('Usuário criado com sucesso!');
      } else {
        // Do not send an empty password on update
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
      setError('Operação falhou. ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Container className="mt-4">
      <h1>Gerenciar Usuários</h1>
      <Button variant="primary" onClick={handleNew} className="mb-3">Novo Usuário</Button>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.nome}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(user)}>Editar</Button>{' '}
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => handleDelete(user)}
                  disabled={loggedInUser?.id === user.id} // Disable deleting self
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isNewUser ? 'Novo Usuário' : 'Editar Usuário'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control type="text" name="nome" value={formData.nome} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isNewUser ? "Obrigatório" : "Deixe em branco para não alterar"} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="gestor">Gestor</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Button variant="secondary" onClick={handleClose}>Cancelar</Button>{' '}
            <Button variant="primary" type="submit">Salvar</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Users;
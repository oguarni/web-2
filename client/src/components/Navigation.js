import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout, isAdmin, isAdminOrGestor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          Sistema de Reservas
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/reservations">Reservas</Nav.Link>
            {isAdminOrGestor() && (
              <>
                <Nav.Link as={Link} to="/spaces">Espaços</Nav.Link>
                <Nav.Link as={Link} to="/amenities">Amenidades</Nav.Link>
              </>
            )}
            {isAdmin() && (
              <Nav.Link as={Link} to="/users">Usuários</Nav.Link>
            )}
          </Nav>
          <Nav>
            <NavDropdown title={user?.nome || 'Usuário'} id="basic-nav-dropdown">
              <NavDropdown.Item onClick={handleLogout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
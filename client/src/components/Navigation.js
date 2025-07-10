import React from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const { isAuthenticated, logout, user, isAdminOrGestor } = useAuth();

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
            <Container>
                <Navbar.Brand href="/">Sistema de Reservas</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {isAuthenticated && user && (
                            <>
                                <LinkContainer to="/">
                                    <Nav.Link>Dashboard</Nav.Link>
                                </LinkContainer>
                                {isAdminOrGestor() && (
                                    <>
                                        <LinkContainer to="/users">
                                            <Nav.Link>Usuários</Nav.Link>
                                        </LinkContainer>
                                        <LinkContainer to="/spaces">
                                            <Nav.Link>Espaços</Nav.Link>
                                        </LinkContainer>
                                        <LinkContainer to="/amenities">
                                            <Nav.Link>Amenities</Nav.Link>
                                        </LinkContainer>
                                    </>
                                )}
                                <LinkContainer to="/reservations">
                                    <Nav.Link>Reservas</Nav.Link>
                                </LinkContainer>
                            </>
                        )}
                    </Nav>
                    <Nav>
                        {isAuthenticated && user ? (
                            <Button variant="outline-light" onClick={logout}>
                                Logout ({user?.nome})
                            </Button>
                        ) : (
                            <LinkContainer to="/login">
                                <Nav.Link>Login</Nav.Link>
                            </LinkContainer>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;
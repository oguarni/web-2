import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const { isAuthenticated, logout, user } = useAuth();
    
    // Check if user has admin role
    const isAdmin = user?.role === 'admin';

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
                                <LinkContainer to="/spaces">
                                    <Nav.Link>Spaces</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/reservations">
                                    <Nav.Link>My Reservations</Nav.Link>
                                </LinkContainer>
                                {/* Admin-only links using role check */}
                                {user?.role === 'admin' && (
                                    <>
                                        <LinkContainer to="/users">
                                            <Nav.Link>Users</Nav.Link>
                                        </LinkContainer>
                                        <LinkContainer to="/amenities">
                                            <Nav.Link>Amenities</Nav.Link>
                                        </LinkContainer>
                                    </>
                                )}
                            </>
                        )}
                    </Nav>
                    <Nav>
                        {isAuthenticated && user ? (
                            <NavDropdown title={user.nome} id="basic-nav-dropdown">
                                <NavDropdown.Item onClick={logout}>
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
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
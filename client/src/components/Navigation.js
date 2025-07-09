import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    // A desestruturação dos dados do contexto está correta
    const { isAuthenticated, logout, user, isAdminOrGestor } = useAuth();

    return (
        <nav>
            <ul>
                <li><Link to="/">Dashboard</Link></li>
                {isAuthenticated && user && ( // Garante que 'user' não é nulo antes de prosseguir
                    <>
                        {/* CORREÇÃO 1: A função é chamada para retornar true/false */}
                        {isAdminOrGestor() && (
                            <>
                                <li><Link to="/users">Usuários</Link></li>
                                <li><Link to="/spaces">Espaços</Link></li>
                                <li><Link to="/amenities">Amenities</Link></li>
                            </>
                        )}
                        <li><Link to="/reservations">Reservas</Link></li>
                        <li>
                            {/* CORREÇÃO 2: Acesso seguro ao nome do utilizador com 'user?.nome' */}
                            <button onClick={logout}>Logout ({user?.nome})</button>
                        </li>
                    </>
                )}
                {!isAuthenticated && (
                    <li><Link to="/login">Login</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default Navigation;
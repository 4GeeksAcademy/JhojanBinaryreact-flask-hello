import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import '../../styles/Nabvarr.css';

export const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    return (
        <div className="main">
            <header className="header">
                <nav className="navbar">
                    <h2 className="navbar__logo">S A H U</h2>
                    <ul className="navbar__link">
                        <NavLink className="link__item" to="/private">Inicio</NavLink>
                        <NavLink className="link__item" to="/login">Login</NavLink>
                        <NavLink className="link__item" to="/">Get Started</NavLink>
                        <button className="link__item" onClick={handleLogout}>Logout</button>
                    </ul>
                </nav>
            </header>
        </div>
    );
};

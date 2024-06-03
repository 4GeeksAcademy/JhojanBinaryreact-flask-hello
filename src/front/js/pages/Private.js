import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import privateimg from '../../img/welcome.png';
import '../../styles/Private.css';

export const Private = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            navigate('/login');
        } else {
            setIsLoggedIn(true);
        }
    }, [navigate]);

    return (
        <div className="article" style={{ backgroundImage: `url(${privateimg})` }}>
            {isLoggedIn && <h1 className="aviso">BIENVENIDO CHAVALIN :v</h1>}
        </div>
    );
};

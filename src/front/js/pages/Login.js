import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import imglogin from '../../img/login.png';
import '../../styles/Login.css';

export const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(process.env.BACKEND_URL + "/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            localStorage.setItem('access_token', data.access_token);
            navigate('/private');
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="content">
            <div className="content__form">
                <h1 className="form__title">LOGIN</h1>
                <form className="form__principal" onSubmit={handleLogin}>
                    <label className="form__label" htmlFor="email">Email</label>
                    <input className="form__input" type="email" name="email" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                    <label className="form__label" htmlFor="password">password</label>
                    <input className="form__input" type="password" name="password" id="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                    <button className="form__button" type="submit">Login</button>
                </form>
            </div>

            <picture className="picture">
                <img className="picture__img" src={imglogin} alt="" />
            </picture>
        </div>
    );
};

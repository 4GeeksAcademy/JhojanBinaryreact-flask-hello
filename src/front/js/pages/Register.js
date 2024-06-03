import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import registerimg from '../../img/register.png';
import '../../styles/Register.css';

export const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            if (password !== confirmPassword) {
                console.error('Passwords do not match');
                return;
            }
            const response = await fetch(process.env.BACKEND_URL + "/register", {
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
            console.error('Registration error:', error);
        }
    };

    return (
        <div className="content">
            <div className="content__form">
                <h1 className="form__title">REGISTER</h1>
                <form className="form__principal" onSubmit={handleRegister}>
                    <label className="form__label" htmlFor="email">Email</label>
                    <input className="form__input" type="email" name="email" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                    <label className="form__label" htmlFor="password">Password</label>
                    <input className="form__input" type="password" name="password" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                    <label className="form__label" htmlFor="confirm-password">Confirm Password</label>
                    <input className="form__input" type="password" name="confirm-password" id="confirm-password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

                    <button className="form__button" type="submit">Register</button>
                </form>
            </div>
            <picture className="picture">
                <img className="picture__img" src={registerimg} alt="Register Illustration" />
            </picture>
        </div>
    );
};

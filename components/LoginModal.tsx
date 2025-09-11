import React, { useState, useEffect } from 'react';
import type { User } from '../types';

// SVGs as components for cleanliness
const EmailIcon = () => <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg" className="text-text-secondary"><path d="m31.71 7.29-14-5a1 1 0 0 0-.58 0l-14 5A1 1 0 0 0 3 8v16a1 1 0 0 0 .71.95l14 5a1 1 0 0 0 .58 0l14-5A1 1 0 0 0 31 24V8a1 1 0 0 0-.29-.71ZM17 19.83V29l12-4.28V10.54Zm-2-10.12L27.64 5l-12.28 4.38-12.64-4.51L15 9.71ZM5 10.54v14.17L15 29V19.83L3.36 5Z" data-name="Layer 47" id="Layer_47"></path></svg>;
const PasswordIcon = () => <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg" className="text-text-secondary"><path d="M22 13h-2v-4a4 4 0 0 0-8 0v4H9a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V14a1 1 0 0 0-1-1zm-11-4a3 3 0 0 1 6 0v4h-6zM22 24H10V15h12z"></path><circle cx="16" cy="20" r="2"></circle></svg>;
const UserIcon = () => <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg" className="text-text-secondary"><path d="M16 16A5 5 0 1 0 11 11a5 5 0 0 0 5 5zm0-8a3 3 0 1 1-3 3 3 3 0 0 1 3-3zM16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm0 26a12 12 0 1 1 12-12 12 12 0 0 1-12 12zm8.59 2.59-3.32-3.32A7 7 0 0 0 16 20a7 7 0 0 0-5.27 2.27l-3.32 3.32A11.91 11.91 0 0 1 4 18a12 12 0 0 1 24 0 11.91 11.91 0 0 1-3.41 7.59z"></path></svg>;

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (user: User | null) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setError('');
            setEmail('');
            setPassword('');
            setName('');
            setIsRegistering(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsExiting(false);
            onClose();
        }, 300);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isRegistering && !name.trim()) {
            setError('Por favor, ingresa tu nombre.');
            return;
        }
        if (!email.trim() || !password.trim()) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        const endpoint = isRegistering ? '/api/register' : '/api/login';
        const body = isRegistering ? { name, email, password } : { email, password };

        try {
            const response = await fetch(`http://localhost:3001${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ocurrió un error.');
            }
            
            // The server now sends a perfectly formatted User object.
            // We trust it and pass it directly to the app state.
            const userFromServer: User = data;
            onLogin(userFromServer);
            handleClose();

        } catch (err: any) {
            setError(err.message);
        }
    };


    if (!isOpen && !isExiting) return null;

    return (
        <div className={`login-modal-backdrop ${isExiting ? 'exiting' : ''}`} onClick={handleClose}>
            <div className={`login-modal-content ${isExiting ? 'exiting' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="text-right p-2">
                     <button onClick={handleClose} className="text-3xl leading-none px-2 text-text-secondary hover:text-text-main rounded-full transition-colors">&times;</button>
                </div>
                <h3 className="text-3xl font-bold font-display text-center text-text-main mb-6">
                    {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </h3>
                <form className="form" onSubmit={handleSubmit}>
                    {isRegistering && (
                        <div className="inputForm">
                            <UserIcon />
                            <input type="text" className="input" placeholder="Nombre Completo" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                    )}
                    <div className="inputForm">
                        <EmailIcon />
                        <input type="email" className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                    </div>
                    <div className="inputForm">
                        <PasswordIcon />
                        <input type="password" className="input" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                    </div>
                    {!isRegistering && (
                        <div className="flex-row">
                            <label><input type="checkbox" /> Recordarme</label>
                            <button type="button" className="span">¿Olvidaste tu contraseña?</button>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                    <button type="submit" className="button-submit">{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</button>
                    <p className="p">
                        {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
                        <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="span ml-1">
                            {isRegistering ? 'Inicia Sesión' : 'Regístrate'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
import React, { useState, useEffect } from 'react';
import type { User } from '../types';

// SVGs as components for cleanliness
const EmailIcon = () => <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg" className="text-text-secondary"><path d="m31.71 7.29-14-5a1 1 0 0 0-.58 0l-14 5A1 1 0 0 0 3 8v16a1 1 0 0 0 .71.95l14 5a1 1 0 0 0 .58 0l14-5A1 1 0 0 0 31 24V8a1 1 0 0 0-.29-.71ZM17 19.83V29l12-4.28V10.54Zm-2-10.12L27.64 5l-12.28 4.38-12.64-4.51L15 9.71ZM5 10.54v14.17L15 29V19.83L3.36 5Z" data-name="Layer 47" id="Layer_47"></path></svg>;
const UserIcon = () => <svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg" className="text-text-secondary"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle></g></svg>;
const ClosedLockIcon = () => <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg" className="text-text-secondary"><path d="M22 13h-2v-4a4 4 0 0 0-8 0v4H9a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V14a1 1 0 0 0-1-1zm-11-4a3 3 0 0 1 6 0v4h-6zM22 24H10V15h12z" data-name="Layer 22" id="Layer_22"></path></svg>;
const OpenLockIcon = () => <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg" className="text-text-secondary"><path d="M12 13V9a4 4 0 0 1 8 0v1h2V9a6 6 0 0 0-12 0v4H9a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V14a1 1 0 0 0-1-1H12zm10 11H10V15h12v9z" /></svg>;

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setIsRegistering(false);
            setName('');
            setEmail('');
            setPassword('');
            setError('');
            setIsLoading(false);
            setIsPasswordVisible(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const url = isRegistering ? '/api/register' : '/api/login';
        const body = isRegistering ? { name, email, password } : { email, password };
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Ocurrió un error.');
            }

            onLogin(data);
            onClose();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="login-modal-backdrop" onClick={onClose}>
            <div className="login-modal-content" onClick={e => e.stopPropagation()}>
                <div className="form">
                    <h2 className="text-2xl font-bold font-display text-center text-text-main mb-2">
                        {isRegistering ? 'Crea tu Cuenta' : 'Bienvenido de Nuevo'}
                    </h2>
                    <p className="text-center text-text-secondary mb-6">
                        {isRegistering ? 'Únete a la comunidad para guardar tu progreso.' : 'Inicia sesión para continuar.'}
                    </p>
                    
                    {error && (
                        <div className="bg-red-500/20 text-red-300 text-sm p-3 rounded-md mb-4 text-center">
                            
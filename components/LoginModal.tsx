import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { allAchievements } from '../data/achievementsData';

// SVGs as components for cleanliness
const EmailIcon = () => <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-slate-400"><g id="Layer_3" data-name="Layer 3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path></g></svg>;
const PasswordIcon = () => <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="text-slate-400"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path></svg>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // for registration
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimatingOut(false);
        }
    }, [isOpen]);
    
    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            // Reset form for next time
            setEmail('');
            setPassword('');
            setName('');
            setIsRegister(false);
        }, 300); // Match animation duration
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isAdmin = ['felipe@example.com', 'admin@ecogestion.com'].includes(email.toLowerCase());
        const userName = name || (isAdmin ? 'Felipe' : 'Nuevo Usuario');
        
        onLogin({
          id: `user-${Date.now()}`,
          name: userName,
          email: email,
          points: isRegister ? 0 : 1250,
          isAdmin: isAdmin,
          achievements: allAchievements.map(ach => ({
              ...ach,
              unlocked: isRegister ? false : (isAdmin ? true : ['1', '2'].includes(ach.id)),
          })),
          stats: {
              messagesSent: isRegister ? 0 : 12,
              pointsVisited: isRegister ? 0 : 3,
              reportsMade: isRegister ? 0 : 1,
              dailyLogins: isRegister ? 0 : 5,
              completedQuizzes: [],
              quizzesCompleted: 0,
              gamesPlayed: 0,
          },
          favoriteLocations: [],
          lastLogin: '2024-01-01',
        });
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className={`login-modal-backdrop ${isAnimatingOut ? 'exiting' : ''}`} onClick={handleClose}>
            <div className={`login-modal-content ${isAnimatingOut ? 'exiting' : ''}`} onClick={e => e.stopPropagation()}>
                <form className="form" onSubmit={handleFormSubmit}>
                    <h2 className="text-2xl font-bold text-center text-text-main mb-4">{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>

                    {isRegister && (
                        <>
                            <div className="flex-column"><label>Nombre</label></div>
                            <div className="inputForm">
                                <input type="text" className="input" placeholder="Ingresa tu nombre" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                        </>
                    )}

                    <div className="flex-column"><label>Email</label></div>
                    <div className="inputForm">
                        <EmailIcon />
                        <input type="email" className="input" placeholder="Ingresa tu Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                
                    <div className="flex-column"><label>Contraseña</label></div>
                    <div className="inputForm">
                        <PasswordIcon />
                        <input type="password" className="input" placeholder="Ingresa tu Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                
                    <div className="flex-row">
                        <div>
                            <input type="checkbox" id="rememberMe" />
                            <label htmlFor="rememberMe" className="ml-2"> Recordarme</label>
                        </div>
                        <button type="button" className="span">¿Olvidaste tu contraseña?</button>
                    </div>

                    <button type="submit" className="button-submit">{isRegister ? 'Registrarse' : 'Ingresar'}</button>
                    
                    <p className="p">
                        {isRegister ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
                        <button type="button" className="span" onClick={() => setIsRegister(!isRegister)}>
                            {isRegister ? 'Ingresar' : 'Registrarse'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
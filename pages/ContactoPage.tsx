import React from 'react';

const ContactoPage: React.FC = () => {
    return (
        <div className="bg-background pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-text-main">Ponete en Contacto</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">¿Tenés preguntas, sugerencias o querés colaborar? Nos encantaría saber de vos.</p>
                </div>

                <div className="modern-card overflow-hidden grid md:grid-cols-5">
                    {/* Left Column (Info) */}
                    <aside className="md:col-span-2 bg-slate-800 text-white p-8">
                        <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>
                        <div className="space-y-6">
                            <div className="flex items-start space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-1 flex-shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <div>
                                    <h3 className="font-semibold text-slate-200">Email</h3>
                                    <a href="mailto:contacto@formosarecicla.com" className="hover:underline text-secondary">contacto@formosarecicla.com</a>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-1 flex-shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <div>
                                    <h3 className="font-semibold text-slate-200">Teléfono</h3>
                                    <p className="text-slate-300">+54 370 4123456</p>
                                </div>
                            </div>
                             <div className="flex items-start space-x-3">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mt-1 flex-shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <div>
                                    <h3 className="font-semibold text-slate-200">Dirección</h3>
                                    <p className="text-slate-300">Av. 25 de Mayo 555, Formosa, Argentina</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Right Column (Form) */}
                    <section className="md:col-span-3 p-8">
                        <form className="space-y-6">
                            <div>
                                <label htmlFor="name" className="form-label">Nombre Completo</label>
                                <input type="text" id="name" name="name" className="form-input"/>
                            </div>
                             <div>
                                <label htmlFor="email" className="form-label">Email</label>
                                <input type="email" id="email" name="email" className="form-input"/>
                            </div>
                             <div>
                                <label htmlFor="subject" className="form-label">Asunto</label>
                                <input type="text" id="subject" name="subject" className="form-input"/>
                            </div>
                             <div>
                                <label htmlFor="message" className="form-label">Mensaje</label>
                                <textarea id="message" name="message" rows={5} className="form-input"></textarea>
                            </div>
                            <div>
                                <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-transform duration-300 hover:scale-105">
                                    Enviar Mensaje
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ContactoPage;
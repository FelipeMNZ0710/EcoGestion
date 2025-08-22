import React, { useEffect, useState } from 'react';
import type { User } from '../types';

interface NewsArticle {
    id: number;
    image: string;
    category: string;
    title: string;
    date: string;
    featured: boolean;
}

const initialNews: NewsArticle[] = [
    { 
        id: 1,
        featured: true, 
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop",
        category: "Iniciativas",
        title: "Lanzamos nuevo programa de reciclaje en escuelas primarias",
        date: "15 de Julio, 2024"
    },
    { 
        id: 2,
        featured: false,
        image: "https://images.unsplash.com/photo-1605170425218-9df782293e27?q=80&w=2070&auto=format=fit=crop",
        category: "Consejos",
        title: "5 formas creativas de reutilizar frascos de vidrio en casa",
        date: "12 de Julio, 2024"
    },
    { 
        id: 3,
        featured: false,
        image: "https://images.unsplash.com/photo-1588289223825-c6b7d5930e84?q=80&w=2070&auto=format&fit=crop",
        category: "Eventos",
        title: "Resumen de la jornada de limpieza en la costanera",
        date: "10 de Julio, 2024"
    },
];

const NewsCard: React.FC<{ 
    article: NewsArticle; 
    user: User | null;
    isAdminMode: boolean;
    onEdit: (article: NewsArticle) => void;
    onDelete: (articleId: number) => void;
}> = ({ article, user, isAdminMode, onEdit, onDelete }) => {
    const { image, category, title, date, featured } = article;
    if (featured) {
        return (
            <div className="col-span-1 md:col-span-2 modern-card overflow-hidden group fade-in-section relative">
                 {user?.isAdmin && isAdminMode && (
                    <div className="card-admin-controls">
                        <button onClick={() => onEdit(article)} className="admin-action-button" title="Editar noticia"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg></button>
                        <button onClick={() => onDelete(article.id)} className="admin-action-button delete" title="Eliminar noticia"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                )}
                <div className="grid md:grid-cols-2">
                    <img src={image} alt={title} className="w-full h-full object-cover min-h-[250px]"/>
                    <div className="p-6 flex flex-col justify-center">
                        <p className="text-sm text-secondary font-semibold mb-2">{category}</p>
                        <h3 className="text-2xl font-bold text-text-main mb-3 group-hover:text-primary transition-colors">{title}</h3>
                        <p className="text-text-secondary text-sm mb-4">{date}</p>
                        <a href="#" className="font-semibold text-primary self-start">Leer más &rarr;</a>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="modern-card overflow-hidden group fade-in-section relative">
             {user?.isAdmin && isAdminMode && (
                <div className="card-admin-controls">
                    <button onClick={() => onEdit(article)} className="admin-action-button" title="Editar noticia"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg></button>
                    <button onClick={() => onDelete(article.id)} className="admin-action-button delete" title="Eliminar noticia"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            )}
            <img src={image} alt={title} className="w-full h-48 object-cover"/>
            <div className="p-4">
                <p className="text-sm text-secondary font-semibold mb-2">{category}</p>
                <h3 className="font-bold text-lg text-text-main mb-2 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-text-secondary text-xs mb-3">{date}</p>
                <a href="#" className="font-semibold text-sm text-primary">Leer más &rarr;</a>
            </div>
        </div>
    );
};

const SidebarWidget: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div className="modern-card p-4 fade-in-section">
        <h3 className="font-bold text-lg text-text-main border-b-2 border-slate-100 pb-2 mb-3">{title}</h3>
        {children}
    </div>
);

const NewsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (article: Omit<NewsArticle, 'id' | 'date'> & { id?: number }) => void;
    article: NewsArticle | null;
}> = ({ isOpen, onClose, onSave, article }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [featured, setFeatured] = useState(false);

    useEffect(() => {
        if (article) {
            setTitle(article.title);
            setCategory(article.category);
            setImage(article.image);
            setFeatured(article.featured);
        } else {
            setTitle('');
            setCategory('');
            setImage('');
            setFeatured(false);
        }
    }, [article, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: article?.id, title, category, image, featured });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-text-main mb-4">{article ? 'Editar Noticia' : 'Crear Nueva Noticia'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 modal-form">
                        <div><label htmlFor="title">Título</label><input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required /></div>
                        <div><label htmlFor="category">Categoría</label><input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} required /></div>
                        <div><label htmlFor="image">URL de la Imagen</label><input type="text" id="image" value={image} onChange={e => setImage(e.target.value)} required /></div>
                        <div className="flex items-center"><input id="featured" type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary" /><label htmlFor="featured" className="ml-2">¿Es una noticia destacada?</label></div>
                        <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button><button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar</button></div>
                    </form>
                </div>
            </div>
        </div>
    );
};


const NoticiasPage: React.FC<{user: User | null, isAdminMode: boolean}> = ({user, isAdminMode}) => {
    const [news, setNews] = useState<NewsArticle[]>(initialNews);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.fade-in-section');
        elements.forEach((el) => observer.observe(el));

        return () => elements.forEach((el) => observer.unobserve(el));
    }, [news]);
    
    const handleOpenModal = (article: NewsArticle | null = null) => {
        setEditingArticle(article);
        setIsModalOpen(true);
    };

    const handleSaveArticle = (article: Omit<NewsArticle, 'id' | 'date'> & { id?: number }) => {
        const date = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        if (article.id) {
            setNews(news.map(n => n.id === article.id ? { ...n, ...article, date } : n));
        } else {
            const newArticle = { ...article, id: Date.now(), date };
            setNews([newArticle, ...news]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteArticle = (articleId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
            setNews(news.filter(n => n.id !== articleId));
        }
    };
    
    const featuredArticle = news.find(n => n.featured);
    const otherArticles = news.filter(n => !n.featured);

    return (
        <div className="bg-background">
            <NewsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveArticle} article={editingArticle} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12 fade-in-section">
                    <h1 className="text-4xl font-extrabold text-text-main">Noticias y Novedades</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Mantenete al día con las últimas noticias, eventos y consejos de la comunidad de EcoGestión.</p>
                    {user?.isAdmin && isAdminMode && (
                        <div className="mt-4">
                            <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors">
                                Crear Nueva Noticia
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="grid md:grid-cols-2 gap-6">
                            {featuredArticle && <NewsCard article={featuredArticle} user={user} isAdminMode={isAdminMode} onEdit={handleOpenModal} onDelete={handleDeleteArticle} />}
                            {otherArticles.map(article => <NewsCard key={article.id} article={article} user={user} isAdminMode={isAdminMode} onEdit={handleOpenModal} onDelete={handleDeleteArticle} />)}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <SidebarWidget title="Categorías">
                           <ul className="space-y-2 text-text-secondary">
                               <li><a href="#" className="hover:text-primary">Iniciativas (5)</a></li>
                               <li><a href="#" className="hover:text-primary">Consejos (8)</a></li>
                               <li><a href="#" className="hover:text-primary">Eventos (3)</a></li>
                               <li><a href="#" className="hover:text-primary">Comunidad (2)</a></li>
                           </ul>
                        </SidebarWidget>
                         <SidebarWidget title="Próximos Eventos">
                           <div className="space-y-3">
                               <div>
                                   <p className="font-semibold text-text-main">Taller de Compostaje Urbano</p>
                                   <p className="text-sm text-text-secondary">3 de Agosto, 2024 - Centro Cultural</p>
                               </div>
                               <div>
                                   <p className="font-semibold text-text-main">Feria de Recicladores</p>
                                   <p className="text-sm text-text-secondary">17 de Agosto, 2024 - Plaza San Martín</p>
                               </div>
                           </div>
                        </SidebarWidget>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default NoticiasPage;
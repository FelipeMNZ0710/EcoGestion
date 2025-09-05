import React, { useEffect, useState, useMemo } from 'react';
import type { User, NewsArticle } from '../types';
import { initialNews } from '../data/newsData';
import NewsDetailModal from '../components/NewsDetailModal';

const ARTICLES_PER_PAGE = 5; // The number of articles to show initially and load more

const NewsCard: React.FC<{ 
    article: NewsArticle; 
    user: User | null;
    isAdminMode: boolean;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ article, user, isAdminMode, onClick, onEdit, onDelete }) => {
    const { image, category, title, date, excerpt } = article;

    const formattedDate = useMemo(() => {
        // Adding T00:00:00 ensures the date is parsed in the local timezone, preventing off-by-one day errors.
        const dateObj = new Date(`${date}T00:00:00`);
        return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(dateObj);
    }, [date]);

    return (
        <div className="modern-card overflow-hidden group fade-in-section relative flex flex-col h-full" onClick={onClick}>
            {user?.isAdmin && isAdminMode && (
                <div className="card-admin-controls">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="admin-action-button" title="Editar noticia"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="admin-action-button delete" title="Eliminar noticia"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            )}
            <img src={image} alt={title} className="w-full h-48 object-cover"/>
            <div className="p-4 flex flex-col flex-grow">
                <p className="text-sm text-secondary font-semibold mb-2">{category}</p>
                <h3 className="font-bold text-lg text-text-main mb-2 group-hover:text-primary transition-colors flex-grow">{title}</h3>
                <p className="text-text-secondary text-sm mb-4">{excerpt}</p>
                <p className="text-text-secondary text-xs mb-3">{formattedDate}</p>
                <span className="font-semibold text-sm text-primary mt-auto">Leer más &rarr;</span>
            </div>
        </div>
    );
};

const SidebarWidget: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div className="modern-card p-4 fade-in-section">
        <h3 className="font-bold font-display text-lg text-text-main border-b-2 border-white/10 pb-2 mb-3">{title}</h3>
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
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('[]');
    const [featured, setFeatured] = useState(false);

    useEffect(() => {
        if (article) {
            setTitle(article.title);
            setCategory(article.category);
            setImage(article.image);
            setExcerpt(article.excerpt);
            setContent(JSON.stringify(article.content, null, 2));
            setFeatured(article.featured);
        } else {
            setTitle('');
            setCategory('');
            setImage('');
            setExcerpt('');
            setContent('[\n  {\n    "type": "text",\n    "text": "Escribe aquí el contenido del artículo."\n  }\n]');
            setFeatured(false);
        }
    }, [article, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const parsedContent = JSON.parse(content);
            onSave({ id: article?.id, title, category, image, excerpt, content: parsedContent, featured });
        } catch (error) {
            alert("Error: El JSON en 'Contenido Completo' no es válido.");
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content !max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-xl font-bold font-display text-text-main mb-4">{article ? 'Editar Noticia' : 'Crear Nueva Noticia'}</h2>
                    <div className="space-y-4 modal-form">
                        <div><label>Título</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label>Categoría</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} required /></div>
                            <div><label>URL de la Imagen Principal</label><input type="text" value={image} onChange={e => setImage(e.target.value)} required /></div>
                        </div>
                        <div><label>Extracto (Resumen corto para la tarjeta)</label><textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} required></textarea></div>
                        <div><label>Contenido Completo (en formato JSON)</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={10} className="font-mono text-sm"></textarea></div>
                        <div><label className="custom-toggle-label"><input type="checkbox" className="custom-toggle-input" checked={featured} onChange={e => setFeatured(e.target.checked)} /><div className="custom-toggle-track"><div className="custom-toggle-thumb"></div></div><span className="ml-3 text-sm text-text-secondary">¿Es una noticia destacada?</span></label></div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 text-slate-100 rounded-md hover:bg-slate-500">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Robust date parsing function to avoid timezone issues
const parseDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    // The month is 0-indexed in JavaScript's Date constructor
    return new Date(year, month - 1, day);
};

const NoticiasPage: React.FC<{user: User | null, isAdminMode: boolean}> = ({user, isAdminMode}) => {
    const [news, setNews] = useState<NewsArticle[]>(initialNews);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todas');
    const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);
    
    const categories = useMemo(() => ['Todas', ...Array.from(new Set(news.map(n => n.category)))], [news]);

    const filteredArticles = useMemo(() => {
        return news
            .filter(article => {
                const matchesCategory = activeCategory === 'Todas' || article.category === activeCategory;
                const matchesSearch = searchTerm === '' || article.title.toLowerCase().includes(searchTerm.toLowerCase()) || article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesCategory && matchesSearch;
            })
            .sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
    }, [news, activeCategory, searchTerm]);
    
    const paginatedArticles = useMemo(() => filteredArticles.slice(1, visibleCount + 1), [filteredArticles, visibleCount]);
    
    useEffect(() => {
        setVisibleCount(ARTICLES_PER_PAGE);
    }, [activeCategory, searchTerm]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('.fade-in-section');
        elements.forEach((el) => {
            el.classList.remove('is-visible');
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, [paginatedArticles]);

    const handleOpenEditModal = (article: NewsArticle | null = null) => {
        setEditingArticle(article);
        setIsEditModalOpen(true);
    };

    const handleSaveArticle = (article: Omit<NewsArticle, 'id' | 'date'> & { id?: number }) => {
        const date = new Date().toISOString().split('T')[0];

        if (article.id) {
            setNews(news.map(n => n.id === article.id ? { ...n, ...article, date } as NewsArticle : n));
        } else {
            const newArticle: NewsArticle = { ...article, id: Date.now(), date } as NewsArticle;
            setNews([newArticle, ...news]);
        }
        setIsEditModalOpen(false);
    };

    const handleDeleteArticle = (articleId: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
            setNews(news.filter(n => n.id !== articleId));
        }
    };
    
    const heroArticle = filteredArticles[0];

    return (
        <div className="bg-background pt-20">
            <NewsModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveArticle} article={editingArticle} />
            {selectedArticle && <NewsDetailModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />}
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                {heroArticle && (
                    <section className="mb-12 relative rounded-xl overflow-hidden modern-card cursor-pointer" onClick={() => setSelectedArticle(heroArticle)}>
                        <img src={heroArticle.image} alt={heroArticle.title} className="w-full h-[50vh] object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <span className="text-sm font-semibold bg-primary px-3 py-1 rounded-full">{heroArticle.category}</span>
                            <h1 className="text-3xl lg:text-5xl font-bold font-display mt-4 leading-tight">{heroArticle.title}</h1>
                            <p className="mt-2 text-slate-300 max-w-2xl">{heroArticle.excerpt}</p>
                        </div>
                    </section>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="grid md:grid-cols-2 gap-6">
                            {paginatedArticles.map(article => 
                                <NewsCard key={article.id} article={article} user={user} isAdminMode={isAdminMode} 
                                    onClick={() => setSelectedArticle(article)}
                                    onEdit={() => handleOpenEditModal(article)} 
                                    onDelete={() => handleDeleteArticle(article.id)} />
                            )}
                        </div>
                         {visibleCount < filteredArticles.length -1 && (
                            <div className="text-center mt-12">
                                <button onClick={() => setVisibleCount(c => c + ARTICLES_PER_PAGE)} className="cta-button">
                                    Cargar Más Noticias
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {user?.isAdmin && isAdminMode && (
                             <button onClick={() => handleOpenEditModal()} className="w-full cta-button">
                                + Crear Nueva Noticia
                            </button>
                        )}
                        <SidebarWidget title="Buscar">
                            <input type="search" placeholder="Buscar noticias..." className="form-input w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </SidebarWidget>
                        <SidebarWidget title="Categorías">
                           <ul className="space-y-2 text-text-secondary">
                                {categories.map(category => (
                                    <li key={category}>
                                        <a href="#" 
                                           onClick={(e) => { e.preventDefault(); setActiveCategory(category); }} 
                                           className={`hover:text-primary transition-colors news-category-link ${activeCategory === category ? 'active' : ''}`}>
                                           {category}
                                        </a>
                                    </li>
                                ))}
                           </ul>
                        </SidebarWidget>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default NoticiasPage;
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.API_PORT || 3001;
const saltRounds = 10;

// --- Middlewares ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- DB Connection Test ---
const testDatabaseConnection = async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Conexión a la base de datos exitosa.');
        connection.release();
    } catch (error) {
        console.error('❌ ERROR CRÍTICO: No se pudo conectar a la base de datos.');
        console.error('DETALLES DEL ERROR:', error);
        process.exit(1);
    }
};

// --- Helper to format user for frontend ---
const formatUserForFrontend = async (dbUser) => {
    if (!dbUser) return null;

    // Fetch all possible achievements
    const [allAchievements] = await db.query('SELECT id, name, description, icon, unlock_type as unlockType, stat_name as statName, stat_value as statValue FROM achievements');
    
    // Fetch user's unlocked achievements
    const [unlockedAchievements] = await db.query('SELECT achievement_id FROM user_achievements WHERE user_id = ?', [dbUser.id]);
    const unlockedIds = new Set(unlockedAchievements.map(a => a.achievement_id));

    // Fetch user's favorite locations
    const [favorites] = await db.query('SELECT location_id FROM user_favorite_locations WHERE user_id = ?', [dbUser.id]);

    const formattedAchievements = allAchievements.map(ach => ({
        id: ach.id,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        unlocked: unlockedIds.has(ach.id),
        unlockCondition: {
            type: ach.unlockType,
            stat: ach.statName,
            value: ach.statValue
        }
    }));

    return {
        id: dbUser.id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        points: dbUser.points,
        kgRecycled: dbUser.kg_recycled,
        role: dbUser.role,
        achievements: formattedAchievements,
        favoriteLocations: favorites.map(f => f.location_id.toString()),
        lastLogin: dbUser.last_login,
        bannerUrl: dbUser.banner_url,
        profilePictureUrl: dbUser.profile_picture_url,
        title: dbUser.title,
        bio: dbUser.bio,
        socials: dbUser.socials ? (typeof dbUser.socials === 'string' ? JSON.parse(dbUser.socials) : dbUser.socials) : {},
        stats: { // These are still managed client-side for now, can be moved to DB later
            messagesSent: 0, pointsVisited: 0, reportsMade: 0, dailyLogins: 0, completedQuizzes: [], quizzesCompleted: 0, gamesPlayed: 0
        },
    };
};


// --- API ROUTES ---

// --- Auth ---
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos.' });
        }

        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }

        const password_hash = await bcrypt.hash(password, saltRounds);
        const last_login = new Date().toISOString().split('T')[0];

        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, last_login, role, points, kg_recycled) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, password_hash, last_login, 'usuario', 0, 0]
        );

        const [newUserRows] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        res.status(201).json(await formatUserForFrontend(newUserRows[0]));

    } catch (error) {
        console.error('[REGISTER] ERROR:', error);
        res.status(500).json({ message: 'Error en el servidor. Revisa la consola del backend.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
        
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
        
        const dbUser = users[0];
        const match = await bcrypt.compare(password, dbUser.password_hash);
        if (!match) return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
        
        res.status(200).json(await formatUserForFrontend(dbUser));
    } catch (error) {
        console.error('[LOGIN] ERROR:', error);
        res.status(500).json({ message: 'Error en el servidor al iniciar sesión.' });
    }
});

// --- User Profile & Favorites ---
app.put('/api/users/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const fieldsToUpdate = req.body;

        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
        }

        const columnMapping = {
            name: 'name',
            points: 'points',
            kgRecycled: 'kg_recycled',
            title: 'title',
            bio: 'bio',
            bannerUrl: 'banner_url',
            profilePictureUrl: 'profile_picture_url',
        };

        const setClauses = [];
        const values = [];

        for (const key in fieldsToUpdate) {
            if (columnMapping[key]) {
                setClauses.push(`${columnMapping[key]} = ?`);
                values.push(fieldsToUpdate[key]);
            }
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ message: 'Ninguno de los campos proporcionados es válido.' });
        }
        
        values.push(id);

        const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
        await db.query(sql, values);

        const [updatedUserRows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (updatedUserRows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado después de la actualización.' });
        }
        
        res.status(200).json(await formatUserForFrontend(updatedUserRows[0]));

    } catch (error) {
        console.error('[UPDATE PROFILE] ERROR:', error);
        res.status(500).json({ message: 'Error en el servidor al actualizar el perfil.' });
    }
});

app.put('/api/users/favorites', async (req, res) => {
    try {
        const { userId, locationId } = req.body;
        if (!userId || !locationId) return res.status(400).json({ message: "Faltan datos." });

        const [existing] = await db.query('SELECT * FROM user_favorite_locations WHERE user_id = ? AND location_id = ?', [userId, locationId]);

        if (existing.length > 0) {
            await db.query('DELETE FROM user_favorite_locations WHERE user_id = ? AND location_id = ?', [userId, locationId]);
        } else {
            await db.query('INSERT INTO user_favorite_locations (user_id, location_id) VALUES (?, ?)', [userId, locationId]);
        }

        const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        res.status(200).json(await formatUserForFrontend(userRows[0]));

    } catch (error) {
        console.error('[UPDATE FAVORITES] ERROR:', error);
        res.status(500).json({ message: 'Error al actualizar favoritos.' });
    }
});

// --- Achievements Management (Admin only) ---
app.put('/api/users/:userId/achievements', async (req, res) => {
    try {
        const { userId } = req.params;
        const { achievementId, unlocked, adminUserId } = req.body;

        const [adminUsers] = await db.query('SELECT role FROM users WHERE id = ?', [adminUserId]);
        if (adminUsers.length === 0 || adminUsers[0].role !== 'dueño') {
            return res.status(403).json({ message: 'Acción no autorizada.' });
        }

        if (unlocked) {
            await db.query('INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)', [userId, achievementId]);
        } else {
            await db.query('DELETE FROM user_achievements WHERE user_id = ? AND achievement_id = ?', [userId, achievementId]);
        }
        
        const [updatedUserRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        res.status(200).json(await formatUserForFrontend(updatedUserRows[0]));

    } catch (error) {
        console.error('[UPDATE ACHIEVEMENTS] ERROR:', error);
        res.status(500).json({ message: 'Error en el servidor al actualizar logros.' });
    }
});


// --- Puntos Verdes & Reports ---

// Map SVG dimensions and Formosa's approximate bounding box for stable pin positioning
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const MAP_PADDING = 50; // To avoid pins on the edges
const LAT_MIN = -26.22;
const LAT_MAX = -26.16;
const LNG_MIN = -58.24;
const LNG_MAX = -58.15;

const mapCoords = (lat, lng) => {
    const percentX = (lng - LNG_MIN) / (LNG_MAX - LNG_MIN);
    const percentY = (lat - LAT_MIN) / (LAT_MAX - LAT_MIN);

    const x = MAP_PADDING + percentX * (MAP_WIDTH - MAP_PADDING * 2);
    // Invert Y-axis for screen coordinates (0,0 is top-left)
    const y = MAP_PADDING + (1 - percentY) * (MAP_HEIGHT - MAP_PADDING * 2);
    
    // Clamp values to stay within map bounds
    return {
        x: Math.max(MAP_PADDING, Math.min(x, MAP_WIDTH - MAP_PADDING)),
        y: Math.max(MAP_PADDING, Math.min(y, MAP_HEIGHT - MAP_PADDING))
    };
};

app.get('/api/locations', async (req, res) => {
    try {
        const query = `
            SELECT l.*, GROUP_CONCAT(m.name) AS materials
            FROM locations l
            LEFT JOIN location_materials lm ON l.id = lm.location_id
            LEFT JOIN materials m ON lm.material_id = m.id
            GROUP BY l.id;
        `;
        const [locations] = await db.query(query);
        const formattedLocations = locations.map(loc => {
            const { x, y } = mapCoords(parseFloat(loc.latitude), parseFloat(loc.longitude));
            let imageUrls = ['https://images.unsplash.com/photo-1582029132869-755a953a7a2f?q=80&w=800&auto=format&fit=crop']; // Default image

            try {
                if(loc.image_urls) {
                    const parsed = JSON.parse(loc.image_urls);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        imageUrls = parsed;
                    }
                }
            } catch (e) {
                console.warn(`Could not parse image_urls for location ${loc.id}:`, loc.image_urls);
            }

            return {
                id: loc.id.toString(), name: loc.name, address: loc.address,
                hours: "Lunes a Viernes de 08:00 a 16:00",
                schedule: [{ days: [1, 2, 3, 4, 5], open: "08:00", close: "16:00" }],
                materials: loc.materials ? loc.materials.split(',') : [],
                mapData: { name: loc.name, id: loc.id.toString(), lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude), x, y },
                status: loc.status, description: loc.description, lastServiced: loc.last_serviced,
                checkIns: loc.check_ins,
                imageUrls: imageUrls
            };
        });
        res.json(formattedLocations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ message: 'Error al obtener los puntos verdes.' });
    }
});

app.post('/api/locations/report', async (req, res) => {
    try {
        const { locationId, userId, reason, comment, imageUrl } = req.body;
        if (!locationId || !userId || !reason) {
            return res.status(400).json({ message: 'Faltan datos para crear el reporte.' });
        }

        await db.query(
            'INSERT INTO location_reports (location_id, user_id, reason, comment, image_url) VALUES (?, ?, ?, ?, ?)',
            [locationId, userId, reason, comment || null, imageUrl || null]
        );

        await db.query("UPDATE locations SET status = 'reported' WHERE id = ?", [locationId]);

        res.status(201).json({ id: locationId, status: 'reported' });
    } catch (error) {
        console.error('[CREATE REPORT] ERROR:', error);
        res.status(500).json({ message: 'Error al guardar el reporte.' });
    }
});


// --- News Management (Protected) ---
const checkAdminRole = async (req, res, next) => {
    const { adminUserId } = req.body;
    if (!adminUserId) return res.status(401).json({ message: 'Autenticación requerida.' });
    
    try {
        const [users] = await db.query('SELECT role FROM users WHERE id = ?', [adminUserId]);
        if (users.length === 0 || (users[0].role !== 'dueño' && users[0].role !== 'moderador')) {
            return res.status(403).json({ message: 'Acción no autorizada.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error de servidor.' });
    }
};

app.get('/api/news', async (req, res) => {
    try {
        const [articles] = await db.query('SELECT * FROM news_articles ORDER BY published_at DESC, id DESC');
        const formattedArticles = articles.map(article => ({
            id: article.id,
            image: article.image_url,
            category: article.category,
            title: article.title,
            date: article.published_at.toISOString().split('T')[0],
            excerpt: article.excerpt,
            content: typeof article.content === 'string' ? JSON.parse(article.content) : article.content,
            featured: !!article.is_featured,
        }));
        res.json(formattedArticles);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ message: 'Error al obtener las noticias.' });
    }
});

app.post('/api/news', checkAdminRole, async (req, res) => {
    try {
        const { title, category, image, excerpt, content, featured } = req.body;
        const date = new Date().toISOString().split('T')[0];
        const [result] = await db.query(
            'INSERT INTO news_articles (title, category, image_url, excerpt, content, is_featured, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, category, image, excerpt, JSON.stringify(content), featured, date]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ message: 'Error al crear la noticia.' });
    }
});

app.put('/api/news/:id', checkAdminRole, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, image, excerpt, content, featured } = req.body;
        await db.query(
            'UPDATE news_articles SET title = ?, category = ?, image_url = ?, excerpt = ?, content = ?, is_featured = ? WHERE id = ?',
            [title, category, image, excerpt, JSON.stringify(content), featured, id]
        );
        res.status(200).json({ message: 'Noticia actualizada.' });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ message: 'Error al actualizar la noticia.' });
    }
});

app.delete('/api/news/:id', checkAdminRole, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM news_articles WHERE id = ?', [id]);
        res.status(200).json({ message: 'Noticia eliminada.' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ message: 'Error al eliminar la noticia.' });
    }
});

// --- Community Endpoints ---
app.get('/api/community/channels', async (req, res) => {
    try {
        const [channels] = await db.query('SELECT * FROM channels ORDER BY id');
        res.json(channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/community/members', async (req, res) => {
    try {
        const [members] = await db.query("SELECT id, name, profile_picture_url, role FROM users WHERE role IN ('dueño', 'moderador', 'usuario') ORDER BY CASE WHEN role = 'dueño' THEN 1 WHEN role = 'moderador' THEN 2 ELSE 3 END, name");
        const formattedMembers = members.map(m => ({ ...m, is_admin: m.role === 'dueño' || m.role === 'moderador' }));
        res.json(formattedMembers);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/community/messages/:channelId', async (req, res) => {
    try {
        const { channelId } = req.params;
        const query = `
            SELECT cm.id, u.name as user, u.profile_picture_url as avatarUrl, cm.content as text, cm.created_at as timestamp, cm.is_edited as edited
            FROM community_messages cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.channel_id = ?
            ORDER BY cm.created_at ASC;
        `;
        const [messages] = await db.query(query, [channelId]);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Server error');
    }
});

app.post('/api/community/messages', async (req, res) => {
    try {
        const { channelId, userId, content } = req.body;
        if (!channelId || !userId || !content) return res.status(400).send('Missing fields');
        const [result] = await db.query('INSERT INTO community_messages (channel_id, user_id, content) VALUES (?, ?, ?)', [channelId, userId, content]);
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Server error');
    }
});

// --- Contact & Admin Panel Endpoints ---
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }
        await db.query(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );
        res.status(201).json({ message: 'Mensaje enviado exitosamente.' });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ message: 'Error al enviar el mensaje.' });
    }
});

app.get('/api/admin/messages', async (req, res) => {
    // This could be protected by a middleware in a real app
    try {
        const [messages] = await db.query('SELECT * FROM contact_messages ORDER BY submitted_at DESC');
        res.json(messages);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ message: 'Error al obtener mensajes.' });
    }
});

app.put('/api/admin/messages/:id', checkAdminRole, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['read', 'unread', 'archived'].includes(status)) {
            return res.status(400).json({ message: 'Estado no válido.' });
        }
        await db.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
        res.status(200).json({ message: 'Estado actualizado.' });
    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({ message: 'Error al actualizar el estado.' });
    }
});

app.get('/api/admin/reports', async (req, res) => {
     try {
        const query = `
            SELECT r.id, l.name as locationName, u.name as userName, r.reason, r.comment, r.image_url as imageUrl, r.status, r.reported_at
            FROM location_reports r
            JOIN locations l ON r.location_id = l.id
            JOIN users u ON r.user_id = u.id
            ORDER BY r.reported_at DESC;
        `;
        const [reports] = await db.query(query);
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error al obtener reportes.' });
    }
});

app.put('/api/admin/reports/:id', checkAdminRole, async (req, res) => {
     try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['resolved', 'dismissed', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Estado no válido.' });
        }
        await db.query('UPDATE location_reports SET status = ? WHERE id = ?', [status, id]);
        res.status(200).json({ message: 'Estado del reporte actualizado.' });
    } catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({ message: 'Error al actualizar el estado del reporte.' });
    }
});

// --- Recycling Guide Endpoint ---
app.get('/api/recycling-guides', async (req, res) => {
    try {
        const [guides] = await db.query('SELECT * FROM recycling_guides');
        const [items] = await db.query('SELECT * FROM guide_content_items');
        const [steps] = await db.query('SELECT * FROM guide_process_steps ORDER BY step_number');
        const [stats] = await db.query('SELECT * FROM guide_impact_stats');
        const [questions] = await db.query('SELECT * FROM quiz_questions');
        const [options] = await db.query('SELECT * FROM quiz_options');

        const guidesData = {};

        for (const guide of guides) {
            const guideId = guide.id;
            
            const guideQuestions = questions.filter(q => q.guide_id === guideId).map(q => ({
                question: q.question_text,
                options: options.filter(o => o.question_id === q.id).map(o => o.option_text),
                correctAnswer: options.filter(o => o.question_id === q.id).findIndex(o => o.is_correct)
            }));
            
            guidesData[guideId] = {
                name: guide.name,
                tip: guide.tip,
                yes: items.filter(i => i.guide_id === guideId && i.type === 'yes').map(i => ({ text: i.text, icon: i.icon })),
                no: items.filter(i => i.guide_id === guideId && i.type === 'no').map(i => ({ text: i.text, icon: i.icon })),
                commonMistakes: items.filter(i => i.guide_id === guideId && i.type === 'mistake').map(i => i.text),
                recyclingProcess: steps.filter(s => s.guide_id === guideId).map(s => ({ step: s.step_number, title: s.title, description: s.description, icon: s.icon })),
                impactStats: stats.filter(s => s.guide_id === guideId).map(s => ({ stat: s.stat_name, value: s.value, icon: s.icon })),
                quiz: {
                    points: guide.quiz_points,
                    questions: guideQuestions
                }
            };
        }
        
        res.json(guidesData);

    } catch (error) {
        console.error('Error fetching recycling guides:', error);
        res.status(500).json({ message: 'Error al obtener las guías de reciclaje.' });
    }
});


// --- Start Server ---
const startServer = async () => {
    await testDatabaseConnection();
    app.listen(port, () => {
        console.log(`🚀 Servidor de EcoGestión escuchando en http://localhost:${port}`);
    });
};

startServer();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');
const comoReciclarData = require('./data/comoReciclarData');
const { processAction } = require('./services/gamificationService');
const gamesData = require('./data/gamesData');
require('dotenv').config();

const app = express();
const port = process.env.API_PORT || 3001;
const saltRounds = 10;

// --- Middlewares ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Database Initialization Logic ---
const initializeDatabase = async () => {
    try {
        const connection = await db.getConnection();
        console.log('✅ Conexión a la base de datos exitosa.');
        
        // --- Impact Stats Table ---
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`impact_stats\` (
              \`id\` INT NOT NULL AUTO_INCREMENT,
              \`recycled_kg\` INT NOT NULL DEFAULT 0,
              \`participants\` INT NOT NULL DEFAULT 0,
              \`points\` INT NOT NULL DEFAULT 0,
              PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Tabla "impact_stats" asegurada.');
        const [statsRows] = await db.query('SELECT * FROM impact_stats WHERE id = 1');
        if (statsRows.length === 0) {
            await db.query(`INSERT INTO \`impact_stats\` (\`id\`, \`recycled_kg\`, \`participants\`, \`points\`) VALUES (1, 14800, 5350, 48);`);
            console.log('✅ Datos iniciales de estadísticas insertados.');
        } else {
            console.log('✅ Fila de estadísticas verificada.');
        }

        // --- News Articles Table ---
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`news_articles\` (
              \`id\` int(11) NOT NULL AUTO_INCREMENT,
              \`title\` varchar(255) NOT NULL,
              \`category\` varchar(100) NOT NULL,
              \`excerpt\` text NOT NULL,
              \`image\` mediumtext DEFAULT NULL,
              \`content\` mediumtext DEFAULT NULL,
              \`featured\` tinyint(1) DEFAULT 0,
              \`author_id\` int(11) DEFAULT NULL,
              \`published_at\` timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Tabla "news_articles" asegurada.');

        const dbName = process.env.DB_NAME || 'ecogestion_db';
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'news_articles' 
            AND COLUMN_NAME IN ('image', 'content')`,
            [dbName]
        );

        for (const column of columns) {
            if (column.DATA_TYPE.toLowerCase() !== 'mediumtext') {
                console.warn(`⚠️  Columna "${column.COLUMN_NAME}" en "news_articles" tiene un tipo incorrecto (${column.DATA_TYPE}). Modificando a MEDIUMTEXT...`);
                await connection.query(`ALTER TABLE \`news_articles\` MODIFY COLUMN \`${column.COLUMN_NAME}\` MEDIUMTEXT;`);
                console.log(`✅  Columna "${column.COLUMN_NAME}" actualizada a MEDIUMTEXT.`);
            }
        }
        console.log('✅ Columnas de "news_articles" verificadas.');
        
        // --- Games Table ---
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`games\` (
              \`id\` int(11) NOT NULL AUTO_INCREMENT,
              \`title\` varchar(255) NOT NULL,
              \`category\` varchar(100) NOT NULL,
              \`image\` varchar(255) NOT NULL,
              \`type\` varchar(50) NOT NULL,
              \`learningObjective\` text NOT NULL,
              \`payload\` json DEFAULT NULL,
              \`rating\` decimal(3,2) DEFAULT 3.50,
              \`ratings_count\` int(11) DEFAULT 0,
              PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Tabla "games" asegurada.');
        
        const [gameRows] = await db.query('SELECT COUNT(*) as count FROM games');
        if (gameRows[0].count === 0) {
            console.log('⏳ La tabla "games" está vacía. Poblando con datos iniciales...');
            const query = 'INSERT INTO games (id, title, category, image, type, learningObjective, payload, rating) VALUES ?';
            const values = gamesData.map(g => [g.id, g.title, g.category, g.image, g.type, g.learningObjective, JSON.stringify(g.payload), g.rating]);
            await connection.query(query, [values]);
            console.log(`✅ ¡${gamesData.length} juegos insertados en la base de datos!`);
        } else {
            console.log('✅ Tabla "games" verificada.');
        }


        // --- User Game Scores Table ---
        await connection.query(`
             CREATE TABLE IF NOT EXISTS \`user_game_scores\` (
              \`user_id\` int(11) NOT NULL,
              \`game_id\` int(11) NOT NULL,
              \`high_score\` int(11) NOT NULL DEFAULT 0,
              PRIMARY KEY (\`user_id\`, \`game_id\`),
              KEY \`game_id\` (\`game_id\`),
              CONSTRAINT \`user_game_scores_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
              CONSTRAINT \`user_game_scores_ibfk_2\` FOREIGN KEY (\`game_id\`) REFERENCES \`games\` (\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✅ Tabla "user_game_scores" asegurada.');

        connection.release();

    } catch (error) {
        console.error('❌ ERROR CRÍTICO durante la inicialización de la base de datos:', error);
        throw error;
    }
};

// --- Helper to format user for frontend ---
const formatUserForFrontend = (dbUser) => {
    if (!dbUser) return null;
    const { allAchievements } = require('./data/achievementsData');
    
    const unlockedIds = new Set(dbUser.unlocked_achievements ? JSON.parse(dbUser.unlocked_achievements) : []);
    
    const userAchievements = allAchievements.map(ach => ({
        ...ach,
        unlocked: unlockedIds.has(ach.id)
    }));

    return {
        id: dbUser.id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        points: dbUser.points,
        kgRecycled: parseFloat(dbUser.kg_recycled),
        role: dbUser.role,
        achievements: userAchievements,
        favoriteLocations: dbUser.favorite_locations ? JSON.parse(dbUser.favorite_locations) : [],
        lastLogin: dbUser.last_login ? new Date(dbUser.last_login).toISOString().split('T')[0] : null,
        bannerUrl: dbUser.banner_url,
        profilePictureUrl: dbUser.profile_picture_url,
        title: dbUser.title,
        bio: dbUser.bio,
        socials: dbUser.socials ? JSON.parse(dbUser.socials) : {},
        stats: dbUser.stats ? JSON.parse(dbUser.stats) : {
            messagesSent: 0, pointsVisited: 0, reportsMade: 0, dailyLogins: 0, completedQuizzes: [], quizzesCompleted: 0, gamesPlayed: 0, objectsIdentified: 0
        },
    };
};


// --- API ROUTES ---

// --- Auth ---
app.post('/api/register', async (req, res) => {
    console.log('\n[REGISTER] Petición recibida para registrar nuevo usuario.');
    try {
        const { name, email, password } = req.body;
        console.log(`[REGISTER] Datos recibidos: email=${email}, name=${name}`);
        if (!name || !email || !password) {
            console.log('[REGISTER] Error: Faltan campos requeridos.');
            return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos.' });
        }

        console.log('[REGISTER] Verificando si el email ya existe en la DB...');
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            console.log(`[REGISTER] Error: El email ${email} ya está registrado.`);
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }
        console.log('[REGISTER] Email disponible. Procediendo con el registro.');

        console.log('[REGISTER] Hasheando contraseña...');
        const password_hash = await bcrypt.hash(password, saltRounds);
        const last_login = new Date();
        const defaultStats = JSON.stringify({ messagesSent: 0, pointsVisited: 0, reportsMade: 0, dailyLogins: 1, completedQuizzes: [], quizzesCompleted: 0, gamesPlayed: 0, objectsIdentified: 0 });
        console.log('[REGISTER] Contraseña hasheada. Preparando para insertar en la DB...');

        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, last_login, role, points, kg_recycled, stats) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, password_hash, last_login, 'usuario', 0, 0, defaultStats]
        );
        console.log(`[REGISTER] ¡ÉXITO! Usuario insertado en la DB con ID: ${result.insertId}.`);

        console.log('[REGISTER] Obteniendo datos del nuevo usuario para devolver al frontend...');
        const [newUserRows] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        console.log('[REGISTER] Usuario obtenido. Enviando respuesta 201 al frontend.');
        res.status(201).json(formatUserForFrontend(newUserRows[0]));

    } catch (error) {
        console.error('----------------------------------------------------');
        console.error('>>> [REGISTER] ¡ERROR CRÍTICO DURANTE EL REGISTRO! <<<');
        console.error('----------------------------------------------------');
        console.error('Este es el error que impide guardar el usuario en la base de datos:');
        console.error(error);
        console.error('----------------------------------------------------');
        console.error('POSIBLES CAUSAS:');
        console.error('1. La base de datos "ecogestion_db" no existe o no la creaste con el script SQL.');
        console.error('2. La tabla "users" no existe o sus columnas tienen nombres diferentes a los esperados.');
        console.error('3. Los datos en el archivo .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) son incorrectos.');
        console.error('----------------------------------------------------');
        res.status(500).json({ message: 'Error en el servidor. Revisa la consola del backend para más detalles.' });
    }
});

app.post('/api/login', async (req, res) => {
    console.log(`\n[LOGIN] Petición de inicio de sesión para ${req.body.email}.`);
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
        
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            console.log(`[LOGIN] Fallo: Email no encontrado.`);
            return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
        }
        
        const dbUser = users[0];
        const match = await bcrypt.compare(password, dbUser.password_hash);
        if (!match) {
            console.log(`[LOGIN] Fallo: Contraseña incorrecta para ${email}.`);
            return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
        }
        
        console.log(`[LOGIN] Éxito: Usuario ${email} autenticado. Actualizando last_login...`);
        await db.query('UPDATE users SET last_login = ? WHERE id = ?', [new Date(), dbUser.id]);
        
        const [refetchedUser] = await db.query('SELECT * FROM users WHERE id = ?', [dbUser.id]);

        res.status(200).json(formatUserForFrontend(refetchedUser[0]));
    } catch (error) {
        console.error('[LOGIN] ERROR:', error);
        res.status(500).json({ message: 'Error en el servidor al iniciar sesión.' });
    }
});

// --- User Profile, Favorites & Actions ---
app.post('/api/user-action', async (req, res) => {
    try {
        const { userId, action, payload } = req.body;
        
        if (action === 'check_in' && payload?.locationId) {
            await db.query('UPDATE locations SET check_ins = check_ins + 1 WHERE id = ?', [payload.locationId]);
        }
        
        if (action === 'complete_game' && payload?.gameId && payload?.score !== undefined) {
             await db.query(
                `INSERT INTO user_game_scores (user_id, game_id, high_score) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE high_score = IF(VALUES(high_score) > high_score, VALUES(high_score), high_score)`,
                [userId, payload.gameId, payload.score]
            );
        }

        const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });
        
        const dbUser = userRows[0];
        // Parse JSON fields for the service
        dbUser.stats = dbUser.stats ? JSON.parse(dbUser.stats) : {};
        dbUser.unlocked_achievements = dbUser.unlocked_achievements ? JSON.parse(dbUser.unlocked_achievements) : [];

        const { updatedUser, notifications } = processAction(dbUser, action, payload);

        // Persist changes to DB
        await db.query(
            'UPDATE users SET points = ?, last_login = ?, stats = ?, unlocked_achievements = ? WHERE id = ?',
            [
                updatedUser.points,
                updatedUser.last_login,
                JSON.stringify(updatedUser.stats),
                JSON.stringify(updatedUser.unlocked_achievements),
                userId
            ]
        );
        
        const [refetchedUser] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

        res.status(200).json({
            updatedUser: formatUserForFrontend(refetchedUser[0]),
            notifications
        });

    } catch (error) {
        console.error('[USER ACTION] ERROR:', error);
        res.status(500).json({ message: 'Error en el servidor al procesar la acción.' });
    }
});

app.put('/api/users/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const fieldsToUpdate = req.body;

        if (Object.keys(fieldsToUpdate).length === 0) return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
        
        const columnMapping = {
            name: 'name', points: 'points', kgRecycled: 'kg_recycled', title: 'title', bio: 'bio', bannerUrl: 'banner_url', profilePictureUrl: 'profile_picture_url',
        };

        const setClauses = [], values = [];
        for (const key in fieldsToUpdate) {
            if (columnMapping[key]) {
                setClauses.push(`${columnMapping[key]} = ?`);
                values.push(fieldsToUpdate[key]);
            }
        }
        if (setClauses.length === 0) return res.status(400).json({ message: 'Ninguno de los campos proporcionados es válido.' });
        
        values.push(id);
        const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
        await db.query(sql, values);

        const [updatedUserRows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (updatedUserRows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado después de la actualización.' });
        
        res.status(200).json(formatUserForFrontend(updatedUserRows[0]));
    } catch (error) {
        console.error('[UPDATE PROFILE] ERROR:', error);
        res.status(500).json({ message: 'Error en el servidor al actualizar el perfil.' });
    }
});

app.put('/api/users/favorites', async (req, res) => {
    try {
        const { userId, locationId } = req.body;
        
        const [users] = await db.query('SELECT favorite_locations FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });
        
        let favorites = users[0].favorite_locations ? JSON.parse(users[0].favorite_locations) : [];
        const index = favorites.indexOf(locationId);
        if (index > -1) favorites.splice(index, 1); else favorites.push(locationId);
        
        await db.query('UPDATE users SET favorite_locations = ? WHERE id = ?', [JSON.stringify(favorites), userId]);

        const [updatedUserRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        res.status(200).json(formatUserForFrontend(updatedUserRows[0]));
    } catch (error) {
        console.error('[UPDATE FAVORITES] ERROR:', error);
        res.status(500).json({ message: 'Error en el servidor al actualizar favoritos.' });
    }
});

// --- Puntos Verdes & Reports ---
app.get('/api/locations', async (req, res) => {
    try {
        const [locations] = await db.query(`
            SELECT l.*, COUNT(r.id) as reportCount 
            FROM locations l 
            LEFT JOIN reports r ON l.id = r.location_id AND r.status = 'pending' 
            GROUP BY l.id
        `);
        const formattedLocations = locations.map(loc => ({
            ...loc,
            schedule: JSON.parse(loc.schedule || '[]'),
            materials: JSON.parse(loc.materials || '[]'),
            mapData: JSON.parse(loc.map_data || '{}'),
            imageUrls: JSON.parse(loc.image_urls || '[]'),
            lastServiced: loc.last_serviced ? new Date(loc.last_serviced).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            reportCount: loc.reportCount || 0
        }));
        res.json(formattedLocations);
    } catch(error) {
        console.error("[GET LOCATIONS] ERROR:", error);
        res.status(500).json({ message: "Error al obtener los puntos verdes." });
    }
});

app.post('/api/locations', async (req, res) => {
    try {
        const newLocation = req.body;
        // Basic validation
        if (!newLocation.id || !newLocation.name || !newLocation.address) {
            return res.status(400).json({ message: 'ID, Nombre y Dirección son requeridos.' });
        }
        const [result] = await db.query(
            'INSERT INTO locations (id, name, address, description, hours, schedule, materials, map_data, status, last_serviced, check_ins, image_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newLocation.id, newLocation.name, newLocation.address, newLocation.description, newLocation.hours, JSON.stringify(newLocation.schedule || []), JSON.stringify(newLocation.materials || []), JSON.stringify(newLocation.mapData || {}), newLocation.status || 'ok', newLocation.lastServiced || new Date(), 0, JSON.stringify(newLocation.imageUrls || [])]
        );
        const [insertedRow] = await db.query('SELECT * FROM locations WHERE id = ?', [newLocation.id]);
        res.status(201).json(insertedRow[0]);
    } catch(error) {
        console.error("[CREATE LOCATION] ERROR:", error);
        res.status(500).json({ message: "Error al crear la ubicación." });
    }
});

app.put('/api/locations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedLocation = req.body;
        // ... validation ...
        await db.query(
            'UPDATE locations SET name = ?, address = ?, description = ?, hours = ?, schedule = ?, materials = ?, map_data = ?, status = ?, last_serviced = ?, image_urls = ? WHERE id = ?',
            [updatedLocation.name, updatedLocation.address, updatedLocation.description, updatedLocation.hours, JSON.stringify(updatedLocation.schedule), JSON.stringify(updatedLocation.materials), JSON.stringify(updatedLocation.mapData), updatedLocation.status, updatedLocation.lastServiced, JSON.stringify(updatedLocation.imageUrls), id]
        );
        const [updatedRow] = await db.query('SELECT * FROM locations WHERE id = ?', [id]);
        res.status(200).json(updatedRow[0]);
    } catch(error) {
        console.error("[UPDATE LOCATION] ERROR:", error);
        res.status(500).json({ message: "Error al actualizar la ubicación." });
    }
});

app.delete('/api/locations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM reports WHERE location_id = ?', [id]);
        await db.query('DELETE FROM locations WHERE id = ?', [id]);
        res.status(200).json({ message: 'Ubicación eliminada.' });
    } catch(error) {
        console.error("[DELETE LOCATION] ERROR:", error);
        res.status(500).json({ message: "Error al eliminar la ubicación." });
    }
});

app.post('/api/locations/report', async (req, res) => {
    try {
        const { locationId, userId, reason, comment, imageUrl } = req.body;
        await db.query(
            'INSERT INTO reports (user_id, location_id, reason, comment, image_url) VALUES (?, ?, ?, ?, ?)',
            [userId, locationId, reason, comment, imageUrl]
        );
        await db.query("UPDATE locations SET status = 'reported' WHERE id = ?", [locationId]);
        
        const [updatedLocations] = await db.query('SELECT * FROM locations WHERE id = ?', [locationId]);
        res.status(201).json(updatedLocations[0]);
    } catch (error) {
        console.error("[REPORT LOCATION] ERROR:", error);
        res.status(500).json({ message: "Error al enviar el reporte." });
    }
});

// --- News Management ---
app.get('/api/news', async (req, res) => {
    try {
        const [articles] = await db.query('SELECT * FROM news_articles ORDER BY published_at DESC, id DESC');
        const formattedNews = articles.map(art => ({
            id: art.id,
            image: art.image,
            category: art.category,
            title: art.title,
            date: new Date(art.published_at).toISOString().split('T')[0],
            excerpt: art.excerpt,
            content: JSON.parse(art.content || '[]'),
            featured: !!art.featured
        }));
        res.json(formattedNews);
    } catch (error) {
        console.error("[GET NEWS] ERROR:", error);
        res.status(500).json({ message: "Error al obtener las noticias." });
    }
});

app.post('/api/news', async (req, res) => {
    try {
        const { title, category, image, excerpt, content, featured, adminUserId } = req.body;
        const [result] = await db.query(
            `INSERT INTO news_articles (title, category, image, excerpt, content, featured, author_id, published_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [title, category, image, excerpt, JSON.stringify(content), featured, adminUserId]
        );
        res.status(201).json({ id: result.insertId, message: 'Noticia creada.' });
    } catch (error) {
        console.error("[CREATE NEWS] ERROR:", error);
        res.status(500).json({ message: "Error al crear la noticia." });
    }
});

app.put('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, image, excerpt, content, featured } = req.body;
        await db.query(
            `UPDATE news_articles SET title = ?, category = ?, image = ?, excerpt = ?, content = ?, featured = ?
             WHERE id = ?`,
            [title, category, image, excerpt, JSON.stringify(content), featured, id]
        );
        res.status(200).json({ message: 'Noticia actualizada.' });
    } catch (error) {
        console.error("[UPDATE NEWS] ERROR:", error);
        res.status(500).json({ message: "Error al actualizar la noticia." });
    }
});

app.delete('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM news_articles WHERE id = ?', [id]);
        res.status(200).json({ message: 'Noticia eliminada.' });
    } catch (error) {
        console.error("[DELETE NEWS] ERROR:", error);
        res.status(500).json({ message: "Error al eliminar la noticia." });
    }
});

// --- Games Management ---
app.get('/api/games', async (req, res) => {
    try {
        const { userId } = req.query;
        let games;
        if (userId) {
            [games] = await db.query(
                `SELECT g.*, ugs.high_score 
                 FROM games g 
                 LEFT JOIN user_game_scores ugs ON g.id = ugs.game_id AND ugs.user_id = ? 
                 ORDER BY g.id ASC`, 
                [userId]
            );
        } else {
            [games] = await db.query('SELECT * FROM games ORDER BY id ASC');
        }

        const formattedGames = games.map(g => ({
            id: g.id,
            title: g.title,
            category: g.category,
            image: g.image,
            type: g.type,
            learningObjective: g.learningObjective,
            payload: JSON.parse(g.payload || '{}'),
            rating: g.rating ? parseFloat(g.rating) : 3.5,
            userHighScore: g.high_score !== null && g.high_score !== undefined ? g.high_score : 0,
        }));
        res.json(formattedGames);
    } catch (error) {
        console.error('[GET GAMES] ERROR:', error);
        res.status(500).json({ message: 'Error al obtener los juegos.' });
    }
});

app.post('/api/games', async (req, res) => {
    try {
        const { title, category, image, type, learningObjective, payload } = req.body;
        const [result] = await db.query(
            `INSERT INTO games (title, category, image, type, learningObjective, payload) VALUES (?, ?, ?, ?, ?, ?)`,
            [title, category, image, type, learningObjective, JSON.stringify(payload)]
        );
        res.status(201).json({ id: result.insertId, message: 'Juego creado.' });
    } catch (error) {
        console.error('[CREATE GAME] ERROR:', error);
        res.status(500).json({ message: 'Error al crear el juego.' });
    }
});

app.put('/api/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, image, type, learningObjective, payload } = req.body;
        const [result] = await db.query(
            `UPDATE games SET title = ?, category = ?, image = ?, type = ?, learningObjective = ?, payload = ? WHERE id = ?`,
            [title, category, image, type, learningObjective, JSON.stringify(payload), id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Juego no encontrado.' });
        res.status(200).json({ message: 'Juego actualizado.' });
    } catch (error) {
        console.error('[UPDATE GAME] ERROR:', error);
        res.status(500).json({ message: 'Error al actualizar el juego.' });
    }
});

app.delete('/api/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM user_game_scores WHERE game_id = ?', [id]);
        const [result] = await db.query('DELETE FROM games WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Juego no encontrado.' });
        res.status(200).json({ message: 'Juego eliminado.' });
    } catch (error) {
        console.error('[DELETE GAME] ERROR:', error);
        res.status(500).json({ message: 'Error al eliminar el juego.' });
    }
});


// --- Community Endpoints ---
let communityChannels = [
    { id: 1, name: 'general', description: 'Charlas generales' },
    { id: 2, name: 'dudas', description: 'Preguntas sobre reciclaje' },
    { id: 3, name: 'anuncios', description: 'Anuncios importantes', admin_only_write: true },
];
let nextChannelId = 4;

const isAdmin = async (req, res, next) => {
    const { userId, userRole } = req.body;
    if (userRole === 'dueño' || userRole === 'moderador') {
        return next();
    }
    if (userId) {
        try {
            const [users] = await db.query('SELECT role FROM users WHERE id = ?', [userId]);
            if (users.length > 0 && (users[0].role === 'dueño' || users[0].role === 'moderador')) {
                return next();
            }
        } catch (e) {
            return res.status(500).json({ message: "Error de servidor." });
        }
    }
    return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
};

app.get('/api/community/channels', async (req, res) => {
    res.json(communityChannels);
});

app.post('/api/community/channels', isAdmin, async (req, res) => {
    const { name, description, admin_only_write } = req.body;
    if (!name || !description) {
        return res.status(400).json({ message: 'Nombre y descripción son requeridos.' });
    }
    const newChannel = {
        id: nextChannelId++,
        name: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description,
        admin_only_write: !!admin_only_write
    };
    communityChannels.push(newChannel);
    res.status(201).json(newChannel);
});

app.delete('/api/community/channels/:id', isAdmin, async (req, res) => {
    const channelId = parseInt(req.params.id, 10);
    const channelIndex = communityChannels.findIndex(c => c.id === channelId);

    if (channelIndex === -1) return res.status(404).json({ message: 'Canal no encontrado.' });
    if (channelId === 1) return res.status(400).json({ message: 'No se puede eliminar el canal #general.' });

    communityChannels.splice(channelIndex, 1);
    
    try {
        await db.query('DELETE FROM community_messages WHERE channel_id = ?', [channelId]);
    } catch(error) {
        console.error(`[DELETE CHANNEL MESSAGES] Error:`, error);
    }
    
    res.status(200).json({ message: 'Canal eliminado.' });
});

app.get('/api/community/members', async (req, res) => {
     try {
        const [members] = await db.query("SELECT id, name, profile_picture_url, role FROM users ORDER BY name");
        const formattedMembers = members.map(m => ({
            id: m.id.toString(),
            name: m.name,
            profile_picture_url: m.profile_picture_url,
            is_admin: m.role === 'dueño' || m.role === 'moderador'
        }));
        res.json(formattedMembers);
    } catch (error) {
        console.error('[GET MEMBERS] Error:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/community/messages/:channelId', async (req, res) => {
    try {
        const { channelId } = req.params;
        const [messages] = await db.query(
            `SELECT 
                m.id, m.user_id, m.content, m.created_at, m.edited, m.reactions, m.replying_to_message_id,
                u.name as user, u.profile_picture_url as avatarUrl
             FROM community_messages m 
             JOIN users u ON m.user_id = u.id 
             WHERE m.channel_id = ? 
             ORDER BY m.created_at ASC`, [channelId]
        );
        
        const replyIds = messages.map(m => m.replying_to_message_id).filter(id => id);
        let repliesMap = {};
        if (replyIds.length > 0) {
            const [replyMessages] = await db.query(
                `SELECT m.id, m.content, u.name as user 
                 FROM community_messages m 
                 JOIN users u ON m.user_id = u.id 
                 WHERE m.id IN (?)`, [replyIds]
            );
            repliesMap = replyMessages.reduce((acc, reply) => {
                acc[reply.id] = { messageId: reply.id, user: reply.user, text: reply.content };
                return acc;
            }, {});
        }
        
        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            user_id: msg.user_id.toString(),
            user: msg.user,
            avatarUrl: msg.avatarUrl,
            timestamp: msg.created_at,
            text: msg.content,
            edited: msg.edited,
            reactions: msg.reactions ? JSON.parse(msg.reactions) : {},
            replyingTo: msg.replying_to_message_id ? repliesMap[msg.replying_to_message_id] : null
        }));
        
        res.json(formattedMessages);
    } catch (error) {
        console.error(`[GET MESSAGES] Error:`, error);
        res.status(500).json({ message: 'Error al obtener mensajes.' });
    }
});

app.post('/api/community/messages', async (req, res) => {
     try {
        const { channelId, userId, content, replyingToId } = req.body;
        await db.query(
            'INSERT INTO community_messages (channel_id, user_id, content, replying_to_message_id) VALUES (?, ?, ?, ?)',
            [channelId, userId, content, replyingToId || null]
        );
        res.status(201).json({ message: 'Mensaje enviado.' });
    } catch (error) {
        console.error("[POST MESSAGE] ERROR:", error);
        res.status(500).json({ message: "Error al enviar el mensaje." });
    }
});

app.put('/api/community/messages/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content, userId, userRole } = req.body;
        
        const [messages] = await db.query('SELECT user_id FROM community_messages WHERE id = ?', [messageId]);
        if (messages.length === 0) return res.status(404).json({ message: 'Mensaje no encontrado.' });

        const messageAuthorId = messages[0].user_id.toString();
        if (messageAuthorId !== userId && userRole !== 'dueño' && userRole !== 'moderador') {
            return res.status(403).json({ message: 'No tienes permiso para editar este mensaje.' });
        }
        
        await db.query(
            'UPDATE community_messages SET content = ?, edited = true WHERE id = ?',
            [content, messageId]
        );
        res.status(200).json({ message: 'Mensaje actualizado.' });
    } catch (error) {
        console.error("[EDIT MESSAGE] ERROR:", error);
        res.status(500).json({ message: "Error al editar el mensaje." });
    }
});

app.delete('/api/community/messages/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId, userRole } = req.body;
        
        const [messages] = await db.query('SELECT user_id FROM community_messages WHERE id = ?', [messageId]);
        if (messages.length === 0) return res.status(404).json({ message: 'Mensaje no encontrado.' });

        const messageAuthorId = messages[0].user_id.toString();
        if (messageAuthorId !== userId && userRole !== 'dueño' && userRole !== 'moderador') {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este mensaje.' });
        }
        
        await db.query('DELETE FROM community_messages WHERE id = ?', [messageId]);
        res.status(200).json({ message: 'Mensaje eliminado.' });
    } catch (error) {
        console.error("[DELETE MESSAGE] ERROR:", error);
        res.status(500).json({ message: "Error al eliminar el mensaje." });
    }
});

app.post('/api/community/messages/:messageId/react', async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userName, emoji } = req.body;

        const [messages] = await db.query('SELECT reactions FROM community_messages WHERE id = ?', [messageId]);
        if (messages.length === 0) return res.status(404).json({ message: 'Mensaje no encontrado.' });

        let reactions = messages[0].reactions ? JSON.parse(messages[0].reactions) : {};

        if (!reactions[emoji]) {
            reactions[emoji] = [];
        }

        const userIndex = reactions[emoji].findIndex((u) => u === userName);
        if (userIndex > -1) {
            reactions[emoji].splice(userIndex, 1);
            if (reactions[emoji].length === 0) {
                delete reactions[emoji];
            }
        } else {
            reactions[emoji].push(userName);
        }

        await db.query(
            'UPDATE community_messages SET reactions = ? WHERE id = ?',
            [JSON.stringify(reactions), messageId]
        );
        res.status(200).json({ message: 'Reacción actualizada.' });
    } catch (error) {
        console.error("[REACT MESSAGE] ERROR:", error);
        res.status(500).json({ message: "Error al reaccionar al mensaje." });
    }
});


// --- Contact & Admin Panel Endpoints ---
const checkAdminRole = (role, requiredRole) => {
    if (requiredRole === 'dueño') return role === 'dueño';
    if (requiredRole === 'moderador') return role === 'dueño' || role === 'moderador';
    return false;
};

const authAdmin = async (req, res, requiredRole) => {
    const adminUserId = req.query.adminUserId || req.body.adminUserId;
    if (!adminUserId) {
        res.status(401).json({ message: 'Se requiere autenticación de administrador.' });
        return false;
    }
    try {
        const [admins] = await db.query('SELECT role FROM users WHERE id = ?', [adminUserId]);
        if (admins.length === 0 || !checkAdminRole(admins[0].role, requiredRole)) {
            res.status(403).json({ message: 'Acceso denegado.' });
            return false;
        }
        return true;
    } catch (error) {
        res.status(500).json({ message: 'Error de servidor al verificar permisos.' });
        return false;
    }
};

app.get('/api/admin/users', async (req, res) => {
    if (!await authAdmin(req, res, 'dueño')) return;
    try {
        const [users] = await db.query('SELECT * FROM users ORDER BY name ASC');
        res.json(users.map(formatUserForFrontend));
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios.' });
    }
});

app.get('/api/admin/users/:id', async (req, res) => {
    if (!await authAdmin(req, res, 'dueño')) return;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if(users.length === 0) return res.status(404).json({message: 'Usuario no encontrado'});
        res.json(formatUserForFrontend(users[0]));
    } catch(error) {
        res.status(500).json({ message: 'Error al obtener usuario.' });
    }
});

app.put('/api/admin/users/:id', async (req, res) => {
    if (!await authAdmin(req, res, 'dueño')) return;
    try {
        const { id } = req.params;
        const { name, role, points } = req.body;
        await db.query('UPDATE users SET name = ?, role = ?, points = ? WHERE id = ?', [name, role, points, id]);
        res.status(200).json({ message: 'Usuario actualizado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario.' });
    }
});

app.delete('/api/admin/users/:id', async (req, res) => {
    if (!await authAdmin(req, res, 'dueño')) return;
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Usuario eliminado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario.' });
    }
});

app.put('/api/admin/users/:id/achievements', async (req, res) => {
    if (!await authAdmin(req, res, 'dueño')) return;
    try {
        const { id } = req.params;
        const { achievementId, unlocked } = req.body;
        const [users] = await db.query('SELECT unlocked_achievements FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });
        
        let unlockedIds = new Set(users[0].unlocked_achievements ? JSON.parse(users[0].unlocked_achievements) : []);
        if (unlocked) unlockedIds.add(achievementId);
        else unlockedIds.delete(achievementId);
        
        await db.query('UPDATE users SET unlocked_achievements = ? WHERE id = ?', [JSON.stringify(Array.from(unlockedIds)), id]);
        res.status(200).json({ message: 'Logros actualizados.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar logros.' });
    }
});


app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        console.log(`[CONTACT] Nuevo mensaje de ${name} (${email}). Asunto: ${subject}`);
        await db.query(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );
        console.log('[CONTACT] Mensaje guardado en la DB.');
        res.status(201).json({ message: 'Mensaje enviado exitosamente.' });
    } catch (error) {
        console.error("[CONTACT] ERROR:", error);
        res.status(500).json({ message: "Error al enviar el mensaje." });
    }
});

app.get('/api/admin/messages', async (req, res) => {
    try {
        const [messages] = await db.query('SELECT * FROM contact_messages ORDER BY submitted_at DESC');
        res.json(messages);
    } catch (error) {
        console.error("[GET ADMIN MESSAGES] ERROR:", error);
        res.status(500).json({ message: "Error al obtener mensajes." });
    }
});
app.put('/api/admin/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
        res.status(200).json({ message: 'Status updated' });
    } catch (error) {
         res.status(500).json({ message: "Error al actualizar mensaje." });
    }
});
app.get('/api/admin/reports', async (req, res) => {
    try {
        const [reports] = await db.query(
            `SELECT r.*, u.name as userName, u.email as userEmail, l.name as locationName 
             FROM reports r JOIN users u ON r.user_id = u.id 
             JOIN locations l ON r.location_id = l.id 
             ORDER BY r.reported_at DESC`
        );
        res.json(reports);
    } catch (error) {
        console.error("[GET ADMIN REPORTS] ERROR:", error);
        res.status(500).json({ message: "Error al obtener reportes." });
    }
});
app.put('/api/admin/reports/:id', async (req, res) => {
     try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query('UPDATE reports SET status = ? WHERE id = ?', [status, id]);
        res.status(200).json({ message: 'Status updated' });
    } catch (error) {
         res.status(500).json({ message: "Error al actualizar reporte." });
    }
});

app.post('/api/admin/reply', async (req, res) => {
    const { to, subject, body, adminUserId } = req.body;
    console.log('\n[ADMIN REPLY] Solicitud de respuesta recibida.');

    if (!to || !subject || !body) {
        console.log('[ADMIN REPLY] Error: Faltan campos (to, subject, body).');
        return res.status(400).json({ message: 'Faltan campos requeridos para enviar la respuesta.' });
    }
    
    // --- SIMULACIÓN DE ENVÍO DE EMAIL ---
    console.log('****************************************************');
    console.log('***           SIMULANDO ENVÍO DE EMAIL           ***');
    console.log('****************************************************');
    console.log(`DE: noreply@ecogestion.com`);
    console.log(`PARA: ${to}`);
    console.log(`ASUNTO: ${subject}`);
    console.log('-------------------- CUERPO --------------------');
    console.log(body);
    console.log('------------------------------------------------');
    console.log(`(Respuesta enviada por Admin ID: ${adminUserId || 'No especificado'})`);
    console.log('****************************************************');
    // --- FIN DE SIMULACIÓN ---

    res.status(200).json({ message: 'Respuesta enviada exitosamente (simulación).' });
});

// --- Impact Stats Endpoints ---
app.get('/api/impact-stats', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM impact_stats WHERE id = 1');
        
        if (rows.length === 0) {
            console.warn("[GET IMPACT STATS] Fila no encontrada. Creando...");
            await db.query(`INSERT INTO \`impact_stats\` (\`id\`, \`recycled_kg\`, \`participants\`, \`points\`) VALUES (1, 14800, 5350, 48) ON DUPLICATE KEY UPDATE id=1;`);
            const [newRows] = await db.query('SELECT * FROM impact_stats WHERE id = 1');
            res.json({ recycledKg: newRows[0].recycled_kg, participants: newRows[0].participants, points: newRows[0].points });
            return;
        }

        const stats = rows[0];
        res.json({
            recycledKg: stats.recycled_kg,
            participants: stats.participants,
            points: stats.points
        });
    } catch (error) {
        console.error("[GET IMPACT STATS] ERROR:", error);
        res.status(500).json({ message: "Error al obtener las estadísticas." });
    }
});


app.put('/api/impact-stats', isAdmin, async (req, res) => {
    try {
        const { recycledKg, participants, points } = req.body;
        if (recycledKg === undefined || participants === undefined || points === undefined) {
            return res.status(400).json({ message: 'Todos los campos de estadísticas son requeridos.' });
        }
        const [result] = await db.query(
            'UPDATE impact_stats SET recycled_kg = ?, participants = ?, points = ? WHERE id = 1',
            [recycledKg, participants, points]
        );

        if (result.affectedRows === 0) {
            throw new Error("La fila de estadísticas no se encontró en la base de datos para actualizar. Intenta reiniciar el servidor.");
        }

        res.status(200).json({ message: 'Estadísticas actualizadas correctamente.' });
    } catch (error) {
        console.error("[UPDATE IMPACT STATS] ERROR:", error);
        res.status(500).json({ message: "Error al actualizar las estadísticas." });
    }
});


// --- Recycling Guide Endpoint ---
app.get('/api/recycling-guides', async (req, res) => {
    res.json(comoReciclarData);
});

// --- Start Server ---
const startServer = async () => {
    try {
        console.log('⏳ Inicializando la base de datos...');
        await initializeDatabase();
        
        app.listen(port, () => {
            console.log(`🚀 Servidor de EcoGestión escuchando en http://localhost:${port}`);
            console.log('✅ Base de datos y servidor listos.');
        });
    } catch (error) {
        console.error('❌ FATAL: No se pudo iniciar el servidor. La inicialización de la base de datos falló.');
        process.exit(1);
    }
};

startServer();
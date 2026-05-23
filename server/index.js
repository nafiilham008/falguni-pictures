const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const pool = require('./db');
const { verifyToken, JWT_SECRET } = require('./auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Media Proxy Route to bypass Internet Positif blocking for CF R2 .r2.dev domains
app.get('/api/media/*', async (req, res) => {
    try {
        const fileKey = req.params[0];
        if (!fileKey) {
            return res.status(400).send('Missing file key');
        }

        const getParams = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
        };

        const response = await s3Client.send(new GetObjectCommand(getParams));

        // Set Content-Type and Content-Length
        if (response.ContentType) {
            res.setHeader('Content-Type', response.ContentType);
        }
        if (response.ContentLength) {
            res.setHeader('Content-Length', response.ContentLength);
        }

        // Cache for 1 year (static media assets are immutable)
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

        // Stream body to client
        response.Body.pipe(res);
    } catch (err) {
        console.error(`Failed to fetch media proxy for key ${req.params[0]}:`, err.message);
        res.status(404).send('Media not found');
    }
});

// R2 Configuration
const s3Client = new S3Client({
    region: process.env.R2_REGION || 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

// Multer Setup (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// --- Admin Initialization ---
// Ensures there is at least one admin user
async function initializeAdmin() {
    try {
        const res = await pool.query("SELECT * FROM admin_users WHERE username = 'admin'");
        if (res.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(
                "INSERT INTO admin_users (username, password_hash) VALUES ('admin', $1)",
                [hashedPassword]
            );
            console.log('✅ Default admin account created (admin / admin123)');
        }
    } catch (err) {
        console.error('Failed to initialize admin account:', err.message);
    }
}
initializeAdmin();

// Routes Placeholder

// 0. Auth Routes
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const userResult = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }
        
        const user = userResult.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }
        
        // Generate Token (Valid for 24 hours)
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ success: true, token });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send('Server Error');
    }
});

// 1. Analytics Routes
app.post('/api/analytics', async (req, res) => {
    try {
        const { event_type, theme, metadata } = req.body;
        const result = await pool.query(
            'INSERT INTO analytics (event_type, theme, metadata) VALUES ($1, $2, $3) RETURNING *',
            [event_type, theme, metadata]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 2. Events Routes
app.get('/api/events', async (req, res) => {
    try {
        const { theme } = req.query;
        let query = `
            SELECT e.id, e.title, e.theme, e.category,
                   COALESCE(json_agg(json_build_object('id', ei.id, 'url', ei.url, 'is_cover', ei.is_cover)) FILTER (WHERE ei.id IS NOT NULL), '[]') as images
            FROM events e
            LEFT JOIN event_images ei ON e.id = ei.event_id
        `;
        let params = [];

        if (theme) {
            query += ' WHERE e.theme = $1 ';
            params.push(theme);
        }
        
        query += ' GROUP BY e.id ORDER BY e.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Protected Event Routes (Requires JWT)
app.post('/api/events', verifyToken, async (req, res) => {
    try {
        const { title, theme, category, images } = req.body;
        
        await pool.query('BEGIN');
        
        const eventResult = await pool.query(
            'INSERT INTO events (title, theme, category) VALUES ($1, $2, $3) RETURNING *',
            [title, theme, category || null]
        );
        const eventId = eventResult.rows[0].id;
        
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                await pool.query(
                    'INSERT INTO event_images (event_id, url, is_cover) VALUES ($1, $2, $3)',
                    [eventId, images[i].url, images[i].is_cover || false]
                );
            }
        }
        
        await pool.query('COMMIT');
        res.status(201).json({ success: true, eventId });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/api/events/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Fetch all images for this event to delete from R2
        const imagesResult = await pool.query('SELECT url FROM event_images WHERE event_id = $1', [id]);
        
        // Delete from R2
        for (const row of imagesResult.rows) {
            try {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: row.url
                }));
            } catch (err) {
                console.error(`Failed to delete ${row.url} from R2:`, err);
            }
        }

        // Delete from DB (event_images will be CASCADE deleted)
        await pool.query('DELETE FROM events WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.put('/api/events/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, theme, category } = req.body;
        
        await pool.query(
            'UPDATE events SET title = $1, theme = $2, category = $3 WHERE id = $4',
            [title, theme, category || null, id]
        );
        
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get distinct portrait categories (for filter tabs)
app.get('/api/portrait-categories', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT category FROM events 
            WHERE theme = 'portrait' AND category IS NOT NULL 
            ORDER BY category ASC
        `);
        res.json(result.rows.map(r => r.category));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Append new images to an existing event
app.post('/api/events/:eventId/images', verifyToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { images } = req.body;
        
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                await pool.query(
                    'INSERT INTO event_images (event_id, url, is_cover) VALUES ($1, $2, $3)',
                    [eventId, images[i].url, images[i].is_cover || false]
                );
            }
        }
        res.status(201).json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 4. PACKAGES API
// ==========================================
app.get('/api/packages', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM packages ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/packages', verifyToken, async (req, res) => {
    try {
        const { theme, name, tag, features, is_popular } = req.body;
        const result = await pool.query(
            'INSERT INTO packages (theme, name, tag, features, is_popular) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [theme, name, tag || '', JSON.stringify(features), is_popular || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.put('/api/packages/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { theme, name, tag, features, is_popular } = req.body;
        const result = await pool.query(
            'UPDATE packages SET theme = $1, name = $2, tag = $3, features = $4, is_popular = $5 WHERE id = $6 RETURNING *',
            [theme, name, tag || '', JSON.stringify(features), is_popular || false, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/api/packages/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM packages WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 5. TESTIMONIALS API
// ==========================================
app.get('/api/testimonials', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM testimonials ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/testimonials', verifyToken, async (req, res) => {
    try {
        const { client_name, role, review, rating } = req.body;
        const result = await pool.query(
            'INSERT INTO testimonials (client_name, role, review, rating) VALUES ($1, $2, $3, $4) RETURNING *',
            [client_name, role, review, rating || 5]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.put('/api/testimonials/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { client_name, role, review, rating } = req.body;
        const result = await pool.query(
            'UPDATE testimonials SET client_name = $1, role = $2, review = $3, rating = $4 WHERE id = $5 RETURNING *',
            [client_name, role, review, rating || 5, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/api/testimonials/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM testimonials WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 6. BOOKING LOGS API
// ==========================================
app.get('/api/bookings', verifyToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bookings ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const { client_name, event, event_date, message, location, theme_ref, instagram } = req.body;
        const result = await pool.query(
            'INSERT INTO bookings (client_name, event, event_date, message, location, theme_ref, instagram) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [client_name, event, event_date, message, location || null, theme_ref || null, instagram || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.delete('/api/bookings/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.put('/api/bookings/:id/status', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Set a specific image as the cover
app.put('/api/events/:eventId/images/:imageId/cover', verifyToken, async (req, res) => {
    try {
        const { eventId, imageId } = req.params;
        
        // Start a transaction
        await pool.query('BEGIN');
        
        // Remove cover from all images in this event
        await pool.query('UPDATE event_images SET is_cover = FALSE WHERE event_id = $1', [eventId]);
        
        // Set the specified image as cover
        await pool.query('UPDATE event_images SET is_cover = TRUE WHERE id = $1 AND event_id = $2', [imageId, eventId]);
        
        await pool.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Failed to set cover image:', err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a specific image from an event and R2
app.delete('/api/events/:eventId/images/:imageId', verifyToken, async (req, res) => {
    try {
        const { eventId, imageId } = req.params;
        
        // 1. Get the image URL from the database
        const imageResult = await pool.query('SELECT url FROM event_images WHERE id = $1 AND event_id = $2', [imageId, eventId]);
        if (imageResult.rows.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }
        const fileKey = imageResult.rows[0].url; // e.g. 'assets/media/upload_...webp'
        
        // 2. Delete from Cloudflare R2
        try {
            const deleteParams = {
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileKey,
            };
            await s3Client.send(new DeleteObjectCommand(deleteParams));
        } catch (r2Error) {
            console.error('Failed to delete from R2 (continuing with DB deletion):', r2Error);
        }

        // 3. Delete from Database
        await pool.query('DELETE FROM event_images WHERE id = $1', [imageId]);
        
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 3. Upload API (Protected)
app.post('/api/upload', verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        let fileBuffer = file.buffer;
        let mimeType = file.mimetype;
        let ext = file.originalname.split('.').pop().toLowerCase();
        
        // Auto Convert image to WebP (skip mp4 and already webp)
        if (mimeType.startsWith('image/') && ext !== 'webp') {
            try {
                fileBuffer = await sharp(file.buffer)
                    .webp({ quality: 80 })
                    .toBuffer();
                mimeType = 'image/webp';
                ext = 'webp';
            } catch (sharpErr) {
                console.error("WebP conversion failed, using original:", sharpErr);
            }
        }

        // Generate unique filename
        const fileName = `assets/media/upload_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

        const uploadParams = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer,
            ContentType: mimeType,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Return the path so frontend can save it to DB
        // The frontend uses getAssetUrl(path) which expects 'assets/media/...'
        res.status(200).json({ 
            success: true, 
            path: fileName 
        });

    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Failed to upload to Cloudflare R2' });
    }
});

// Delete an orphaned upload from R2 (before saving event)
app.delete('/api/upload', verifyToken, async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) return res.status(400).json({ error: 'Missing file key' });
        
        const deleteParams = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
        
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to delete orphaned upload:', err);
        res.status(500).json({ error: 'Failed to delete from Cloudflare R2' });
    }
});

// ==========================================
// 7. SETTINGS & SECURITY API
// ==========================================
// Public endpoint to get settings (used for WA number)
app.get('/api/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT setting_key, setting_value FROM site_settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Protected endpoint to update settings
app.put('/api/settings', verifyToken, async (req, res) => {
    try {
        const updates = req.body; // e.g. { whatsapp_number: '628...' }
        for (const [key, value] of Object.entries(updates)) {
            await pool.query(
                `INSERT INTO site_settings (setting_key, setting_value, updated_at) 
                 VALUES ($1, $2, CURRENT_TIMESTAMP) 
                 ON CONFLICT (setting_key) 
                 DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP`,
                [key, value]
            );
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Admin Password
app.put('/api/admin/password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Use user id 1 (the default admin). In a real multi-user system, get ID from token.
        // Assuming user 1 is our main admin:
        const userRes = await pool.query("SELECT * FROM admin_users WHERE username = 'admin'");
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'Admin not found' });
        
        const user = userRes.rows[0];
        
        const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Password lama salah!' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            "UPDATE admin_users SET password_hash = $1 WHERE id = $2",
            [hashedPassword, user.id]
        );
        
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 8. ANALYTICS API
// ==========================================

// Track a new event (e.g., page view) - Public
app.post('/api/analytics', async (req, res) => {
    try {
        const { event_type, theme, metadata } = req.body;
        await pool.query(
            "INSERT INTO analytics (event_type, theme, metadata) VALUES ($1, $2, $3)",
            [event_type, theme, metadata || {}]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Analytics Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// Get stats for Dashboard - Protected
app.get('/api/analytics/stats', verifyToken, async (req, res) => {
    try {
        // Get total page views
        const viewsRes = await pool.query("SELECT COUNT(*) FROM analytics WHERE event_type = 'page_view'");
        const totalViews = parseInt(viewsRes.rows[0].count);

        // Get sport theme views
        const sportRes = await pool.query("SELECT COUNT(*) FROM analytics WHERE event_type = 'page_view' AND theme = 'sport'");
        const sportViews = parseInt(sportRes.rows[0].count);

        // Get wedding theme views
        const weddingRes = await pool.query("SELECT COUNT(*) FROM analytics WHERE event_type = 'page_view' AND theme = 'wedding'");
        const weddingViews = parseInt(weddingRes.rows[0].count);

        // Get total portfolio items
        const eventsRes = await pool.query("SELECT COUNT(*) FROM events");
        const totalEvents = parseInt(eventsRes.rows[0].count);

        // Get total bookings
        const bookingsRes = await pool.query("SELECT COUNT(*) FROM bookings");
        const totalBookings = parseInt(bookingsRes.rows[0].count);

        // Get Top Content
        const topContentRes = await pool.query(`
            SELECT 
                metadata->>'title' as title, 
                COUNT(*) as views 
            FROM analytics 
            WHERE event_type = 'view_event' 
            GROUP BY metadata->>'title' 
            ORDER BY views DESC 
            LIMIT 5
        `);
        const topContent = topContentRes.rows.map(row => ({
            title: row.title,
            views: parseInt(row.views)
        }));

        res.json({
            totalViews,
            sportViews,
            weddingViews,
            totalEvents,
            totalBookings,
            topContent
        });
    } catch (err) {
        console.error("Stats Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// Global Search - Protected
app.get('/api/search', verifyToken, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    const searchTerm = `%${q}%`;
    
    try {
        const result = await pool.query(`
            SELECT 'booking' as type, id, client_name as title, message as description, created_at 
            FROM bookings 
            WHERE client_name ILIKE $1 OR event ILIKE $1
            
            UNION ALL
            
            SELECT 'portfolio' as type, id, title as title, theme as description, created_at 
            FROM events 
            WHERE title ILIKE $1 OR theme ILIKE $1
            
            UNION ALL
            
            SELECT 'testimonial' as type, id, client_name as title, review as description, created_at 
            FROM testimonials 
            WHERE client_name ILIKE $1 OR review ILIKE $1
            
            ORDER BY created_at DESC
            LIMIT 15
        `, [searchTerm]);
        
        res.json(result.rows);
    } catch (err) {
        console.error("Search Error:", err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/api/health', (req, res) => {
    res.send('Backend API is running!');
});

app.get('/api/debug-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0].now, env: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            hasPassword: !!process.env.DB_PASSWORD,
            nodeEnv: process.env.NODE_ENV,
            vercel: process.env.VERCEL
        } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, stack: err.stack, env: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            hasPassword: !!process.env.DB_PASSWORD,
            nodeEnv: process.env.NODE_ENV,
            vercel: process.env.VERCEL
        } });
    }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;

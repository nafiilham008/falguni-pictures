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
app.get(/\/api\/media\/(.*)/, async (req, res) => {
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
        const keyParam = req.params.key;
        const fileKey = Array.isArray(keyParam) ? keyParam.join('/') : keyParam;
        console.error(`Failed to fetch media proxy for key ${fileKey}:`, err.message);
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

// --- Admin Initialization & Migrations ---
// Ensures tables exist and there is at least one admin user
async function initializeDatabase() {
    try {
        // Run migrations
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                link VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Init admin
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
        console.error('Failed to initialize database/admin:', err.message);
    }
}
initializeDatabase();

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
        const { theme, name, tag, features, is_popular, category } = req.body;
        const result = await pool.query(
            'INSERT INTO packages (theme, name, tag, features, is_popular, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [theme, name, tag || '', JSON.stringify(features), is_popular || false, category || 'wedding']
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
        const { theme, name, tag, features, is_popular, category } = req.body;
        const result = await pool.query(
            'UPDATE packages SET theme = $1, name = $2, tag = $3, features = $4, is_popular = $5, category = $6 WHERE id = $7 RETURNING *',
            [theme, name, tag || '', JSON.stringify(features), is_popular || false, category || 'wedding', id]
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

// Public: Get all approved testimonials
app.get('/api/testimonials', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM testimonials WHERE is_approved = true AND review IS NOT NULL ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin: Get all testimonials (including pending)
app.get('/api/admin/testimonials', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.*, b.client_name as booking_client, b.event as booking_event 
            FROM testimonials t
            LEFT JOIN bookings b ON t.booking_id = b.id
            ORDER BY t.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin: Generate review link for a booking
app.post('/api/testimonials/generate-link', verifyToken, async (req, res) => {
    try {
        const { booking_id } = req.body;
        const crypto = require('crypto');
        const token = crypto.randomBytes(16).toString('hex');
        
        // Get booking info
        const bookingRes = await pool.query('SELECT client_name FROM bookings WHERE id = $1', [booking_id]);
        if (bookingRes.rows.length === 0) return res.status(404).send('Booking not found');
        
        const client_name = bookingRes.rows[0].client_name;

        // Check if token already exists for this booking, if so replace or return it
        const exist = await pool.query('SELECT * FROM testimonials WHERE booking_id = $1', [booking_id]);
        
        if (exist.rows.length > 0) {
            // Already has a row, update token if it doesn't have a review yet
            if (exist.rows[0].review) {
                return res.status(400).json({ error: 'Review already submitted for this booking' });
            }
            await pool.query('UPDATE testimonials SET token = $1 WHERE id = $2', [token, exist.rows[0].id]);
        } else {
            // Create pending testimonial row
            await pool.query(
                'INSERT INTO testimonials (booking_id, token, client_name, review) VALUES ($1, $2, $3, $4)',
                [booking_id, token, client_name, '']
            );
        }
        
        res.json({ token, url: `/review/${token}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Public: Get review context by token
app.get('/api/testimonials/review/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const result = await pool.query(`
            SELECT t.id, t.client_name, b.event as booking_event, t.review
            FROM testimonials t
            LEFT JOIN bookings b ON t.booking_id = b.id
            WHERE t.token = $1
        `, [token]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'Invalid or expired token' });
        if (result.rows[0].review && result.rows[0].review.length > 0) return res.status(400).json({ error: 'Review already submitted' });
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Public: Submit a review with image
app.post('/api/testimonials/submit', upload.single('image'), async (req, res) => {
    try {
        const { token, review, rating, role, client_name } = req.body;
        
        const tstRes = await pool.query('SELECT * FROM testimonials WHERE token = $1', [token]);
        if (tstRes.rows.length === 0) return res.status(404).json({ error: 'Invalid token' });
        
        const tst = tstRes.rows[0];
        if (tst.review && tst.review.length > 0) return res.status(400).json({ error: 'Review already submitted' });

        let imageUrl = null;
        if (req.file) {
            // Convert to webp
            const webpBuffer = await sharp(req.file.buffer).webp({ quality: 80 }).toBuffer();
            const fileName = `assets/media/review_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
            
            const uploadParams = {
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
                Body: webpBuffer,
                ContentType: 'image/webp',
            };
            await s3Client.send(new PutObjectCommand(uploadParams));
            imageUrl = fileName;
        }

        // Update testimonial
        const updateRes = await pool.query(
            `UPDATE testimonials 
             SET review = $1, rating = $2, role = $3, image_url = $4, token = NULL, client_name = $5
             WHERE id = $6 RETURNING *`,
            [review, rating || 5, role || '', imageUrl, client_name || tst.client_name, tst.id]
        );

        // Add Notification
        await pool.query(
            'INSERT INTO notifications (type, message, is_read) VALUES ($1, $2, $3)',
            ['testimonial', `New testimonial received from ${client_name || tst.client_name}`, false]
        );

        res.json({ success: true, testimonial: updateRes.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin: Approve, Reject, or Edit testimonial
app.put('/api/testimonials/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { client_name, role, review, rating, is_approved } = req.body;
        const result = await pool.query(
            'UPDATE testimonials SET client_name = $1, role = $2, review = $3, rating = $4, is_approved = $5 WHERE id = $6 RETURNING *',
            [client_name, role, review, rating || 5, is_approved || false, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin: Delete Testimonial
app.delete('/api/testimonials/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const getRes = await pool.query('SELECT image_url FROM testimonials WHERE id = $1', [id]);
        
        if (getRes.rows.length > 0 && getRes.rows[0].image_url) {
            try {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: getRes.rows[0].image_url,
                }));
            } catch (err) {
                console.error("Failed to delete image from R2:", err.message);
            }
        }
        
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
        
        // Create Notification
        const newBooking = result.rows[0];
        await pool.query(
            "INSERT INTO notifications (title, message, type, link) VALUES ($1, $2, $3, $4)",
            ['New Booking Received', `New booking from ${client_name} for ${event}.`, 'booking', '/dashboard/bookings']
        );

        res.status(201).json(newBooking);
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

app.get('/api/bookings/approved', verifyToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM bookings WHERE status = 'approved' ORDER BY event_date ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 6.5 NOTIFICATIONS API
// ==========================================
app.get('/api/notifications', verifyToken, async (req, res) => {
    try {
        // Evaluate upcoming approved bookings to generate reminders
        const upcomingBookings = await pool.query(`
            SELECT * FROM bookings 
            WHERE status = 'approved' 
            AND event_date >= CURRENT_DATE 
            AND event_date < CURRENT_DATE + INTERVAL '2 days'
        `);
        
        for (let b of upcomingBookings.rows) {
            const isToday = new Date(b.event_date).toDateString() === new Date().toDateString();
            const reminderTitle = isToday ? 'Booking Today!' : 'Booking Tomorrow!';
            const reminderMsg = `${b.client_name} - ${b.event} is ${isToday ? 'happening today' : 'coming up tomorrow'}!`;
            
            const check = await pool.query(
                "SELECT * FROM notifications WHERE link = $1 AND title = $2",
                [`/dashboard/bookings?id=${b.id}`, reminderTitle]
            );
            if (check.rows.length === 0) {
                await pool.query(
                    "INSERT INTO notifications (title, message, type, link) VALUES ($1, $2, $3, $4)",
                    [reminderTitle, reminderMsg, 'reminder', `/dashboard/bookings?id=${b.id}`]
                );
            }
        }

        const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.put('/api/notifications/:id/read', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.put('/api/notifications/read-all', verifyToken, async (req, res) => {
    try {
        await pool.query('UPDATE notifications SET is_read = TRUE');
        res.json({ success: true });
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

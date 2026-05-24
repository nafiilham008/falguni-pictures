-- Create tables for Falguni Picture Dashboard

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    theme VARCHAR(50) NOT NULL, -- 'sport' or 'wedding'
    category VARCHAR(50) DEFAULT NULL, -- portrait sub-category: wisuda/wedding/prewed/family/others
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT events_title_theme_unique UNIQUE (title, theme)
);

CREATE TABLE IF NOT EXISTS event_images (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL, -- e.g., 'page_view', 'theme_switch', 'view_event'
    theme VARCHAR(50), -- 'sport' or 'wedding' (optional context)
    metadata JSONB, -- For extra info
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default admin (password: admin123, you MUST change this later)
-- Using a simple bcrypt hash for 'admin123' -> $2b$10$w3e0A3... (Replace later in code)
-- For now we'll just handle it in nodejs script or leave it empty and create a setup route.

CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    theme VARCHAR(50) NOT NULL, -- 'sport' or 'portrait'
    name VARCHAR(255) NOT NULL,
    tag VARCHAR(100), -- Optional promo badge e.g. '🔥 Best Seller'
    features JSONB NOT NULL, -- Array of strings
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    review TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    event VARCHAR(255) NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE,
    message TEXT,
    location VARCHAR(255),
    theme_ref VARCHAR(255),
    instagram VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending' or 'approved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'booking', 'reminder'
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings if not exists
INSERT INTO site_settings (setting_key, setting_value) VALUES ('whatsapp_number', '6282136009894') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('instagram_username', 'falgunipicture') ON CONFLICT (setting_key) DO NOTHING;

-- Spotlight & Visuals settings
INSERT INTO site_settings (setting_key, setting_value) VALUES ('portrait_spotlight', 'wisuda') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('hero_image_sport', '') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('hero_image_wisuda', '') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('hero_image_wedding', '') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('hero_image_prewed', '') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('hero_image_family', '') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('hero_image_engagement', '') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('about_image_sport', '') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('about_image_wisuda', '') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('about_image_wedding', '') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('about_image_prewed', '') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('about_image_family', '') ON CONFLICT (setting_key) DO NOTHING;
INSERT INTO site_settings (setting_key, setting_value) VALUES ('about_image_engagement', '') ON CONFLICT (setting_key) DO NOTHING;
